import type { DashboardData } from '../dashboard-engine.js';

export interface DirectorDashboard {
  supervisors: { id: string; name: string; status: string; taskCount: number }[];
  pendingApprovals: number;
  dashboardData: DashboardData;
}

export function buildDirectorView(dashboardData: DashboardData, supervisors: DirectorDashboard['supervisors'] = [], pendingApprovals = 0): DirectorDashboard {
  return { supervisors, pendingApprovals, dashboardData };
}
