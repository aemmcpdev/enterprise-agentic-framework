import type { DashboardData } from '../dashboard-engine.js';

export interface VPDashboard {
  strategicGoals: { name: string; progress: number; status: string }[];
  dashboardData: DashboardData;
}

export function buildVPView(dashboardData: DashboardData, goals: { name: string; progress: number; status: string }[] = []): VPDashboard {
  return { strategicGoals: goals, dashboardData };
}
