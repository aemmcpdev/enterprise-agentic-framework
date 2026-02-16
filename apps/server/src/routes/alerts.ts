import type { FastifyInstance } from 'fastify';
import type { AppContext } from '../context.js';

export function registerAlertRoutes(app: FastifyInstance, ctx: AppContext): void {
  app.get('/api/v1/alerts', async () => {
    return { alerts: ctx.alertEngine.getActiveAlerts() };
  });

  app.get('/api/v1/alerts/history', async () => {
    return { alerts: ctx.alertEngine.getAlertHistory() };
  });

  app.post<{ Params: { id: string } }>('/api/v1/alerts/:id/acknowledge', async (req) => {
    ctx.alertEngine.acknowledge(req.params.id);
    return { success: true };
  });

  app.post<{ Params: { id: string } }>('/api/v1/alerts/:id/resolve', async (req) => {
    ctx.alertEngine.resolve(req.params.id);
    return { success: true };
  });
}
