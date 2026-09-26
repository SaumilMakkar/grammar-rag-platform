"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Editor from "@/components/Editor";
import SuggestionPanel from "@/components/SuggestionPanel";
import RulesPanel from "@/components/RulesPanel";
import { CorrectionResponse } from "@/types";
import AuthButton from "@/components/AuthButton";

export default function Home() {
  const { status } = useSession();
  const [result, setResult] = useState<CorrectionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [original, setOriginal] = useState("");
  const [streamingText, setStreamingText] = useState<string | null>(null);

  return (
    <main className="page">
      <div className="masthead">
        <span className="glow-orb" aria-hidden="true" />
        <h1>Marginalia</h1>
        <p>grammar · tone · translation — checked against rules you define</p>
        <AuthButton />
      </div>
      {status === "authenticated" && (
        <div className="desk">
          <Editor
            onResult={(r, l, orig) => { setResult(r); setLoading(l); setOriginal(orig); }}
            onStreamChunk={setStreamingText}
          />
          <SuggestionPanel original={original} result={result} loading={loading} streaming={streamingText} />
          <RulesPanel />
        </div>
      )}
      {status === "unauthenticated" && (
        <p>Sign in to start checking your writing against your own style rules.</p>
      )}
    </main>
  );
}