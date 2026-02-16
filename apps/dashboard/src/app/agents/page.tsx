'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'error';
  model: string;
  tasksCompleted: number;
  uptime: number;
}

const mockAgents: Agent[] = [
  { id: 'agt_1', name: 'Strategic Planner', role: 'strategic', status: 'active', model: 'claude-sonnet-4-5', tasksCompleted: 145, uptime: 99.8 },
  { id: 'agt_2', name: 'Research Lead', role: 'supervisor', status: 'active', model: 'claude-sonnet-4-5', tasksCompleted: 312, uptime: 99.5 },
  { id: 'agt_3', name: 'Code Analyst', role: 'task', status: 'idle', model: 'claude-haiku-4-5', tasksCompleted: 1024, uptime: 98.2 },
  { id: 'agt_4', name: 'Data Processor', role: 'task', status: 'error', model: 'claude-haiku-4-5', tasksCompleted: 856, uptime: 95.1 },
];

const statusColors = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  idle: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  error: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export default function AgentsPage() {
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? mockAgents : mockAgents.filter((a) => a.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Agents</h1>
        <div className="flex gap-2">
          {['all', 'active', 'idle', 'error'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((agent) => (
          <Card key={agent.id} className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">{agent.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[agent.status]}`}>
                {agent.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
              <div>Role: {agent.role}</div>
              <div>Model: {agent.model}</div>
              <div>Tasks: {agent.tasksCompleted.toLocaleString()}</div>
              <div>Uptime: {agent.uptime}%</div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
