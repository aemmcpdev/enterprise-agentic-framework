import type { IncomingMessage, OutgoingMessage } from '../channel-adapter.js';
import { ChannelAdapter } from '../channel-adapter.js';

export class WebChannelAdapter extends ChannelAdapter {
  readonly channelType = 'web';
  private messageHandlers: ((message: IncomingMessage) => void)[] = [];
  private outbox: OutgoingMessage[] = [];

  async connect(): Promise<void> {
    // Web channel is always connected
  }

  async disconnect(): Promise<void> {
    this.messageHandlers = [];
  }

  async send(message: OutgoingMessage): Promise<void> {
    this.outbox.push(message);
  }

  onMessage(handler: (message: IncomingMessage) => void): void {
    this.messageHandlers.push(handler);
  }

  // Called by web API to inject messages
  receiveMessage(content: string, sender: string, metadata: Record<string, unknown> = {}): void {
    const message: IncomingMessage = {
      id: `web_${Date.now()}`,
      channel: 'web',
      content,
      sender,
      metadata,
      timestamp: new Date(),
    };

    for (const handler of this.messageHandlers) {
      handler(message);
    }
  }

  getOutbox(): OutgoingMessage[] {
    const messages = [...this.outbox];
    this.outbox = [];
    return messages;
  }
}
