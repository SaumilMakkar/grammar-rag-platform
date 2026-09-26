import { describe, it, expect } from "vitest";
import { cosineSimilarity } from "@/lib/embeddings";

describe("cosineSimilarity", () => {
  it("returns 1 for identical vectors", () => {
    const a = [1, 0, 0];
    expect(cosineSimilarity(a, a)).toBeCloseTo(1);
  });

  it("returns 0 for orthogonal vectors", () => {
    const a = [1, 0];
    const b = [0, 1];
    expect(cosineSimilarity(a, b)).toBeCloseTo(0);
  });

  it("returns -1 for opposite vectors", () => {
    const a = [1, 0];
    const b = [-1, 0];
    expect(cosineSimilarity(a, b)).toBeCloseTo(-1);
  });

  it("is symmetric: sim(a, b) === sim(b, a)", () => {
    const a = [0.6, 0.8];
    const b = [0.8, 0.6];
    expect(cosineSimilarity(a, b)).toBeCloseTo(cosineSimilarity(b, a));
  });
});