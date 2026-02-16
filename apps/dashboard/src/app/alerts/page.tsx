'use client';

import { Card } from '@/components/ui/card';

interface AlertItem {
  id: string;
  title: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'firing' | 'acknowledged' | 'resolved';
  message: string;
  firedAt: string;
}

const mockAlerts: AlertItem[] = [
  { id: 'a1', title: 'High Error Rate', severity: 'critical', status: 'firing', message: 'error_rate > 0.1 (current: 0.15)', firedAt: '2025-01-15T10:30:00Z' },
  { id: 'a2', title: 'Cost Budget Warning', severity: 'warning', status: 'acknowledged', message: 'total_cost > 5000 (current: 5234)', firedAt: '2025-01-15T09:15:00Z' },
  { id: 'a3', title: 'Agent Down', severity: 'critical', status: 'resolved', message: 'unhealthy_agents > 0 (current: 1)', firedAt: '2025-01-15T08:00:00Z' },
];

const severityColors = {
  info: 'border-blue-500 bg-blue-50 dark:bg-blue-950',
  warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950',
  critical: 'border-red-500 bg-red-50 dark:bg-red-950',
};

export default function AlertsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alerts</h1>

      <div className="space-y-3">
        {mockAlerts.map((alert) => (
          <Card key={alert.id} className={`p-4 border-l-4 ${severityColors[alert.severity]}`}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-900 dark:text-white">{alert.title}</h3>
              <span className="text-xs text-gray-500">{alert.status}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{alert.message}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(alert.firedAt).toLocaleString()}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
