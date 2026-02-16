import { logger } from '@eaf/core';

export interface AnomalyAlert {
  agentId: string;
  metric: string;
  value: number;
  expectedRange: [number, number];
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
}

export class AnomalyDetector {
  private baselines: Map<string, number[]> = new Map();
  private alerts: AnomalyAlert[] = [];
  private stdDevMultiplier = 2;

  recordValue(key: string, value: number): void {
    const values = this.baselines.get(key) || [];
    values.push(value);
    if (values.length > 1000) values.shift();
    this.baselines.set(key, values);
  }

  check(agentId: string, metric: string, value: number): AnomalyAlert | null {
    const key = `${agentId}:${metric}`;
    const values = this.baselines.get(key);

    if (!values || values.length < 10) {
      this.recordValue(key, value);
      return null;
    }

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length);
    const lower = mean - this.stdDevMultiplier * stdDev;
    const upper = mean + this.stdDevMultiplier * stdDev;

    this.recordValue(key, value);

    if (value < lower || value > upper) {
      const deviation = Math.abs(value - mean) / (stdDev || 1);
      let severity: AnomalyAlert['severity'] = 'low';
      if (deviation > 4) severity = 'critical';
      else if (deviation > 3) severity = 'high';
      else if (deviation > 2) severity = 'medium';

      const alert: AnomalyAlert = {
        agentId,
        metric,
        value,
        expectedRange: [lower, upper],
        severity,
        timestamp: new Date(),
      };

      this.alerts.push(alert);
      logger.warn('Anomaly detected', { agentId, metric, value, severity });
      return alert;
    }

    return null;
  }

  getAlerts(agentId?: string): AnomalyAlert[] {
    if (agentId) return this.alerts.filter((a) => a.agentId === agentId);
    return [...this.alerts];
  }
}
