"use client";

import { useState } from "react";
import Editor from "@/components/Editor";
import SuggestionPanel from "@/components/SuggestionPanel";
import RulesPanel from "@/components/RulesPanel";
import { CorrectionResponse } from "@/types";

export default function Home() {
  const [result, setResult] = useState<CorrectionResponse | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <main className="page">
      <div className="masthead">
        <h1>Marginalia</h1>
      </div>
      <Editor onResult={(r, l) => { setResult(r); setLoading(l); }} />
      <SuggestionPanel result={result} loading={loading} />
      <RulesPanel />
    </main>
  );
}