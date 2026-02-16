export type EventType =
  | 'agent.created'
  | 'agent.started'
  | 'agent.completed'
  | 'agent.errored'
  | 'agent.paused'
  | 'agent.resumed'
  | 'agent.terminated'
  | 'model.called'
  | 'model.responded'
  | 'model.error'
  | 'tool.called'
  | 'tool.completed'
  | 'tool.error'
  | 'policy.evaluated'
  | 'policy.denied'
  | 'policy.approval_required'
  | 'human.approval_requested'
  | 'human.approved'
  | 'human.rejected'
  | 'human.guided'
  | 'human.intervened'
  | 'hierarchy.goal_set'
  | 'hierarchy.objective_created'
  | 'hierarchy.task_assigned'
  | 'hierarchy.task_completed'
  | 'knowledge.ingested'
  | 'knowledge.updated'
  | 'learning.pattern_captured'
  | 'learning.correction_recorded'
  | 'metric.recorded'
  | 'alert.triggered'
  | 'alert.acknowledged'
  | 'alert.resolved';

export type EventSeverity = 'debug' | 'info' | 'warning' | 'error' | 'critical';

export interface EAFEvent {
  id: string;
  type: EventType;
  severity: EventSeverity;
  agentId?: string;
  sessionId?: string;
  userId?: string;
  timestamp: Date;
  data: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface AuditEntry {
  id: string;
  timestamp: Date;
  agentId: string;
  sessionId: string;
  type: 'model_call' | 'tool_call' | 'policy_evaluation' | 'human_intervention' | 'error' | 'completion';
  input?: { messages: unknown[]; tools: unknown[] };
  decision?: { type: 'text' | 'tool_call'; content: unknown };
  outcome?: { success: boolean; result: unknown; duration: number };
  cost?: { inputTokens: number; outputTokens: number; dollarCost: number };
  humanAction?: { reviewer: string; action: 'approved' | 'rejected' | 'guided'; feedback: string };
  hash: string;
  previousHash: string;
}

export interface MetricEvent {
  id: string;
  agentId: string;
  metricName: string;
  value: number;
  unit: string;
  tags: Record<string, string>;
  timestamp: Date;
}

export interface EventFilter {
  types?: EventType[];
  severity?: EventSeverity[];
  agentIds?: string[];
  startTime?: Date;
  endTime?: Date;
  limit?: number;
  offset?: number;
}

export interface EventSubscription {
  id: string;
  filter: EventFilter;
  callback: (event: EAFEvent) => void | Promise<void>;
}
