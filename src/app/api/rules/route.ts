import { NextRequest, NextResponse } from "next/server";
import { addStyleRule } from "@/lib/vectorStore";
import { getRulesCollection } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { text?: string; category?: string };

    if (!body.text || !body.text.trim()) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const insertedId = await addStyleRule(body.text, body.category);

    return NextResponse.json({ insertedId }, { status: 201 });
  } catch (err) {
    console.error("Adding rule failed:", err);
    return NextResponse.json({ error: "Adding rule failed" }, { status: 500 });
  }
}


export async function GET() {
  const collection = await getRulesCollection();
  const rules = await collection
    .find({}, { projection: { embedding: 0 } })
    .sort({ createdAt: -1 })
    .toArray();
  return NextResponse.json(rules);
}