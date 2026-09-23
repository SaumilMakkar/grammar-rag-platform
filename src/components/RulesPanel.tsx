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
    await fetch("/api/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newRule })
    });
    setNewRule("");
    setAdding(false);
    loadRules();
  }

  return (
    <div className="rules-panel">
      <h2>Style rules on file</h2>
      <ul>
        {rules.map((r) => <li key={r._id}>{r.text}</li>)}
      </ul>
      <div className="add-rule">
        <input
          value={newRule}
          onChange={(e) => setNewRule(e.target.value)}
          placeholder="e.g. Never use passive voice"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button onClick={handleAdd} disabled={adding}>add rule</button>
      </div>
    </div>
  );
}