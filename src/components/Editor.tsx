"use client";

import { useState } from "react";
import { CorrectionResponse } from "@/types";

const TONES = ["neutral", "formal", "casual", "confident", "friendly"] as const;
const LANGUAGES = ["", "Spanish", "French", "Hindi", "German", "Japanese"];

export default function Editor({
  onResult
}: {
  onResult: (r: CorrectionResponse | null, loading: boolean) => void;
}) {
  const [text, setText] = useState("");
  const [tone, setTone] = useState<string>("neutral");
  const [translateTo, setTranslateTo] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!text.trim() || loading) return;
    setLoading(true);
    onResult(null, true);
    try {
      const res = await fetch("/api/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, tone, translateTo: translateTo || undefined })
      });
      const data = await res.json();
      onResult(data, false);
    } catch {
      onResult(null, false);
    } finally {
      setLoading(false);
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