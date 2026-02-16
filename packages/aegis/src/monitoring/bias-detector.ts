import { logger } from '@eaf/core';

export interface BiasReport {
  agentId: string;
  metric: string;
  expectedDistribution: Record<string, number>;
  actualDistribution: Record<string, number>;
  deviationScore: number;
  flagged: boolean;
  timestamp: Date;
}

export class BiasDetector {
  private threshold = 0.2;
  private reports: BiasReport[] = [];

  setThreshold(threshold: number): void {
    this.threshold = threshold;
  }

  detect(agentId: string, metric: string, expected: Record<string, number>, actual: Record<string, number>): BiasReport {
    let totalDeviation = 0;
    const keys = new Set([...Object.keys(expected), ...Object.keys(actual)]);

    for (const key of keys) {
      const exp = expected[key] || 0;
      const act = actual[key] || 0;
      totalDeviation += Math.abs(exp - act);
    }

    const deviationScore = totalDeviation / (keys.size || 1);
    const flagged = deviationScore > this.threshold;

    const report: BiasReport = {
      agentId,
      metric,
      expectedDistribution: expected,
      actualDistribution: actual,
      deviationScore,
      flagged,
      timestamp: new Date(),
    };

    this.reports.push(report);

    if (flagged) {
      logger.warn('Bias detected', { agentId, metric, deviationScore });
    }

    return report;
  }

  getReports(agentId?: string): BiasReport[] {
    if (agentId) return this.reports.filter((r) => r.agentId === agentId);
    return [...this.reports];
  }

  getFlaggedReports(): BiasReport[] {
    return this.reports.filter((r) => r.flagged);
  }
}
