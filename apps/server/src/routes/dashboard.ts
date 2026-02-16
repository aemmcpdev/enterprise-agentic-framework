import type { FastifyInstance } from 'fastify';
import type { AppContext } from '../context.js';

export function registerDashboardRoutes(app: FastifyInstance, ctx: AppContext): void {
  app.get('/api/v1/dashboard', async () => {
    return ctx.dashboardEngine.buildDashboard();
  });

  app.get('/api/v1/dashboard/summary', async () => {
    const data = ctx.dashboardEngine.buildDashboard();
    return {
      totalAgents: 0,
      activeAlerts: ctx.alertEngine.getActiveAlerts().length,
      dashboardData: data,
    };
  });
}
