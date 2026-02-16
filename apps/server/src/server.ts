import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import { logger } from '@eaf/core';
import { registerAgentRoutes } from './routes/agents.js';
import { registerTaskRoutes } from './routes/tasks.js';
import { registerDashboardRoutes } from './routes/dashboard.js';
import { registerAlertRoutes } from './routes/alerts.js';
import { registerHealthRoutes } from './routes/health.js';
import { registerWebSocketHandler } from './ws/handler.js';
import { createAppContext } from './context.js';

export async function createServer() {
  const app = Fastify({
    logger: false,
  });

  await app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? '*',
  });

  await app.register(websocket);

  const ctx = createAppContext();

  // Register route groups
  registerHealthRoutes(app);
  registerAgentRoutes(app, ctx);
  registerTaskRoutes(app, ctx);
  registerDashboardRoutes(app, ctx);
  registerAlertRoutes(app, ctx);
  registerWebSocketHandler(app, ctx);

  logger.info('Server routes registered');

  return app;
}
