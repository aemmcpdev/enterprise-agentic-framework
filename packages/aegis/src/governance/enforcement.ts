import { logger } from '@eaf/core';
import type { PolicyEvaluationResult } from './policy-engine.js';
import { PolicyEngine } from './policy-engine.js';

export class PolicyEnforcement {
  private engine: PolicyEngine;

  constructor(engine: PolicyEngine) {
    this.engine = engine;
  }

  async enforce(agentId: string, action: string, metadata: Record<string, unknown> = {}): Promise<PolicyEvaluationResult & { proceed: boolean }> {
    const result = this.engine.evaluate(agentId, action, metadata);

    if (result.denied) {
      logger.warn('Action denied by policy', { agentId, action, reason: result.reason });
      return { ...result, proceed: false };
    }

    if (result.requiresApproval) {
      logger.info('Action requires approval', { agentId, action, reason: result.reason });
      return { ...result, proceed: false };
    }

    return { ...result, proceed: true };
  }
}
