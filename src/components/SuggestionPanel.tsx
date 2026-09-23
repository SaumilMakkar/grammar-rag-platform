import { CorrectionResponse } from "@/types";

export default function SuggestionPanel({
  result,
  loading
}: {
  result: CorrectionResponse | null;
  loading: boolean;
}) {
  if (loading) return <p>Checking against your style rules…</p>;
  if (!result) return <p>Submit a draft above to see corrections here.</p>;

  return (
    <div className="result">
      <p className="corrected-text">{result.corrected}</p>
      <p className="explanation">{result.explanation}</p>
      <div className="rule-tags">
        {result.appliedRules.map((r, i) => (
          <span key={i} className="rule-tag">{r}</span>
        ))}
      </div>
      {result.translated && <p className="translation">{result.translated}</p>}
    </div>
  );
}