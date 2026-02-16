export interface Tool {
  name: string;
  description: string;
  parameters: ToolParameterSchema;
  execute: (params: Record<string, unknown>, context: ToolExecutionContext) => Promise<ToolResult>;
  category?: string;
  requiresAuth?: boolean;
  rateLimit?: ToolRateLimit;
}

export interface ToolParameterSchema {
  type: 'object';
  properties: Record<string, ToolParameterProperty>;
  required: string[];
}

export interface ToolParameterProperty {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  enum?: string[];
  items?: ToolParameterProperty;
  default?: unknown;
}

export interface ToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface ToolExecutionContext {
  agentId: string;
  sessionId: string;
  credentials?: Record<string, string>;
  metadata?: Record<string, unknown>;
  sandboxed?: boolean;
}

export interface ToolRateLimit {
  maxCalls: number;
  windowMs: number;
}

export interface ToolPolicy {
  toolName: string;
  action: 'allow' | 'deny' | 'require_approval' | 'rate_limit';
  conditions?: ToolPolicyCondition[];
}

export interface ToolPolicyCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'in' | 'contains' | 'matches';
  value: unknown;
}

export interface ToolCallAuditEntry {
  id: string;
  agentId: string;
  sessionId: string;
  toolName: string;
  input: Record<string, unknown>;
  output: ToolResult;
  policyEvaluation: ToolPolicyEvaluation;
  duration: number;
  timestamp: Date;
}

export interface ToolPolicyEvaluation {
  allowed: boolean;
  requiredApproval: boolean;
  approvedBy?: string;
  deniedReason?: string;
  matchedPolicies: string[];
}
