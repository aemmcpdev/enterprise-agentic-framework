import { Card } from './ui/card';

const stats = [
  { label: 'Active Agents', value: '12', change: '+2', changeType: 'positive' as const },
  { label: 'Tasks Today', value: '1,847', change: '+23%', changeType: 'positive' as const },
  { label: 'Error Rate', value: '0.3%', change: '-0.1%', changeType: 'positive' as const },
  { label: 'Est. ROI', value: '$24,500', change: '+$3,200', changeType: 'positive' as const },
];

export function StatsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
          <p className={`text-sm mt-1 ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
            {stat.change}
          </p>
        </Card>
      ))}
    </div>
  );
}
