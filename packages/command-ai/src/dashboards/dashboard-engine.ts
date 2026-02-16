import { logger } from '@eaf/core';
import type { Baseline } from '../outcome-engine/baseline.js';
import type { Measurement } from '../outcome-engine/measurement.js';
import { DeltaCalculator } from '../outcome-engine/delta.js';
import { TrendAnalyzer } from '../outcome-engine/trend.js';

export interface DashboardMetric {
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changePercent: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
}

export interface DashboardData {
  level: 'ceo' | 'vp' | 'director' | 'team_lead' | 'agent';
  entityId?: string;
  period: { start: Date; end: Date };
  metrics: DashboardMetric[];
  trends: { metricName: string; trend: string }[];
}

export class DashboardEngine {
  private deltaCalc = new DeltaCalculator();
  private trendAnalyzer = new TrendAnalyzer();

  build(level: DashboardData['level'], baselines: Baseline[], measurements: Measurement[], entityId?: string): DashboardData {
    const period = { start: new Date(Date.now() - 30 * 86400000), end: new Date() };

    const metrics: DashboardMetric[] = baselines.map((bl) => {
      const agentMeasurements = measurements.filter((m) => m.agentId === bl.agentId && m.metricName === bl.metricName);
      const delta = this.deltaCalc.calculate(bl, agentMeasurements);

      let status: DashboardMetric['status'] = 'good';
      if (Math.abs(delta.changePercent) > 20 && delta.change < 0) status = 'critical';
      else if (Math.abs(delta.changePercent) > 10 && delta.change < 0) status = 'warning';

      return {
        name: bl.metricName,
        value: delta.after,
        previousValue: delta.before,
        change: delta.change,
        changePercent: delta.changePercent,
        unit: bl.unit,
        status,
      };
    });

    const trends = this.trendAnalyzer.analyzeAll(measurements).map((t) => ({
      metricName: t.metricName,
      trend: t.trend,
    }));

    return { level, entityId, period, metrics, trends };
  }
}
