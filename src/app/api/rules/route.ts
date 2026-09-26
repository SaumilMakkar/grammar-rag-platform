import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getRulesCollection } from "@/lib/db";
import { addStyleRule } from "@/lib/vectorStore";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const collection = await getRulesCollection();
  const rules = await collection.find({ userId }, { projection: { embedding: 0 } }).sort({ createdAt: -1 }).toArray();
  return NextResponse.json(rules);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as { id: string }).id;

  const { text, category } = await req.json();
  if (!text || !text.trim()) return NextResponse.json({ error: "text is required" }, { status: 400 });
  const id = await addStyleRule(text, userId, category);
  return NextResponse.json({ id }, { status: 201 });
}
