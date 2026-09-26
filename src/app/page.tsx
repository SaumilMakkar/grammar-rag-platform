"use client";

import { useState } from "react";
import Editor from "@/components/Editor";
import SuggestionPanel from "@/components/SuggestionPanel";
import RulesPanel from "@/components/RulesPanel";
import { CorrectionResponse } from "@/types";
import AuthButton from "@/components/AuthButton";
export default function Home() {
  const [result, setResult] = useState<CorrectionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [original, setOriginal] = useState("");
  const [streamingText, setStreamingText] = useState<string | null>(null); // new

  return (
    <main className="page">
      <div className="masthead">
        <h1>Marginalia</h1>
        <p>grammar · tone · translation — checked against rules you define</p>
        <AuthButton />
      </div>
      <div className="desk">
        <Editor
          onResult={(r, l, orig) => { setResult(r); setLoading(l); setOriginal(orig); }}
          onStreamChunk={setStreamingText}
        />
        <SuggestionPanel original={original} result={result} loading={loading} streaming={streamingText} />
        <RulesPanel />
      </div>
    </main>
  );
}