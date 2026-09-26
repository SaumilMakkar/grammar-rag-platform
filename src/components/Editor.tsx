"use client";

import { useState } from "react";
import { CorrectionResponse } from "@/types";

const TONES = ["neutral", "formal", "casual", "confident", "friendly"] as const;
const LANGUAGES = ["", "Spanish", "French", "Hindi", "German", "Japanese", "Punjabi"];

export default function Editor({
  onResult,
  onStreamChunk
}: {
  onResult: (r: CorrectionResponse | null, loading: boolean, original: string) => void;
  onStreamChunk: (text: string | null) => void;
}) {
  const [text, setText] = useState("");
  const [tone, setTone] = useState<string>("neutral");
  const [translateTo, setTranslateTo] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!text.trim() || loading) return;
    setLoading(true);
    onResult(null, true, text);
    onStreamChunk(""); // reset the stream chunk state
    try {
      const res = await fetch("/api/correct/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, tone, translateTo: translateTo || undefined })
      });

      if (res.status === 429) {
        const retryAfter = res.headers.get("Retry-After");
        onStreamChunk(null);
        onResult(
          {
            corrected: "",
            explanation: `You've hit the rate limit. Try again in ${
              retryAfter ? Math.ceil(Number(retryAfter) / 60) : "a few"
            } minute(s).`,
            appliedRules: []
          },
          false,
          text
        );
        return;
      }

      if (!res.body) throw new Error("No stream body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        onStreamChunk(fullText.split("===META===")[0]); // only show text before the delimiter
      }

      const [correctedPart, metaPart] = fullText.split("===META===");
      let meta: { explanation: string; appliedRules: string[]; translated?: string } = {
        explanation: "",
        appliedRules: []
      };
      try {
        meta = JSON.parse((metaPart ?? "{}").trim());
      } catch {
        // fall back to empty meta
      }

      onResult({ corrected: correctedPart?.trim() ?? "", ...meta }, false, text);
    } catch {
      onResult(null, false, text);
    } finally {
      setLoading(false);
      onStreamChunk(null);
    }
  }

  return (
    <div className="manuscript">
      <label>Draft</label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste or write the text you want checked…"
      />
      <div className="controls">
        <select value={tone} onChange={(e) => setTone(e.target.value)}>
          {TONES.map((t) => (
            <option key={t} value={t}>tone: {t}</option>
          ))}
        </select>
        <select value={translateTo} onChange={(e) => setTranslateTo(e.target.value)}>
          {LANGUAGES.map((l) => (
            <option key={l} value={l}>{l ? `translate: ${l}` : "no translation"}</option>
          ))}
        </select>
        <button className="correct-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? "checking…" : "check draft"}
        </button>
      </div>
    </div>
  );
}