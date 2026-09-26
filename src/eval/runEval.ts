import { retrieveRelevantRulesWithScores } from "@/lib/vectorStore";
import { EvalCase } from "./testCases";

// Must match the userId that scripts/seedRules.ts stored the eval fixture rules under.
const EVAL_USER_ID = process.env.SEED_USER_ID || "seed-user";

export interface EvalCaseResult {
  text: string;
  expected: string[];
  retrieved: string[];
  truePositives: string[];
  falsePositives: string[];
  falseNegatives: string[];
  precision: number;
  recall: number;
}

export interface EvalSummary {
  perCase: EvalCaseResult[];
  overallPrecision: number;
  overallRecall: number;
  overallF1: number;
}

function scoreCase(expected: string[], retrieved: string[]): {
  truePositives: string[];
  falsePositives: string[];
  falseNegatives: string[];
} {
  // Dedupe before scoring: a duplicate retrieved rule (e.g. stale data with
  // repeated documents) must never count more than once toward precision/recall.
  const uniqueRetrieved = Array.from(new Set(retrieved));
  const truePositives = uniqueRetrieved.filter((r) => expected.includes(r));
  const falsePositives = uniqueRetrieved.filter((r) => !expected.includes(r));
  const falseNegatives = expected.filter((e) => !uniqueRetrieved.includes(e));
  return { truePositives, falsePositives, falseNegatives };
}

export async function runEval(cases: EvalCase[]): Promise<EvalSummary> {
  const perCase: EvalCaseResult[] = [];

  // Running totals across all cases, for a "micro-averaged" overall score —
  // weights every individual rule-match equally, rather than every test case equally.
  let totalTP = 0;
  let totalFP = 0;
  let totalFN = 0;

  for (const testCase of cases) {
    const scored = await retrieveRelevantRulesWithScores(testCase.text, EVAL_USER_ID);
    const retrieved = scored.map((s) => s.rule.text);

    const { truePositives, falsePositives, falseNegatives } = scoreCase(
      testCase.expectedRules,
      retrieved
    );

    totalTP += truePositives.length;
    totalFP += falsePositives.length;
    totalFN += falseNegatives.length;

    const precision =
      retrieved.length === 0 ? 1 : truePositives.length / retrieved.length;
    const recall =
      testCase.expectedRules.length === 0
        ? 1
        : truePositives.length / testCase.expectedRules.length;

    perCase.push({
      text: testCase.text,
      expected: testCase.expectedRules,
      retrieved,
      truePositives,
      falsePositives,
      falseNegatives,
      precision,
      recall
    });
  }

  const overallPrecision = totalTP + totalFP === 0 ? 1 : totalTP / (totalTP + totalFP);
  const overallRecall = totalTP + totalFN === 0 ? 1 : totalTP / (totalTP + totalFN);
  const overallF1 =
    overallPrecision + overallRecall === 0
      ? 0
      : (2 * overallPrecision * overallRecall) / (overallPrecision + overallRecall);

  return { perCase, overallPrecision, overallRecall, overallF1 };
}