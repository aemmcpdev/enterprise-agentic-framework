import type { FastifyInstance } from 'fastify';

export function registerHealthRoutes(app: FastifyInstance): void {
  app.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
    };
  });

  app.get('/ready', async () => {
    return { ready: true };
  });
}
