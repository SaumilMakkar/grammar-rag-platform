import { getRulesCollection } from "./db";
import { cosineSimilarity, embedText } from "./embeddings";
import { StyleRule } from "../types";

/**
 * Simple in-app RAG retrieval:
 * 1. Embed the incoming text.
 * 2. Pull all style rules (fine at hundreds of rules; swap for
 *    MongoDB Atlas $vectorSearch once the rule set grows large).
 * 3. Rank by cosine similarity, return the top-k above a relevance floor.
 */
export async function retrieveRelevantRules(
  text: string,
  topK = 4,
  minScore = 0.3
): Promise<StyleRule[]> {
  const queryEmbedding = await embedText(text);
  const collection = await getRulesCollection();
  const rules = (await collection.find({}).toArray()) as unknown as StyleRule[];

  const scored = rules
    .map((rule) => ({
      rule,
      score: cosineSimilarity(queryEmbedding, rule.embedding)
    }))
    .filter((r) => r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return scored.map((s) => s.rule);
}

export async function addStyleRule(text: string, category?: string) {
  const embedding = await embedText(text);
  const collection = await getRulesCollection();
  const result = await collection.insertOne({
    text,
    embedding,
    category,
    createdAt: new Date()
  });
  return result.insertedId;
}