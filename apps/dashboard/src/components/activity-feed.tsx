import { Card } from './ui/card';

const activities = [
  { agent: 'Research Lead', action: 'Completed market analysis task', time: '2 min ago' },
  { agent: 'Code Analyst', action: 'Finished code review for PR #42', time: '15 min ago' },
  { agent: 'Content Writer', action: 'Started blog post draft', time: '30 min ago' },
  { agent: 'Strategic Planner', action: 'Delegated 3 tasks to supervisors', time: '1 hour ago' },
];

export function ActivityFeed() {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
      <div className="space-y-3">
        {activities.map((activity, i) => (
          <div key={i} className="flex gap-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0" />
            <div>
              <p className="text-gray-900 dark:text-white">
                <span className="font-medium">{activity.agent}</span>{' '}
                {activity.action}
              </p>
              <p className="text-xs text-gray-400">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
