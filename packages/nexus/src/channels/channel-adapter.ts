export interface IncomingMessage {
  id: string;
  channel: string;
  content: string;
  sender: string;
  metadata: Record<string, unknown>;
  timestamp: Date;
}

export interface OutgoingMessage {
  channel: string;
  content: string;
  recipient?: string;
  metadata?: Record<string, unknown>;
}

export abstract class ChannelAdapter {
  abstract readonly channelType: string;
  abstract connect(config: Record<string, unknown>): Promise<void>;
  abstract disconnect(): Promise<void>;
  abstract send(message: OutgoingMessage): Promise<void>;
  abstract onMessage(handler: (message: IncomingMessage) => void): void;
}
