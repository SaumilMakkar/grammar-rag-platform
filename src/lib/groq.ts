import Groq from "groq-sdk";
import { StyleRule, CorrectionResponse } from "@/types";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = process.env.GROQ_MODEL || "llama-3.1-8b-instant";

function buildSystemPrompt(rules: StyleRule[], tone?: string, translateTo?: string) {
  const ruleBlock = rules.length
    ? rules.map((r, i) => `${i + 1}. ${r.text}`).join("\n")
    : "None on file yet — use general professional writing conventions.";

  return `You are a precise writing assistant. Fix grammar, spelling, and clarity issues in the user's text.

Custom style rules retrieved for this text (you MUST follow these; they override generic style):
${ruleBlock}

${tone ? `Target tone: ${tone}.` : ""}
${translateTo ? `After correcting, also provide a translation into ${translateTo}.` : ""}

Respond ONLY as JSON, no markdown fences, matching exactly:
{
  "corrected": "the corrected text",
  "explanation": "1-2 sentence summary of what changed and why",
  "appliedRules": ["exact text of any rules above that you actually applied"]${
    translateTo ? ',\n  "translated": "translated version of the corrected text"' : ""
  }
}`;
}

export async function correctText(
  text: string,
  rules: StyleRule[],
  tone?: string,
  translateTo?: string
): Promise<CorrectionResponse> {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    messages: [
      { role: "system", content: buildSystemPrompt(rules, tone, translateTo) },
      { role: "user", content: text }
    ]
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    return JSON.parse(cleaned) as CorrectionResponse;
  } catch {
    // Fallback: return the raw text uncorrected rather than crashing the request
    return {
      corrected: text,
      explanation: "Model returned an unparseable response; showing original text.",
      appliedRules: []
    };
  }
}
function buildStreamingSystemPrompt(rules: StyleRule[], tone?: string, translateTo?: string) {
  const ruleBlock = rules.length
    ? rules.map((r, i) => `${i + 1}. ${r.text}`).join("\n")
    : "None on file yet — use general professional writing conventions.";

  return `You are a precise writing assistant. Fix grammar, spelling, and clarity issues in the user's text.

Custom style rules retrieved for this text (you MUST follow these; they override generic style):
${ruleBlock}

${tone ? `Target tone: ${tone}.` : ""}
${translateTo ? `Also provide a translation into ${translateTo}, included in the metadata below.` : ""}

Output format (follow EXACTLY):
1. Write ONLY the corrected text — plain text, no quotes, no JSON, no preamble.
2. Then on its own line, write exactly: ===META===
3. Then a single JSON object (no markdown fences):
{
  "explanation": "1-2 sentence summary of what changed and why",
  "appliedRules": ["exact text of any rules above that you actually applied"]${
    translateTo ? ',\n  "translated": "translated version of the corrected text"' : ""
  }
}`;
}

export interface RuleValidation {
  valid: boolean;
  reason?: string;
}

// Guards against garbage/irrelevant rule text before it's embedded and stored —
// a length or regex check can't tell "banana" from a real style rule, but the
// model can judge in one cheap call whether it reads as an actual writing instruction.
export async function validateRuleText(text: string): Promise<RuleValidation> {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `You judge whether a piece of text is a meaningful writing/style rule — an instruction that could guide how someone writes (grammar, tone, terminology, formatting, phrasing, etc).

Reject text that is gibberish, random characters, a single unrelated word, a question, or unrelated to writing style.
Accept short but coherent instructions (e.g. "Use Oxford commas", "Avoid passive voice", "Keep sentences under 20 words").

Respond ONLY as JSON, no markdown fences, matching exactly:
{"valid": true or false, "reason": "one short sentence explaining why, only if invalid, else empty string"}`
      },
      { role: "user", content: text }
    ]
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const cleaned = raw.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(cleaned) as RuleValidation;
    return { valid: !!parsed.valid, reason: parsed.reason };
  } catch {
    // Fail open: if the model response is unparseable, don't block the user over our own bug
    return { valid: true };
  }
}

export async function streamCorrectText(
  text: string,
  rules: StyleRule[],
  tone?: string,
  translateTo?: string
) {
  return groq.chat.completions.create({
    model: MODEL,
    temperature: 0.2,
    stream: true,
    messages: [
      { role: "system", content: buildStreamingSystemPrompt(rules, tone, translateTo) },
      { role: "user", content: text }
    ]
  });
}