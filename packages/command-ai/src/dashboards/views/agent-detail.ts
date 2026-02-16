import type { DashboardData } from '../dashboard-engine.js';

export interface AgentDetailDashboard {
  agentId: string;
  name: string;
  status: string;
  uptime: number;
  totalTasksCompleted: number;
  avgResponseTime: number;
  errorRate: number;
  costToDate: number;
  dashboardData: DashboardData;
}

export function buildAgentDetailView(agentId: string, name: string, stats: { uptime: number; tasks: number; avgResponse: number; errorRate: number; cost: number }, dashboardData: DashboardData): AgentDetailDashboard {
  return {
    agentId,
    name,
    status: stats.errorRate < 0.1 ? 'healthy' : 'degraded',
    uptime: stats.uptime,
    totalTasksCompleted: stats.tasks,
    avgResponseTime: stats.avgResponse,
    errorRate: stats.errorRate,
    costToDate: stats.cost,
    dashboardData,
  };
}
