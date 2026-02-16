import type { IncomingMessage, OutgoingMessage } from '../channel-adapter.js';
import { ChannelAdapter } from '../channel-adapter.js';

export class APIChannelAdapter extends ChannelAdapter {
  readonly channelType = 'api';
  private messageHandlers: ((message: IncomingMessage) => void)[] = [];
  private webhookUrl?: string;

  async connect(config: Record<string, unknown>): Promise<void> {
    this.webhookUrl = config.webhookUrl as string | undefined;
  }

  async disconnect(): Promise<void> {
    this.messageHandlers = [];
  }

  async send(message: OutgoingMessage): Promise<void> {
    if (this.webhookUrl) {
      await fetch(this.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
    }
  }

  onMessage(handler: (message: IncomingMessage) => void): void {
    this.messageHandlers.push(handler);
  }

  handleIncoming(body: Record<string, unknown>): void {
    const message: IncomingMessage = {
      id: `api_${Date.now()}`,
      channel: 'api',
      content: (body.content as string) || '',
      sender: (body.sender as string) || 'api',
      metadata: body,
      timestamp: new Date(),
    };

    for (const handler of this.messageHandlers) {
      handler(message);
    }
  }
}
