import { StatsGrid } from '@/components/stats-grid';
import { AgentList } from '@/components/agent-list';
import { AlertPanel } from '@/components/alert-panel';
import { ActivityFeed } from '@/components/activity-feed';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">COMMAND AI Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Mission control for your AI agent workforce</p>
      </div>

      <StatsGrid />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AgentList />
        </div>
        <div className="space-y-6">
          <AlertPanel />
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
}
