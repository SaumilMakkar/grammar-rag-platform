import { CorrectionResponse } from "@/types";
import DiffView from "@/components/DiffView";

export default function SuggestionPanel({
  original,
  result,
  loading,
  streaming
}: {
  original: string;
  result: CorrectionResponse | null;
  loading: boolean;
  streaming?: string | null;
}) {
  if (loading) {
    if (!streaming) return <p>Checking against your style rules…</p>;
    return (
      <div className="result">
        <h2>margin notes</h2>
        <DiffView original={original} corrected={streaming} />
      </div>
    );
  }
  if (!result) return <p>Submit a draft above to see corrections here.</p>;

  return (
    <div className="result">
      <h2>margin notes</h2>
      <DiffView original={original} corrected={result.corrected} />
      <p className="explanation">{result.explanation}</p>
      {result.appliedRules.length > 0 && (
        <div className="rule-tags">
          {result.appliedRules.map((r, i) => (
            <span className="rule-tag" key={i}>{r}</span>
          ))}
        </div>
      )}
      {result.translated && <p className="translation">{result.translated}</p>}
    </div>
  );
}