import type { DashboardData } from '../dashboard-engine.js';
import type { ROIResult } from '../../outcome-engine/roi-calculator.js';

export interface CEODashboard {
  totalAIImpact: number;
  topAreas: { name: string; impact: number }[];
  riskSummary: string;
  roi: ROIResult;
  dashboardData: DashboardData;
}

export function buildCEOView(dashboardData: DashboardData, roi: ROIResult): CEODashboard {
  const topAreas = dashboardData.metrics
    .map((m) => ({ name: m.name, impact: m.change }))
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
    .slice(0, 5);

  const criticalCount = dashboardData.metrics.filter((m) => m.status === 'critical').length;
  const riskSummary = criticalCount > 0
    ? `${criticalCount} critical metric(s) require attention.`
    : 'No critical risks identified.';

  return {
    totalAIImpact: dashboardData.metrics.reduce((sum, m) => sum + m.change, 0),
    topAreas,
    riskSummary,
    roi,
    dashboardData,
  };
}
