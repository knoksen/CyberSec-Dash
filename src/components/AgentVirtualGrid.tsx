import { FixedSizeGrid as Grid } from "react-window";
import React from "react";
import type { Agent } from "@/types/agent";

export function AgentVirtualGrid({ agents, columnWidth = 320, rowHeight = 160, onSelect }: {
  agents: Agent[]; columnWidth?: number; rowHeight?: number; onSelect: (a: Agent) => void;
}) {
  const width = typeof window !== 'undefined' ? Math.min(window.innerWidth - 48, 1400) : 1000;
  const columns = Math.max(1, Math.floor(width / columnWidth));
  const rows = Math.ceil(agents.length / columns);

  const Cell = ({ columnIndex, rowIndex, style }: any) => {
    const idx = rowIndex * columns + columnIndex;
    if (idx >= agents.length) return null;
    const a = agents[idx];
    return (
      <div style={{ ...style, padding: 8 }}>
        <div onClick={() => onSelect(a)} className="rounded-2xl border p-3 hover:shadow cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">{a.name}</div>
              <div className="text-xs text-muted-foreground">{a.team} • {a.role} • {a.group}</div>
            </div>
            <div className="text-xs">Risk {a.risk}%</div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">{a.location} • {a.skills.slice(0,3).join(', ')}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      <Grid
        columnCount={columns}
        columnWidth={columnWidth}
        height={600}
        rowCount={rows}
        rowHeight={rowHeight}
        width={width}
      >
        {Cell}
      </Grid>
    </div>
  );
}
