import type { FastifyInstance } from 'fastify';
import { logger, generateId } from '@eaf/core';
import type { AppContext } from '../context.js';
import type { WSEventType } from '@eaf/command-ai';

export function registerWebSocketHandler(app: FastifyInstance, ctx: AppContext): void {
  app.get('/ws', { websocket: true }, (socket) => {
    const clientId = generateId('evt');

    ctx.wsManager.addClient({
      id: clientId,
      send: (message: string) => socket.send(message),
      subscriptions: new Set<WSEventType>(),
    });

    logger.info('WebSocket client connected', { clientId });

    socket.on('message', (raw: Buffer) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'subscribe' && msg.event) {
          ctx.wsManager.subscribe(clientId, msg.event);
        } else if (msg.type === 'unsubscribe' && msg.event) {
          ctx.wsManager.unsubscribe(clientId, msg.event);
        }
      } catch {
        // Ignore malformed messages
      }
    });

    socket.on('close', () => {
      ctx.wsManager.removeClient(clientId);
      logger.info('WebSocket client disconnected', { clientId });
    });
  });
}
