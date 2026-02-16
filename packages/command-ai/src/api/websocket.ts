import { logger } from '@eaf/core';

export type WSEventType = 'alert' | 'metric' | 'agent_status' | 'dashboard_update';

export interface WSMessage {
  type: WSEventType;
  payload: unknown;
  timestamp: string;
}

export interface WSClient {
  id: string;
  send(message: string): void;
  subscriptions: Set<WSEventType>;
}

export class WebSocketManager {
  private clients: Map<string, WSClient> = new Map();

  addClient(client: WSClient): void {
    this.clients.set(client.id, client);
    logger.info('WebSocket client connected', { clientId: client.id });
  }

  removeClient(clientId: string): void {
    this.clients.delete(clientId);
    logger.info('WebSocket client disconnected', { clientId });
  }

  subscribe(clientId: string, eventType: WSEventType): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.subscriptions.add(eventType);
    }
  }

  unsubscribe(clientId: string, eventType: WSEventType): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.subscriptions.delete(eventType);
    }
  }

  broadcast(type: WSEventType, payload: unknown): void {
    const message: WSMessage = {
      type,
      payload,
      timestamp: new Date().toISOString(),
    };
    const data = JSON.stringify(message);

    let sent = 0;
    for (const client of this.clients.values()) {
      if (client.subscriptions.size === 0 || client.subscriptions.has(type)) {
        try {
          client.send(data);
          sent++;
        } catch (err) {
          logger.error('Failed to send to WebSocket client', { clientId: client.id, error: String(err) });
          this.removeClient(client.id);
        }
      }
    }

    logger.debug('WebSocket broadcast', { type, recipients: sent });
  }

  getClientCount(): number {
    return this.clients.size;
  }
}
