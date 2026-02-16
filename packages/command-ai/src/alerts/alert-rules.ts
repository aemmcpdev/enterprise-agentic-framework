import type { AlertSeverity } from './alert-engine.js';

export interface AlertRule {
  id: string;
  name: string;
  metric: string;
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq';
  threshold: number;
  severity: AlertSeverity;
  enabled: boolean;
  cooldownMinutes: number;
}

export function createErrorRateRule(threshold = 0.1): AlertRule {
  return {
    id: 'rule_error_rate',
    name: 'High Error Rate',
    metric: 'error_rate',
    operator: 'gt',
    threshold,
    severity: 'critical',
    enabled: true,
    cooldownMinutes: 15,
  };
}

export function createCostBudgetRule(budgetLimit: number): AlertRule {
  return {
    id: 'rule_cost_budget',
    name: 'Cost Budget Exceeded',
    metric: 'total_cost',
    operator: 'gt',
    threshold: budgetLimit,
    severity: 'warning',
    enabled: true,
    cooldownMinutes: 60,
  };
}

export function createLatencyRule(maxLatencyMs = 5000): AlertRule {
  return {
    id: 'rule_latency',
    name: 'High Latency',
    metric: 'avg_latency_ms',
    operator: 'gt',
    threshold: maxLatencyMs,
    severity: 'warning',
    enabled: true,
    cooldownMinutes: 10,
  };
}

export function createAgentDownRule(): AlertRule {
  return {
    id: 'rule_agent_down',
    name: 'Agent Down',
    metric: 'unhealthy_agents',
    operator: 'gt',
    threshold: 0,
    severity: 'critical',
    enabled: true,
    cooldownMinutes: 5,
  };
}

export function createQueueDepthRule(maxDepth = 100): AlertRule {
  return {
    id: 'rule_queue_depth',
    name: 'Queue Depth High',
    metric: 'queue_depth',
    operator: 'gt',
    threshold: maxDepth,
    severity: 'warning',
    enabled: true,
    cooldownMinutes: 10,
  };
}
