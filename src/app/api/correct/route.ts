import { NextRequest, NextResponse } from "next/server";
import { retrieveRelevantRules } from "@/lib/vectorStore";
import { correctText } from "@/lib/groq";
import { getHistoryCollection } from "@/lib/db";
import { CorrectionRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CorrectionRequest;

    if (!body.text || !body.text.trim()) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    // 1. Retrieve style rules relevant to this specific text (RAG step)
    const rules = await retrieveRelevantRules(body.text);

    // 2. Ask the LLM to correct/adapt the text, grounded in those rules
    const result = await correctText(body.text, rules, body.tone, body.translateTo);

    // 3. Log to history for the user's dashboard (best-effort, non-blocking)
    const history = await getHistoryCollection();
    await history.insertOne({
      input: body.text,
      output: result,
      tone: body.tone ?? null,
      translateTo: body.translateTo ?? null,
      rulesUsed: rules.map((r) => r.text),
      createdAt: new Date()
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Correction failed:", err);
    return NextResponse.json({ error: "Correction failed" }, { status: 500 });
  }
}