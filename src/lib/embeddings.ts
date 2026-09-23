import { pipeline, Pipeline } from "@xenova/transformers";

// Runs fully locally — no API key, no network call per request.
// Model downloads once (~25MB) and is cached on first use.
let extractor: Pipeline | null = null;

async function getExtractor() {
  if (!extractor) {
    extractor = (await pipeline(
      "feature-extraction",
      "Xenova/all-MiniLM-L6-v2"
    )) as Pipeline;
  }
  return extractor;
}

export async function embedText(text: string): Promise<number[]> {
  const model = await getExtractor();
  const output = await model(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  // Vectors from all-MiniLM are already normalized, so dot product == cosine similarity
  return dot;
}