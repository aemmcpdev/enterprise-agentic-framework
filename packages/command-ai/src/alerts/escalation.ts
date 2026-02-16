import { logger } from '@eaf/core';
import type { Alert, AlertChannel, AlertSeverity } from './alert-engine.js';

export interface EscalationLevel {
  severity: AlertSeverity;
  afterMinutes: number;
  channels: AlertChannel[];
}

export class AlertEscalationManager {
  private levels: EscalationLevel[] = [];
  private escalationTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

  addLevel(level: EscalationLevel): void {
    this.levels.push(level);
    this.levels.sort((a, b) => a.afterMinutes - b.afterMinutes);
  }

  startEscalation(alert: Alert): void {
    const applicableLevels = this.levels.filter((l) => this.severityRank(l.severity) <= this.severityRank(alert.severity));

    for (const level of applicableLevels) {
      const timer = setTimeout(async () => {
        logger.warn('Alert escalated', { alertId: alert.id, afterMinutes: level.afterMinutes });
        for (const channel of level.channels) {
          try {
            await channel.send({ ...alert, message: `[ESCALATED after ${level.afterMinutes}m] ${alert.message}` });
          } catch (err) {
            logger.error('Escalation channel failed', { error: String(err) });
          }
        }
      }, level.afterMinutes * 60 * 1000);

      this.escalationTimers.set(`${alert.id}:${level.afterMinutes}`, timer);
    }
  }

  cancelEscalation(alertId: string): void {
    for (const [key, timer] of this.escalationTimers) {
      if (key.startsWith(`${alertId}:`)) {
        clearTimeout(timer);
        this.escalationTimers.delete(key);
      }
    }
  }

  dispose(): void {
    for (const timer of this.escalationTimers.values()) {
      clearTimeout(timer);
    }
    this.escalationTimers.clear();
  }

  private severityRank(severity: AlertSeverity): number {
    switch (severity) {
      case 'info': return 0;
      case 'warning': return 1;
      case 'critical': return 2;
      default: return 0;
    }
  }
}
