import React, { Suspense, useState, useEffect, useCallback } from "react";
import Layout from "./components/Layout";
import Hero from "./components/Hero";
import FilterBar from "./components/FilterBar";
import AgentGrid from "./components/AgentGrid";
const AiChat = React.lazy(() => import("./components/Chat"));
import { AGENTS } from "./constants";
import { Agent } from "./types";


// Minimal analytics event logger
const logEvent = (event: string, data?: any) => {
  if (window.localStorage.getItem("analytics-enabled") === "true") {
    console.log("[Analytics]", event, data || "");
  }
};

const App: React.FC = () => {
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>(AGENTS);
  const [liveStatus, setLiveStatus] = useState<Record<number, number>>({});
  const [riskScores, setRiskScores] = useState<Record<number, number>>({});
  const [analyticsEnabled, setAnalyticsEnabled] = useState(() => window.localStorage.getItem("analytics-enabled") === "true");

  useEffect(() => {
    // Initialize risk scores on mount
    const newRiskScores: Record<number, number> = {};
    AGENTS.forEach((agent) => {
      newRiskScores[agent.id] = Math.floor(Math.random() * 80) + 10;
    });
    setRiskScores(newRiskScores);

    // Listen for live alerts via SSE
    const es = new EventSource("/api/alerts");
    es.onmessage = (e) => {
      const { agentId, delta } = JSON.parse(e.data);
      setLiveStatus((prev) => ({ ...prev, [agentId]: Math.max(0, (prev[agentId] ?? 0) + delta) }));
      setRiskScores((prev) => ({ ...prev, [agentId]: Math.min(100, Math.max(0, (prev[agentId] ?? 0) + delta * 3)) }));
    };
    // Log page view
    logEvent("page_view");
    return () => es.close();
  }, []);

  useEffect(() => {
    window.localStorage.setItem("analytics-enabled", analyticsEnabled ? "true" : "false");
  }, [analyticsEnabled]);

  const handleFilter = useCallback((filtered: Agent[], filterData?: any) => {
    setFilteredAgents(filtered);
    if (analyticsEnabled) logEvent("filter_change", filterData);
  }, [analyticsEnabled]);

  // Analytics toggle UI
  const AnalyticsToggle = () => (
    <div className="flex items-center gap-2 mb-2">
      <label htmlFor="analytics-toggle" className="text-sm">Analytics</label>
      <input
        id="analytics-toggle"
        type="checkbox"
        checked={analyticsEnabled}
        onChange={e => setAnalyticsEnabled(e.target.checked)}
        aria-label="Toggle analytics event logging"
      />
    </div>
  );

  return (
    <Layout>
      <Hero />
      <section id="agents" className="container mx-auto px-4 sm:px-6 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <aside className="lg:col-span-3">
            <FilterBar agents={AGENTS} onFilter={handleFilter} />
          </aside>
          <main className="lg:col-span-9">
            <AgentGrid
              agents={filteredAgents}
              liveStatus={liveStatus}
              riskScores={riskScores}
            />
          </main>
        </div>
      </section>
      <section id="chat" className="container mx-auto px-4 sm:px-6 pb-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ask your AI Agent
          </h2>
          <AnalyticsToggle />
          <Suspense fallback={<div>Loading chat…</div>}>
            <AiChat analyticsEnabled={analyticsEnabled} logEvent={logEvent} />
          </Suspense>
        </div>
      </section>
    </Layout>
  );
};

export default App;
