import React, { useMemo, useState } from "react";
import type { Agent } from "@/types/agent";

export function PaginatedGrid({ agents, pageSize = 24, onSelect }: { agents: Agent[]; pageSize?: number; onSelect: (a: Agent) => void }) {
  const [page, setPage] = useState(1);
  const total = Math.max(1, Math.ceil(agents.length / pageSize));
  const slice = useMemo(() => agents.slice((page-1)*pageSize, page*pageSize), [agents, page, pageSize]);

  return (
    <div className="space-y-3">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {slice.map(a => (
          <div key={a.id} onClick={() => onSelect(a)} className="rounded-2xl border p-3 hover:shadow cursor-pointer">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{a.name}</div>
                <div className="text-xs text-muted-foreground">{a.team} • {a.role} • {a.group}</div>
              </div>
              <div className="text-xs">Risk {a.risk}%</div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">{a.location} • {a.skills.slice(0,3).join(', ')}</div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <button className="px-3 py-1 rounded-xl border" onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1}>Prev</button>
        <div className="text-sm">Page {page} / {total}</div>
        <button className="px-3 py-1 rounded-xl border" onClick={() => setPage(p => Math.min(total, p+1))} disabled={page === total}>Next</button>
      </div>
    </div>
  );
}
