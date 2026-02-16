import { logger } from '@eaf/core';
import type { Alert, AlertChannel } from '../alert-engine.js';

export interface SlackAlertConfig {
  webhookUrl: string;
  channel?: string;
}

const SEVERITY_EMOJI: Record<string, string> = {
  info: ':information_source:',
  warning: ':warning:',
  critical: ':rotating_light:',
};

export class SlackAlertChannel implements AlertChannel {
  readonly name = 'slack';
  private config: SlackAlertConfig;

  constructor(config: SlackAlertConfig) {
    this.config = config;
  }

  async send(alert: Alert): Promise<void> {
    const emoji = SEVERITY_EMOJI[alert.severity] ?? ':bell:';
    const payload = {
      channel: this.config.channel,
      text: `${emoji} *${alert.title}*`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: [
              `${emoji} *${alert.title}*`,
              `*Severity:* ${alert.severity}`,
              `*Message:* ${alert.message}`,
              `*Fired:* ${alert.firedAt.toISOString()}`,
            ].join('\n'),
          },
        },
      ],
    };

    try {
      const res = await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`Slack webhook returned ${res.status}`);
      }
      logger.info('Slack alert sent', { alertId: alert.id });
    } catch (err) {
      logger.error('Failed to send Slack alert', { error: String(err) });
      throw err;
    }
  }
}
