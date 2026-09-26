"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Editor from "@/components/Editor";
import SuggestionPanel from "@/components/SuggestionPanel";
import RulesPanel from "@/components/RulesPanel";
import { CorrectionResponse } from "@/types";
import AuthButton from "@/components/AuthButton";
import ThemeToggle from "@/components/ThemeToggle";
import MascotIcon from "@/components/MascotIcon";

export default function Home() {
  const { status } = useSession();
  const [result, setResult] = useState<CorrectionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [original, setOriginal] = useState("");
  const [streamingText, setStreamingText] = useState<string | null>(null);

  return (
    <main className="page">
      <div className="topbar">
        <div className="brand">
          <h1>Marginalia</h1>
          <p>grammar · tone · translation — checked against rules you define</p>
        </div>
        <div className="topbar-actions">
          <ThemeToggle />
          <AuthButton />
        </div>
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
        <section className="hero">
          <div className="hero-copy">
            <h2>Your writing, held to your own standard.</h2>
            <p>
              Marginalia checks grammar, tone, and translation against style rules you define
              yourself — not a generic checklist. Sign in to set up your rules and start.
            </p>
            <ul className="hero-features">
              <li>Grammar &amp; clarity corrections, explained</li>
              <li>Tone matching — formal, casual, confident, and more</li>
              <li>Optional translation, grounded in your corrected text</li>
              <li>Your own style rules, retrieved and applied automatically</li>
            </ul>
          </div>
          <div className="hero-art">
            <span className="feature-bubble bubble-1">Grammar fixes</span>
            <span className="feature-bubble bubble-2">Tone matching</span>
            <span className="feature-bubble bubble-3">Live translation</span>
            <span className="feature-bubble bubble-4">Your own rules</span>
            <MascotIcon />
            <p>Your digital writing assistant, always ready</p>
          </div>
        </section>
      )}
    </main>
  );
}
