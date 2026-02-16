import { logger } from '@eaf/core';

export interface CrossFunctionalTask {
  id: string;
  description: string;
  requiredAgents: string[];
  status: 'pending' | 'active' | 'completed';
  findings: string[];
}

export class HorizontalOrchestrator {
  private tasks: Map<string, CrossFunctionalTask> = new Map();

  createTask(id: string, description: string, requiredAgents: string[]): CrossFunctionalTask {
    const task: CrossFunctionalTask = {
      id,
      description,
      requiredAgents,
      status: 'pending',
      findings: [],
    };
    this.tasks.set(id, task);
    logger.info('Cross-functional task created', { id, agents: requiredAgents });
    return task;
  }

  addFinding(taskId: string, finding: string): void {
    const task = this.tasks.get(taskId);
    if (task) task.findings.push(finding);
  }

  completeTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (task) task.status = 'completed';
  }

  getTask(taskId: string): CrossFunctionalTask | undefined {
    return this.tasks.get(taskId);
  }

  listTasks(): CrossFunctionalTask[] {
    return Array.from(this.tasks.values());
  }
}
