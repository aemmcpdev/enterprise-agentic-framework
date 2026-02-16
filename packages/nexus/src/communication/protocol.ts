export interface AgentMessage {
  id: string;
  from: string;
  to: string;
  type: 'request' | 'response' | 'broadcast' | 'notification';
  payload: Record<string, unknown>;
  correlationId?: string;
  timestamp: Date;
}

export interface ProtocolHandler {
  handle(message: AgentMessage): Promise<AgentMessage | void>;
}

export class MessageProtocol {
  private handlers: Map<string, ProtocolHandler> = new Map();

  register(agentId: string, handler: ProtocolHandler): void {
    this.handlers.set(agentId, handler);
  }

  async send(message: Omit<AgentMessage, 'id' | 'timestamp'>): Promise<AgentMessage | void> {
    const full: AgentMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date(),
    };

    const handler = this.handlers.get(message.to);
    if (handler) {
      return handler.handle(full);
    }

    return undefined;
  }

  broadcast(from: string, payload: Record<string, unknown>): void {
    for (const [agentId, handler] of this.handlers) {
      if (agentId !== from) {
        handler.handle({
          id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          from,
          to: agentId,
          type: 'broadcast',
          payload,
          timestamp: new Date(),
        });
      }
    }
  }
}
