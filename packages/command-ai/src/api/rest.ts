import { logger } from '@eaf/core';
import type { AlertEngine } from '../alerts/alert-engine.js';
import type { DashboardEngine } from '../dashboards/dashboard-engine.js';
import type { NetworkDesigner } from '../network-designer/designer.js';

export interface CommandAPIConfig {
  port: number;
  host: string;
  corsOrigins?: string[];
}

export interface CommandAPIRoutes {
  dashboardEngine: DashboardEngine;
  alertEngine: AlertEngine;
  networkDesigner: NetworkDesigner;
}

export interface RouteDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  handler: (req: unknown, res: unknown) => Promise<unknown>;
}

export function buildRoutes(services: CommandAPIRoutes): RouteDefinition[] {
  const routes: RouteDefinition[] = [];

  // Dashboard routes
  routes.push({
    method: 'GET',
    path: '/api/v1/dashboard',
    handler: async () => {
      return services.dashboardEngine.buildDashboard();
    },
  });

  // Alert routes
  routes.push({
    method: 'GET',
    path: '/api/v1/alerts',
    handler: async () => {
      return services.alertEngine.getActiveAlerts();
    },
  });

  routes.push({
    method: 'GET',
    path: '/api/v1/alerts/history',
    handler: async () => {
      return services.alertEngine.getAlertHistory();
    },
  });

  routes.push({
    method: 'POST',
    path: '/api/v1/alerts/:id/acknowledge',
    handler: async (req: unknown) => {
      const { id } = (req as { params: { id: string } }).params;
      services.alertEngine.acknowledge(id);
      return { success: true };
    },
  });

  routes.push({
    method: 'POST',
    path: '/api/v1/alerts/:id/resolve',
    handler: async (req: unknown) => {
      const { id } = (req as { params: { id: string } }).params;
      services.alertEngine.resolve(id);
      return { success: true };
    },
  });

  // Network designer routes
  routes.push({
    method: 'GET',
    path: '/api/v1/designs',
    handler: async () => {
      return services.networkDesigner.listDesigns();
    },
  });

  routes.push({
    method: 'POST',
    path: '/api/v1/designs',
    handler: async (req: unknown) => {
      const body = (req as { body: { name: string; description: string; agentCount: number } }).body;
      return services.networkDesigner.createDesign(body.name, body.description, body.agentCount);
    },
  });

  logger.info('Command API routes built', { count: routes.length });
  return routes;
}
