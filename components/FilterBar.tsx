
import React, { useState, useEffect, useRef } from 'react';
import { Agent } from '../types';
import { Search } from 'lucide-react';

interface FilterBarProps {
  agents: Agent[];
  onFilter: (filtered: Agent[]) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ agents, onFilter }) => {
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('All');
  const [team, setTeam] = useState('All');
  const [group, setGroup] = useState('All');
  const [scope, setScope] = useState('All');

  // Use a ref to hold the onFilter callback. This allows us to call the latest
  // version of the function from inside useEffect without adding it to the
  // dependency array, which prevents a common infinite re-render loop.
  const onFilterRef = useRef(onFilter);
  onFilterRef.current = onFilter;

  useEffect(() => {
    const filtered = agents.filter(a =>
      a.name.toLowerCase().includes(query.toLowerCase()) &&
      (role === 'All' || a.role === role) &&
      (team === 'All' || a.team === team) &&
      (group === 'All' || a.group === group) &&
      (scope === 'All' || a.scope === scope)
    );
    onFilterRef.current(filtered);
  }, [query, role, team, group, scope, agents]);

  const roles = ['All', ...Array.from(new Set(agents.map(a => a.role)))];
  const teams = ['All', ...Array.from(new Set(agents.map(a => a.team)))];
  const groups = ['All', ...Array.from(new Set(agents.map(a => a.group)))];

  const renderSelect = (label: string, value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, options: string[]) => (
    <div>
      <label htmlFor={label} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select
        id={label}
        className="p-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
        value={value}
        onChange={onChange}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="p-4 bg-white rounded-lg shadow-md space-y-4 sticky top-24">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          placeholder="Search agents..."
          className="p-2 pl-10 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>
      {renderSelect('Role', role, e => setRole(e.target.value), roles)}
      {renderSelect('Team', team, e => setTeam(e.target.value), teams)}
      {renderSelect('Group', group, e => setGroup(e.target.value), groups)}
      {renderSelect('Scope', scope, e => setScope(e.target.value), ['All', 'local', 'international'])}
    </div>
  );
};

export default FilterBar;
