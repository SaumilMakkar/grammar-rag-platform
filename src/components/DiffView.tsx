import { getWordDiff } from "@/lib/diffText";

export default function DiffView({
  original,
  corrected
}: {
  original: string;
  corrected: string;
}) {
  const parts = getWordDiff(original, corrected);

  return (
    <p className="diff-text">
      {parts.map((part, i) => {
        if (part.added) {
          return (
            <ins key={i} className="diff-added">
              {part.value}
            </ins>
          );
        }
        if (part.removed) {
          return (
            <del key={i} className="diff-removed">
              {part.value}
            </del>
          );
        }
        return <span key={i}>{part.value}</span>;
      })}
    </p>
  );
}