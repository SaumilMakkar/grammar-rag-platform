import { diffWords, Change } from "diff";

/**
 * Computes a word-level diff between the original draft and the
 * corrected text. Returns an ordered list of segments, each marked
 * as added, removed, or unchanged — used to render inline corrections.
 */
export function getWordDiff(original: string, corrected: string): Change[] {
  return diffWords(original, corrected);
}