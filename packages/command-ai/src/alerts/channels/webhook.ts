import { logger } from '@eaf/core';
import type { Alert, AlertChannel } from '../alert-engine.js';

export interface WebhookAlertConfig {
  url: string;
  headers?: Record<string, string>;
  method?: 'POST' | 'PUT';
}

export class WebhookAlertChannel implements AlertChannel {
  readonly name = 'webhook';
  private config: WebhookAlertConfig;

  constructor(config: WebhookAlertConfig) {
    this.config = config;
  }

  async send(alert: Alert): Promise<void> {
    const payload = {
      id: alert.id,
      ruleId: alert.ruleId,
      severity: alert.severity,
      status: alert.status,
      title: alert.title,
      message: alert.message,
      context: alert.context,
      firedAt: alert.firedAt.toISOString(),
    };

    try {
      const res = await fetch(this.config.url, {
        method: this.config.method ?? 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.config.headers,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`Webhook returned ${res.status}`);
      }
      logger.info('Webhook alert sent', { alertId: alert.id, url: this.config.url });
    } catch (err) {
      logger.error('Failed to send webhook alert', { error: String(err) });
      throw err;
    }
  }
}
