import React from "react";
import { Agent } from "../types";
import AgentCard from "./AgentCard";
import { motion } from "framer-motion";

interface AgentGridProps {
  agents: Agent[];
  liveStatus: Record<number, number>;
  riskScores: Record<number, number>;
}

const AgentGrid: React.FC<AgentGridProps> = ({
  agents,
  liveStatus,
  riskScores,
}) => {
  if (agents.length === 0) {
    return (
      <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-gray-700">No Agents Found</h3>
        <p className="text-gray-500 mt-2">
          Try adjusting your filters to find the agents you're looking for.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.05 } },
      }}
    >
      {agents.map((agent) => (
        <motion.div
          key={agent.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
        >
          <AgentCard
            agent={agent}
            liveAlerts={liveStatus[agent.id] || 0}
            riskScore={riskScores[agent.id] || 0}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default AgentGrid;
