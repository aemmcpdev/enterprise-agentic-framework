export type PolicyType = 'allow' | 'deny' | 'require_approval' | 'rate_limit' | 'budget';
export type PolicyEnforcement = 'block' | 'warn' | 'log';
export type PolicyStatus = 'active' | 'inactive' | 'archived';

export interface Policy {
  id: string;
  name: string;
  description: string;
  type: PolicyType;
  scope: PolicyScope;
  conditions: PolicyCondition[];
  enforcement: PolicyEnforcement;
  priority: number;
  status: PolicyStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PolicyScope {
  agentIds?: string[];
  roles?: string[];
  tags?: string[];
  all?: boolean;
  hierarchy?: string;
}

export interface PolicyCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not_in' | 'contains' | 'matches' | 'exists';
  value: unknown;
}

export interface PolicyAction {
  type: PolicyType;
  reason: string;
  matchedPolicy: Policy;
  requiresApproval: boolean;
  approvalRoles?: string[];
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  denied: boolean;
  requiresApproval: boolean;
  reason?: string;
  matchedPolicies: Policy[];
  actions: PolicyAction[];
}

export interface PolicyRule {
  id: string;
  policyId: string;
  action: string;
  resource?: string;
  conditions: PolicyCondition[];
  effect: 'allow' | 'deny';
}

export interface BudgetPolicy extends Policy {
  type: 'budget';
  budgetConfig: {
    metric: 'api_cost' | 'token_count' | 'tool_calls';
    threshold: number;
    period: 'hourly' | 'daily' | 'weekly' | 'monthly';
    currentUsage?: number;
  };
}

export interface RateLimitPolicy extends Policy {
  type: 'rate_limit';
  rateLimitConfig: {
    action: string;
    limit: number;
    period: 'minute' | 'hourly' | 'daily';
    currentCount?: number;
  };
}
