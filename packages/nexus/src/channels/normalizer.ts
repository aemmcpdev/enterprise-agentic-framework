import type { IncomingMessage } from './channel-adapter.js';

export interface NormalizedMessage {
  id: string;
  channel: string;
  text: string;
  sender: string;
  intent?: string;
  entities?: Record<string, string>;
  timestamp: Date;
}

export class MessageNormalizer {
  normalize(message: IncomingMessage): NormalizedMessage {
    return {
      id: message.id,
      channel: message.channel,
      text: message.content.trim(),
      sender: message.sender,
      timestamp: message.timestamp,
    };
  }
}
