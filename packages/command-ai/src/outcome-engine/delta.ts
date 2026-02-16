import type { Baseline } from './baseline.js';
import type { Measurement } from './measurement.js';

export interface Delta {
  metricName: string;
  before: number;
  after: number;
  change: number;
  changePercent: number;
  improved: boolean;
}

export class DeltaCalculator {
  calculate(baseline: Baseline, measurements: Measurement[]): Delta {
    const recent = measurements
      .filter((m) => m.metricName === baseline.metricName && m.agentId === baseline.agentId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const after = recent.length > 0 ? recent[0]!.value : baseline.value;
    const change = after - baseline.value;
    const changePercent = baseline.value !== 0 ? (change / Math.abs(baseline.value)) * 100 : 0;

    return {
      metricName: baseline.metricName,
      before: baseline.value,
      after,
      change,
      changePercent,
      improved: change > 0,
    };
  }

  calculateAll(baselines: Baseline[], measurements: Measurement[]): Delta[] {
    return baselines.map((bl) => this.calculate(bl, measurements));
  }
}
