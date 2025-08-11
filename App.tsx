

import React, { useEffect, useState } from "react";
import { fetchAgents, addAgents, scaleAgents, type Agent } from "@/lib/api";
import { PaginatedGrid } from "@/components/PaginatedGrid";

export default function App() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Agent | null>(null);

  async function load() {
    setLoading(true);
    try {
      const { items } = await fetchAgents(query ? { q: query } : undefined);
      setAgents(items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [query]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="p-6 space-y-4">
      <div className="flex gap-2 mb-3">
        <button onClick={() => addAgents(24).then(load)} className="px-3 py-1 rounded-xl border">Add 24</button>
        <button onClick={() => scaleAgents(100).then(load)} className="px-3 py-1 rounded-xl border">Scale to 100</button>
        <button onClick={() => { fetch('/api/agents', { method: 'DELETE' }).then(load); }} className="px-3 py-1 rounded-xl border">Reset</button>
      </div>
      <input className="w-full px-3 py-2 rounded-2xl border" placeholder="Search agents, teams, skills, location…" value={query} onChange={(e) => setQuery(e.target.value)} />
      {loading ? <p>Loading…</p> : <PaginatedGrid agents={agents} onSelect={setSelected} />}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold">{selected.name}</h3>
            <p className="text-sm text-muted-foreground">{selected.team} • {selected.role} • {selected.group}</p>
            <p className="mt-2 text-sm">Skills: {selected.skills.join(', ')}</p>
            <p className="mt-2 text-sm">Risk: {selected.risk}%</p>
            <button className="mt-4 px-4 py-2 rounded-xl border" onClick={() => setSelected(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
