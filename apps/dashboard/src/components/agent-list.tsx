import { Card } from './ui/card';

const agents = [
  { name: 'Strategic Planner', status: 'active', currentTask: 'Q1 planning analysis', model: 'claude-sonnet-4-5' },
  { name: 'Research Lead', status: 'active', currentTask: 'Market research compilation', model: 'claude-sonnet-4-5' },
  { name: 'Code Analyst', status: 'idle', currentTask: undefined, model: 'claude-haiku-4-5' },
  { name: 'Content Writer', status: 'active', currentTask: 'Blog post draft', model: 'claude-haiku-4-5' },
  { name: 'Data Processor', status: 'error', currentTask: 'Data pipeline stuck', model: 'claude-haiku-4-5' },
];

const statusDot: Record<string, string> = {
  active: 'bg-green-500',
  idle: 'bg-yellow-500',
  error: 'bg-red-500',
};

export function AgentList() {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Agent Workforce</h2>
      <div className="space-y-3">
        {agents.map((agent) => (
          <div key={agent.name} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full ${statusDot[agent.status]}`} />
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{agent.name}</p>
                <p className="text-xs text-gray-500">{agent.currentTask ?? 'No active task'}</p>
              </div>
            </div>
            <span className="text-xs text-gray-400">{agent.model}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
