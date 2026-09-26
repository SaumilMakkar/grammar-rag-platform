"use client";

import { useEffect, useState } from "react";

interface RuleRow {
  _id: string;
  text: string;
  category?: string;
}

export default function RulesPanel() {
  const [rules, setRules] = useState<RuleRow[]>([]);
  const [newRule, setNewRule] = useState("");
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  async function loadRules() {
    const res = await fetch("/api/rules");
    setRules(await res.json());
  }

  useEffect(() => {
    loadRules();
  }, []);

  async function handleAdd() {
    if (!newRule.trim() || adding) return;
    setAdding(true);
    setAddError(null);
    const res = await fetch("/api/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newRule })
    });
    setAdding(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setAddError(body.error || "Couldn't add that rule.");
      return;
    }

    setNewRule("");
    loadRules();
  }

  async function handleDelete(id: string) {
    if (deletingId) return;
    setDeletingId(id);
    await fetch(`/api/rules/${id}`, { method: "DELETE" });
    setDeletingId(null);
    loadRules();
  }

  return (
    <div className="rules-panel">
      <h2>Style rules on file</h2>
      <ul>
        {rules.map((r) => (
          <li key={r._id}>
            <span>{r.text}</span>
            <button
              className="delete-rule"
              onClick={() => handleDelete(r._id)}
              disabled={deletingId === r._id}
              aria-label={`Delete rule: ${r.text}`}
            >
              {deletingId === r._id ? "…" : "×"}
            </button>
          </li>
        ))}
      </ul>
      <div className="add-rule">
        <input
          value={newRule}
          onChange={(e) => { setNewRule(e.target.value); setAddError(null); }}
          placeholder="e.g. Never use passive voice"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button onClick={handleAdd} disabled={adding}>{adding ? "checking…" : "add rule"}</button>
      </div>
      {addError && <p className="add-rule-error">{addError}</p>}
    </div>
  );
}