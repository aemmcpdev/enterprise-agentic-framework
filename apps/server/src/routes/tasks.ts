import type { FastifyInstance } from 'fastify';
import { logger, generateId } from '@eaf/core';
import type { AppContext } from '../context.js';

interface TaskRecord {
  id: string;
  agentId: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: unknown;
  createdAt: Date;
  completedAt?: Date;
}

const tasks = new Map<string, TaskRecord>();

export function registerTaskRoutes(app: FastifyInstance, ctx: AppContext): void {
  // Submit a new task
  app.post<{ Body: { agentId: string; description: string } }>(
    '/api/v1/tasks',
    async (req, reply) => {
      const { agentId, description } = req.body;
      const agent = ctx.hierarchyManager.getAgent(agentId);
      if (!agent) {
        return reply.status(404).send({ error: 'Agent not found' });
      }

      const task: TaskRecord = {
        id: generateId('tsk'),
        agentId,
        description,
        status: 'pending',
        createdAt: new Date(),
      };

      tasks.set(task.id, task);
      logger.info('Task submitted via API', { taskId: task.id, agentId });

      // Broadcast to WebSocket clients
      ctx.wsManager.broadcast('agent_status', { taskId: task.id, agentId, status: 'pending' });

      return reply.status(201).send(task);
    },
  );

  // Get task status
  app.get<{ Params: { id: string } }>('/api/v1/tasks/:id', async (req, reply) => {
    const task = tasks.get(req.params.id);
    if (!task) {
      return reply.status(404).send({ error: 'Task not found' });
    }
    return task;
  });

  // List tasks with optional filters
  app.get<{ Querystring: { agentId?: string; status?: string; limit?: string } }>(
    '/api/v1/tasks',
    async (req) => {
      let result = Array.from(tasks.values());

      if (req.query.agentId) {
        result = result.filter((t) => t.agentId === req.query.agentId);
      }
      if (req.query.status) {
        result = result.filter((t) => t.status === req.query.status);
      }

      const limit = parseInt(req.query.limit ?? '50', 10);
      return { tasks: result.slice(-limit) };
    },
  );
}
