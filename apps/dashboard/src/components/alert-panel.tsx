import { Card } from './ui/card';

const alerts = [
  { title: 'High Error Rate', severity: 'critical' as const, time: '10 min ago' },
  { title: 'Cost Budget Warning', severity: 'warning' as const, time: '1 hour ago' },
];

const severityBadge: Record<string, string> = {
  critical: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
};

export function AlertPanel() {
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Alerts</h2>
      {alerts.length === 0 ? (
        <p className="text-sm text-gray-500">No active alerts</p>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.title} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${severityBadge[alert.severity]}`}>
                  {alert.severity}
                </span>
                <span className="text-sm text-gray-900 dark:text-white">{alert.title}</span>
              </div>
              <span className="text-xs text-gray-400">{alert.time}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
