export type AgentId = string;
export type SessionId = string;
export type AgentStatus = 'idle' | 'running' | 'waiting_approval' | 'paused' | 'completed' | 'errored' | 'terminated';
export type AgentRole = 'strategic' | 'supervisor' | 'task';
export type Priority = 'low' | 'medium' | 'high' | 'critical';

export interface AgentConfig {
  agentId: AgentId;
  name: string;
  role: AgentRole;
  model: ModelConfig;
  tools: string[];
  systemPrompt: string;
  policies: string[];
  memory: MemoryConfig;
  maxIterations: number;
  maxTokens: number;
  timeout: number;
  tags: string[];
  configOverrides: Record<string, unknown>;
}

export interface ModelConfig {
  provider: string;
  model: string;
  temperature?: number;
  maxOutputTokens?: number;
  apiKeyId?: string;
}

export interface MemoryConfig {
  shortTermMaxEntries: number;
  longTermEnabled: boolean;
  vectorSearchEnabled: boolean;
  compactionThreshold: number;
}

export interface AgentTemplate {
  apiVersion: string;
  kind: 'AgentTemplate';
  metadata: AgentTemplateMetadata;
  spec: AgentTemplateSpec;
}

export interface AgentTemplateMetadata {
  name: string;
  version: string;
  description: string;
  author: string;
  tags: string[];
}

export interface AgentTemplateSpec {
  role: string;
  tools: ToolSpec[];
  policies: PolicySpec;
  escalation?: EscalationSpec;
  metrics?: MetricSpec[];
  configOverrides?: string[];
  schedule?: ScheduleSpec;
}

export interface ToolSpec {
  name: string;
  description: string;
  required: boolean;
}

export interface PolicySpec {
  autonomous: string[];
  requiresApproval: string[];
  denied: string[];
}

export interface EscalationSpec {
  conditions: EscalationCondition[];
  path: EscalationTarget[];
}

export interface EscalationCondition {
  severity?: string;
  confidence?: string;
  customerTier?: string;
}

export interface EscalationTarget {
  role: string;
}

export interface MetricSpec {
  name: string;
  type: 'duration' | 'accuracy' | 'percentage' | 'count' | 'currency';
  description: string;
}

export interface ScheduleSpec {
  type: 'continuous' | 'cron' | 'on-demand';
  expression?: string;
  heartbeat?: string;
}

export interface AgentResult {
  agentId: AgentId;
  sessionId: SessionId;
  response: string;
  toolCalls: ToolCallRecord[];
  iterations: number;
  totalTokens: number;
  cost: number;
  duration: number;
  status: 'completed' | 'max_iterations' | 'timeout' | 'error';
  error?: string;
}

export interface ToolCallRecord {
  id: string;
  toolName: string;
  input: Record<string, unknown>;
  output: unknown;
  duration: number;
  policyResult?: string;
  timestamp: Date;
}

export interface LoopState {
  iteration: number;
  totalTokensUsed: number;
  toolCallsExecuted: ToolCallRecord[];
  currentContext: Message[];
  startTime: number;
  status: AgentStatus;
}

export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCallId?: string;
  toolCalls?: ToolCallRequest[];
  name?: string;
}

export interface ToolCallRequest {
  id: string;
  name: string;
  input: Record<string, unknown>;
}
