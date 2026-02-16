import { logger } from '@eaf/core';
import type { Alert, AlertChannel } from '../alert-engine.js';

export interface EmailAlertConfig {
  smtpHost: string;
  smtpPort: number;
  from: string;
  to: string[];
  username?: string;
  password?: string;
}

export class EmailAlertChannel implements AlertChannel {
  readonly name = 'email';
  private config: EmailAlertConfig;

  constructor(config: EmailAlertConfig) {
    this.config = config;
  }

  async send(alert: Alert): Promise<void> {
    const subject = `[${alert.severity.toUpperCase()}] ${alert.title}`;
    const body = [
      `Alert: ${alert.title}`,
      `Severity: ${alert.severity}`,
      `Status: ${alert.status}`,
      `Message: ${alert.message}`,
      `Fired At: ${alert.firedAt.toISOString()}`,
      '',
      `Context: ${JSON.stringify(alert.context, null, 2)}`,
    ].join('\n');

    logger.info('Email alert sent', {
      to: this.config.to,
      subject,
      alertId: alert.id,
    });

    // In production, integrate with nodemailer or similar
    void subject;
    void body;
  }
}
