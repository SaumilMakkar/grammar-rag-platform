import { NextRequest,NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { retrieveRelevantRulesWithScores } from "@/lib/vectorStore";
import { streamCorrectText } from "@/lib/groq";
import { getHistoryCollection } from "@/lib/db";
import { CorrectionRequest } from "@/types";
import {checkRateLimit} from "@/lib/rateLimit";
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  const userId = (session.user as { id: string }).id;
  const limit=checkRateLimit(userId)
  if(!limit.allowed){
     return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const body = (await req.json()) as CorrectionRequest;
  if (!body.text || !body.text.trim()) {
    return new Response("text is required", { status: 400 });
  }

  const scoredRules = await retrieveRelevantRulesWithScores(body.text, userId);
  const rules = scoredRules.map((s) => s.rule);
  const groqStream = await streamCorrectText(body.text, rules, body.tone, body.translateTo);

  let fullText = "";

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of groqStream) {
          const delta = chunk.choices[0]?.delta?.content ?? "";
          if (delta) {
            fullText += delta;
            controller.enqueue(encoder.encode(delta));
          }
        }
      } finally {
        controller.close();

        // Runs after the response is already sent — safe on Railway's
        // persistent runtime, unlike short-lived serverless functions.
        const [correctedPart, metaPart] = fullText.split("===META===");
        let meta: { explanation: string; appliedRules: string[]; translated?: string } = {
          explanation: "",
          appliedRules: []
        };
        try {
          meta = JSON.parse((metaPart ?? "{}").trim());
        } catch {
          // leave defaults if the model didn't format metadata correctly
        }

        const retrievalLog = scoredRules.map((s) => ({
          ruleText: s.rule.text,
          score: s.score,
          wasApplied: meta.appliedRules?.includes(s.rule.text) ?? false
        }));

        const history = await getHistoryCollection();
        await history.insertOne({
          userId,
          input: body.text,
          output: { corrected: correctedPart?.trim() ?? "", ...meta },
          tone: body.tone ?? null,
          translateTo: body.translateTo ?? null,
          retrieval: retrievalLog,
          createdAt: new Date()
        });
      }
    }
  });

  return new Response(stream, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}