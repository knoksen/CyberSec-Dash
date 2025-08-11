
import React, { useState, useEffect, useCallback } from 'react';
import Layout from './components/Layout';
import Hero from './components/Hero';
import FilterBar from './components/FilterBar';
import AgentGrid from './components/AgentGrid';
import AiChat from './components/Chat';
import { AGENTS } from './constants';
import { Agent } from './types';

const App: React.FC = () => {
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>(AGENTS);
  const [liveStatus, setLiveStatus] = useState<Record<number, number>>({});
  const [riskScores, setRiskScores] = useState<Record<number, number>>({});

  useEffect(() => {
    // Simulate fetching risk scores on mount
    const newRiskScores: Record<number, number> = {};
    AGENTS.forEach(agent => {
      newRiskScores[agent.id] = Math.floor(Math.random() * 80) + 10; // Random score 10-90
    });
    setRiskScores(newRiskScores);

    // Simulate polling for live alerts
    const intervalId = setInterval(() => {
      setLiveStatus(prevStatus => {
        const newStatus = { ...prevStatus };
        const randomAgentId = AGENTS[Math.floor(Math.random() * AGENTS.length)].id;
        newStatus[randomAgentId] = (newStatus[randomAgentId] || 0) + 1;
        return newStatus;
      });
    }, 5000); // New alert every 5 seconds

    return () => clearInterval(intervalId);
  }, []);
  
  const handleFilter = useCallback((filtered: Agent[]) => {
      setFilteredAgents(filtered);
  }, []);

  return (
    <Layout>
      <Hero />
      <section id="agents" className="container mx-auto px-4 sm:px-6 py-8">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <aside className="lg:col-span-3">
            <FilterBar agents={AGENTS} onFilter={handleFilter} />
          </aside>
          <main className="lg:col-span-9">
            <AgentGrid agents={filteredAgents} liveStatus={liveStatus} riskScores={riskScores} />
          </main>
        </div>
      </section>
      <section id="chat" className="container mx-auto px-4 sm:px-6 pb-8">
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ask your AI Agent</h2>
            <AiChat />
        </div>
      </section>
    </Layout>
  );
};


export default App;
