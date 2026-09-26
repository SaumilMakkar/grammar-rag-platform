import { NextRequest, NextResponse } from "next/server";
import { retrieveRelevantRulesWithScores } from "@/lib/vectorStore";
import { correctText } from "@/lib/groq";
import { getHistoryCollection } from "@/lib/db";
import { CorrectionRequest, RetrievalLogEntry } from "@/types";
import {getServerSession} from "next-auth";
import { authOptions } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;
  const limit=checkRateLimit(userId);
  if(!limit.allowed){
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  try {
    const body = (await req.json()) as CorrectionRequest;
    if (!body.text || !body.text.trim()) return NextResponse.json({ error: "text is required" }, { status: 400 });

    const scoredRules = await retrieveRelevantRulesWithScores(body.text, userId);
    const rules = scoredRules.map((s) => s.rule);
    const result = await correctText(body.text, rules, body.tone, body.translateTo);

    const retrievalLog = scoredRules.map((s) => ({
      ruleText: s.rule.text,
      score: s.score,
      wasApplied: result.appliedRules.includes(s.rule.text)
    }));

    const history = await getHistoryCollection();
    await history.insertOne({ userId, input: body.text, output: result, tone: body.tone ?? null, translateTo: body.translateTo ?? null, retrieval: retrievalLog, createdAt: new Date() });

    return NextResponse.json(result);
  } catch (err) {
    console.error("Correction failed:", err);
    return NextResponse.json({ error: "Correction failed" }, { status: 500 });
  }
}