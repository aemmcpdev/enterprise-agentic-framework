import type { FastifyInstance } from 'fastify';
import { logger } from '@eaf/core';
import type { AppContext } from '../context.js';

export function registerAgentRoutes(app: FastifyInstance, ctx: AppContext): void {
  // List all registered agents
  app.get('/api/v1/agents', async () => {
    const agents = ctx.hierarchyManager.getAllAgents();
    return { agents };
  });

  // Get agent by ID
  app.get<{ Params: { id: string } }>('/api/v1/agents/:id', async (req, reply) => {
    const agent = ctx.hierarchyManager.getAgent(req.params.id);
    if (!agent) {
      return reply.status(404).send({ error: 'Agent not found' });
    }
    return agent;
  });

  // Create agent from template
  app.post<{ Body: { templateName: string; overrides?: Record<string, unknown> } }>(
    '/api/v1/agents',
    async (req, reply) => {
      try {
        const { templateName, overrides } = req.body;
        const config = ctx.agentFactory.createFromTemplate(templateName, overrides);
        logger.info('Agent created via API', { agentId: config.id, template: templateName });
        return reply.status(201).send(config);
      } catch (err) {
        return reply.status(400).send({ error: String(err) });
      }
    },
  );

  // Delete agent
  app.delete<{ Params: { id: string } }>('/api/v1/agents/:id', async (req, reply) => {
    const removed = ctx.hierarchyManager.removeAgent(req.params.id);
    if (!removed) {
      return reply.status(404).send({ error: 'Agent not found' });
    }
    return { success: true };
  });
}
