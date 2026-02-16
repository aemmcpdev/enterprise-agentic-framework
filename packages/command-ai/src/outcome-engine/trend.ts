import type { Measurement } from './measurement.js';

export interface TrendData {
  metricName: string;
  dataPoints: { timestamp: Date; value: number }[];
  trend: 'improving' | 'declining' | 'stable';
}

export class TrendAnalyzer {
  analyze(measurements: Measurement[], metricName: string): TrendData {
    const filtered = measurements
      .filter((m) => m.metricName === metricName)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    const dataPoints = filtered.map((m) => ({ timestamp: m.timestamp, value: m.value }));

    let trend: TrendData['trend'] = 'stable';

    if (dataPoints.length >= 3) {
      const recent = dataPoints.slice(-3);
      const first = recent[0]!.value;
      const last = recent[recent.length - 1]!.value;
      const change = ((last - first) / Math.abs(first || 1)) * 100;

      if (change > 5) trend = 'improving';
      else if (change < -5) trend = 'declining';
    }

    return { metricName, dataPoints, trend };
  }

  analyzeAll(measurements: Measurement[]): TrendData[] {
    const metricNames = [...new Set(measurements.map((m) => m.metricName))];
    return metricNames.map((name) => this.analyze(measurements, name));
  }
}
