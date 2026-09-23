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