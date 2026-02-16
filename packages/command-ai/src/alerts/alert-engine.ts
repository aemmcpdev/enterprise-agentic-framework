import { logger, generateId } from '@eaf/core';
import type { AlertRule } from './alert-rules.js';

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertStatus = 'firing' | 'acknowledged' | 'resolved';

export interface Alert {
  id: string;
  ruleId: string;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  context: Record<string, unknown>;
  firedAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
}

export interface AlertChannel {
  name: string;
  send(alert: Alert): Promise<void>;
}

export class AlertEngine {
  private rules: Map<string, AlertRule> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private channels: AlertChannel[] = [];

  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
  }

  removeRule(id: string): void {
    this.rules.delete(id);
  }

  addChannel(channel: AlertChannel): void {
    this.channels.push(channel);
  }

  async evaluate(metrics: Record<string, number>): Promise<Alert[]> {
    const fired: Alert[] = [];

    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      const value = metrics[rule.metric];
      if (value === undefined) continue;

      const triggered = this.checkCondition(value, rule.operator, rule.threshold);
      if (!triggered) continue;

      const existing = this.findActiveAlert(rule.id);
      if (existing) continue;

      const alert: Alert = {
        id: generateId('evt'),
        ruleId: rule.id,
        severity: rule.severity,
        status: 'firing',
        title: rule.name,
        message: `${rule.metric} ${rule.operator} ${rule.threshold} (current: ${value})`,
        context: { metric: rule.metric, value, threshold: rule.threshold },
        firedAt: new Date(),
      };

      this.alerts.set(alert.id, alert);
      fired.push(alert);

      for (const channel of this.channels) {
        try {
          await channel.send(alert);
        } catch (err) {
          logger.error('Failed to send alert via channel', { channel: channel.name, error: String(err) });
        }
      }

      logger.warn('Alert fired', { alertId: alert.id, rule: rule.name, severity: rule.severity });
    }

    return fired;
  }

  acknowledge(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert && alert.status === 'firing') {
      alert.status = 'acknowledged';
      alert.acknowledgedAt = new Date();
    }
  }

  resolve(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert && alert.status !== 'resolved') {
      alert.status = 'resolved';
      alert.resolvedAt = new Date();
    }
  }

  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter((a) => a.status !== 'resolved');
  }

  getAlertHistory(limit = 100): Alert[] {
    return Array.from(this.alerts.values())
      .sort((a, b) => b.firedAt.getTime() - a.firedAt.getTime())
      .slice(0, limit);
  }

  private findActiveAlert(ruleId: string): Alert | undefined {
    return Array.from(this.alerts.values()).find(
      (a) => a.ruleId === ruleId && a.status !== 'resolved',
    );
  }

  private checkCondition(value: number, operator: AlertRule['operator'], threshold: number): boolean {
    switch (operator) {
      case 'gt': return value > threshold;
      case 'gte': return value >= threshold;
      case 'lt': return value < threshold;
      case 'lte': return value <= threshold;
      case 'eq': return value === threshold;
      default: return false;
    }
  }
}
