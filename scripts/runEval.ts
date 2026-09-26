import "./loadEnv";
import { runEval } from "../src/eval/runEval";
import { EVAL_CASES } from "../src/eval/testCases";

async function main() {
  const summary = await runEval(EVAL_CASES);

  console.log("\n=== Per-case results ===\n");
  for (const c of summary.perCase) {
    console.log(`"${c.text}"`);
    console.log(`  precision: ${c.precision.toFixed(2)}  recall: ${c.recall.toFixed(2)}`);
    if (c.falsePositives.length) {
      console.log(`  false positives: ${c.falsePositives.join(", ")}`);
    }
    if (c.falseNegatives.length) {
      console.log(`  false negatives (missed): ${c.falseNegatives.join(", ")}`);
    }
    console.log("");
  }

  console.log("=== Overall ===");
  console.log(`Precision: ${summary.overallPrecision.toFixed(3)}`);
  console.log(`Recall:    ${summary.overallRecall.toFixed(3)}`);
  console.log(`F1:        ${summary.overallF1.toFixed(3)}`);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});