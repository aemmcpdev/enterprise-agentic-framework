import { logger, generatePolicyId } from '@eaf/core';
import type { Policy, PolicyScope, PolicyCondition } from '@eaf/core';

export interface PolicyEvaluationResult {
  allowed: boolean;
  denied: boolean;
  requiresApproval: boolean;
  reason?: string;
  matchedPolicies: Policy[];
}

export class PolicyEngine {
  private policies: Map<string, Policy> = new Map();

  addPolicy(policy: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>): Policy {
    const full: Policy = {
      ...policy,
      id: generatePolicyId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.policies.set(full.id, full);
    logger.info('Policy added', { id: full.id, name: full.name, type: full.type });
    return full;
  }

  removePolicy(policyId: string): boolean {
    return this.policies.delete(policyId);
  }

  updatePolicy(policyId: string, updates: Partial<Policy>): void {
    const policy = this.policies.get(policyId);
    if (policy) {
      Object.assign(policy, updates, { updatedAt: new Date() });
    }
  }

  evaluate(agentId: string, action: string, metadata: Record<string, unknown> = {}): PolicyEvaluationResult {
    const applicable = this.getApplicablePolicies(agentId);
    let denied = false;
    let requiresApproval = false;
    let reason: string | undefined;
    const matched: Policy[] = [];

    const sorted = applicable.sort((a, b) => b.priority - a.priority);

    for (const policy of sorted) {
      const matches = this.evaluateConditions(policy.conditions, { agentId, action, ...metadata });

      if (matches) {
        matched.push(policy);

        if (policy.type === 'deny') {
          denied = true;
          reason = `Denied by policy: ${policy.name}`;
          if (policy.enforcement === 'block') break;
        }

        if (policy.type === 'require_approval') {
          requiresApproval = true;
          reason = `Requires approval: ${policy.name}`;
        }
      }
    }

    return { allowed: !denied, denied, requiresApproval: !denied && requiresApproval, reason, matchedPolicies: matched };
  }

  private getApplicablePolicies(agentId: string): Policy[] {
    return Array.from(this.policies.values()).filter((p) => {
      if (p.status !== 'active') return false;
      return this.matchesScope(p.scope, agentId);
    });
  }

  private matchesScope(scope: PolicyScope, agentId: string): boolean {
    if (scope.all) return true;
    if (scope.agentIds?.includes(agentId)) return true;
    return false;
  }

  private evaluateConditions(conditions: PolicyCondition[], context: Record<string, unknown>): boolean {
    if (conditions.length === 0) return true;
    return conditions.every((c) => {
      const value = this.resolveField(context, c.field);
      return this.evalCondition(c, value);
    });
  }

  private resolveField(context: Record<string, unknown>, field: string): unknown {
    const parts = field.split('.');
    let value: unknown = context;
    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = (value as Record<string, unknown>)[part];
      } else {
        return undefined;
      }
    }
    return value;
  }

  private evalCondition(condition: PolicyCondition, value: unknown): boolean {
    switch (condition.operator) {
      case 'eq': return value === condition.value;
      case 'ne': return value !== condition.value;
      case 'gt': return typeof value === 'number' && value > (condition.value as number);
      case 'lt': return typeof value === 'number' && value < (condition.value as number);
      case 'in': return Array.isArray(condition.value) && (condition.value as unknown[]).includes(value);
      case 'contains': return typeof value === 'string' && value.includes(condition.value as string);
      case 'matches': return typeof value === 'string' && new RegExp(condition.value as string).test(value);
      case 'exists': return value !== undefined && value !== null;
      default: return false;
    }
  }

  listPolicies(): Policy[] {
    return Array.from(this.policies.values());
  }

  getPolicy(id: string): Policy | undefined {
    return this.policies.get(id);
  }
}
