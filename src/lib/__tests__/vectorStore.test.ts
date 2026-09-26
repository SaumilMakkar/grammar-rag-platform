import { describe, it, expect, vi, beforeEach } from "vitest";

// Fake rules with hand-picked embeddings so we know the expected ranking.
const FAKE_RULES = [
  { text: "high match rule", embedding: [1, 0], category: "tone" },
  { text: "medium match rule", embedding: [0.5, 0.5], category: "tone" },
  { text: "low match rule", embedding: [0, 1], category: "grammar" }
];

// Mock the DB layer: return FAKE_RULES instead of hitting real MongoDB.
// Replace the getRulesCollection mock's shape:
const FAKE_SCORED_RESULTS = [
  { text: "high match rule", score: 0.95, category: "tone" },
  { text: "medium match rule", score: 0.6, category: "tone" },
  { text: "low match rule", score: 0.1, category: "grammar" }
];

vi.mock("@/lib/db", () => ({
  getRulesCollection: vi.fn(async () => ({
    // Mirrors real $vectorSearch: honors `limit` so "respects topK" actually tests something.
    aggregate: (pipeline: Array<{ $vectorSearch?: { limit?: number } }>) => {
      const limit = pipeline.find((s) => s.$vectorSearch)?.$vectorSearch?.limit;
      return { toArray: async () => FAKE_SCORED_RESULTS.slice(0, limit) };
    },
    insertOne: vi.fn()
  }))
}));

// The embeddings mock can stay as-is (embedText is still called first).

// Mock embeddings: a query of [1, 0] should be "most similar" to the
// high-match rule, without ever loading the real ML model.
vi.mock("@/lib/embeddings", () => ({
  embedText: vi.fn(async () => [1, 0]),
  cosineSimilarity: (a: number[], b: number[]) => {
    let dot = 0;
    for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
    return dot;
  }
}));

import { retrieveRelevantRules } from "@/lib/vectorStore";

describe("retrieveRelevantRules", () => {
  beforeEach(() => vi.clearAllMocks());

  it("ranks the most similar rule first", async () => {
    const results = await retrieveRelevantRules("any text", "user-1", 3, 0);
    expect(results[0].text).toBe("high match rule");
  });

  it("filters out rules below minScore", async () => {
    // query [1,0] vs rule [0,1] has cosine similarity 0 — should be excluded at minScore 0.3
    const results = await retrieveRelevantRules("any text", "user-1", 3, 0.3);
    expect(results.find((r) => r.text === "low match rule")).toBeUndefined();
  });

  it("respects topK", async () => {
    const results = await retrieveRelevantRules("any text", "user-1", 1, 0);
    expect(results).toHaveLength(1);
  });
});