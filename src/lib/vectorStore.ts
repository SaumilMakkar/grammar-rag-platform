import { ObjectId } from "mongodb";
import { getRulesCollection } from "./db";
import { embedText } from "./embeddings";
import { StyleRule } from "@/types";

export interface ScoredRule {
  rule: StyleRule;
  score: number;
}

/**
 * Retrieval via MongoDB Atlas $vectorSearch — the DB's own ANN index
 * does the similarity search, instead of pulling every rule into the
 * app and scoring them in a JS loop (that's what this replaces).
 *
 * Note: Atlas's cosine score is normalized to [0, 1], not [-1, 1] —
 * minScore means something slightly different than it did before.
 */
export async function retrieveRelevantRulesWithScores(
  text: string,
  userId: string,
  topK = 4,
  minScore = 0.3
): Promise<ScoredRule[]> {
  const queryEmbedding = await embedText(text);
  const collection = await getRulesCollection();

  const results = await collection
    .aggregate([
      {
        $vectorSearch: {
          index: "style_rules_vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 100, // how many candidates the ANN index considers before ranking
          limit: topK,
          filter: { userId: { $eq: userId } } // scope retrieval to this user's own rules
        }
      },
      {
        $project: {
          text: 1,
          category: 1,
          createdAt: 1,
          score: { $meta: "vectorSearchScore" } // Atlas attaches the similarity score here
        }
      }
    ])
    .toArray();

  return results
    .filter((r) => r.score >= minScore)
    .map((r) => ({
      rule: {
        _id: r._id,
        text: r.text,
        category: r.category,
        createdAt: r.createdAt,
        userId,
        embedding: [] // not returned by Atlas here — not needed downstream, so left empty
      } as StyleRule,
      score: r.score
    }));
}

// Unchanged — still used by anything wanting just the rules, no scores.
export async function retrieveRelevantRules(
  text: string,
  userId: string,
  topK = 4,
  minScore = 0.3
): Promise<StyleRule[]> {
  const scored = await retrieveRelevantRulesWithScores(text, userId, topK, minScore);
  return scored.map((s) => s.rule);
}

export async function addStyleRule(text: string, userId: string, category?: string) {
  const collection = await getRulesCollection();

  // Idempotent: re-adding the same rule text for the same user is a no-op
  // rather than a duplicate document (seed scripts and re-seeding rely on this).
  const existing = await collection.findOne({ userId, text });
  if (existing) return existing._id;

  const embedding = await embedText(text);
  const result = await collection.insertOne({
    text,
    embedding,
    category,
    userId,
    createdAt: new Date()
  });
  return result.insertedId;
}

// Scoped to userId so a rule can only ever be deleted by the user who owns it.
export async function deleteStyleRule(id: string, userId: string) {
  if (!ObjectId.isValid(id)) return false;
  const collection = await getRulesCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id), userId });
  return result.deletedCount > 0;
}