
import React, { useState } from 'react';
import { Agent } from '../types';
import { motion } from 'framer-motion';
import { ShieldAlert, BarChart, AlertCircle } from 'lucide-react';

interface AgentCardProps {
  agent: Agent;
  liveAlerts?: number;
  riskScore?: number;
}

const teamColors: { [key: string]: string } = {
  'Blue Team': 'bg-blue-100 text-blue-800',
  'Red Team': 'bg-red-100 text-red-800',
};

const severityColors: { [key: string]: string } = {
    'Critical': 'text-red-500',
    'High': 'text-orange-500',
    'Medium': 'text-yellow-500',
    'Low': 'text-green-500',
};

const AgentCard: React.FC<AgentCardProps> = ({ agent, liveAlerts = 0, riskScore = 0 }) => {
  const [isHovered, setIsHovered] = useState(false);

  const riskColor = riskScore > 75 ? 'bg-red-500' : riskScore > 50 ? 'bg-orange-500' : 'bg-green-500';

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative bg-white rounded-2xl shadow-md p-6 ring-1 ring-gray-900/5 h-full flex flex-col"
      role="group" aria-labelledby={`agent-${agent.id}-name`}
    >
      <div className="flex justify-between items-start">
        <img
          src={agent.avatar || '/images/placeholders/avatar.png'}
          alt={`${agent.name} avatar`}
          className="w-20 h-20 rounded-full border-4 border-white shadow-lg -mt-12"
        />
        <div className="flex flex-col items-end space-y-1 text-xs font-semibold">
            <span className={`px-2 py-1 rounded-full ${teamColors[agent.team] || 'bg-gray-100 text-gray-800'}`}>{agent.team}</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full">{agent.group}</span>
            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full capitalize">{agent.scope}</span>
        </div>
      </div>

      <h2 id={`agent-${agent.id}-name`} className="mt-4 text-xl font-bold text-gray-900">
        {agent.name}
      </h2>
      <p className="text-sm text-gray-500 mb-4">{agent.role}</p>
      
      <div className="flex items-center space-x-4 mb-4 text-sm font-medium">
          <div className="flex items-center text-red-600">
              <ShieldAlert className="w-4 h-4 mr-1.5"/>
              <span>Live Alerts: <strong>{liveAlerts}</strong></span>
          </div>
          <div className="flex items-center text-gray-600">
              <BarChart className="w-4 h-4 mr-1.5" />
              <span>Risk: <strong>{riskScore}%</strong></span>
          </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <motion.div 
            className={`h-2 rounded-full ${riskColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${riskScore}%`}}
            transition={{ duration: 0.5, ease: 'easeOut' }}
           />
      </div>

      <h3 className="font-semibold text-sm text-gray-800 mb-2">Recent Activity</h3>
      <ul className="space-y-2 text-sm text-gray-700 flex-grow">
        {agent.alerts.map(a => (
          <li
            key={a.id}
            className="flex items-start"
          >
            <AlertCircle className={`w-4 h-4 mr-2 flex-shrink-0 mt-0.5 ${severityColors[a.severity]}`} />
            <span><strong className={severityColors[a.severity]}>{a.severity}:</strong> {a.message}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default AgentCard;
