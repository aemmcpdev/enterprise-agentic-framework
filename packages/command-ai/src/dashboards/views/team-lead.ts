import type { DashboardData } from '../dashboard-engine.js';

export interface TeamLeadDashboard {
  taskAgents: { id: string; name: string; status: string; currentTask?: string }[];
  recentActions: { agentId: string; action: string; timestamp: Date }[];
  pendingApprovals: number;
  dashboardData: DashboardData;
}

export function buildTeamLeadView(dashboardData: DashboardData, agents: TeamLeadDashboard['taskAgents'] = [], actions: TeamLeadDashboard['recentActions'] = [], pendingApprovals = 0): TeamLeadDashboard {
  return { taskAgents: agents, recentActions: actions.slice(-50), pendingApprovals, dashboardData };
}
