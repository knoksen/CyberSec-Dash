import { useEffect, useRef } from "react";
import type { Agent } from "@/types/agent";

export function useLiveRisk(setAgents: (updater: (prev: Agent[]) => Agent[]) => void, ms = 2000) {
  const t = useRef<number | null>(null);
  useEffect(() => {
    // @ts-ignore
    t.current = window.setInterval(() => {
      setAgents(prev => prev.map(a => ({
        ...a,
        risk: Math.max(0, Math.min(100, a.risk + (Math.random() < 0.6 ? -1 : 1) * (Math.random() < 0.15 ? 3 : 1)))
      })));
    }, ms);
    return () => { if (t.current) window.clearInterval(t.current); };
  }, [ms, setAgents]);
}
