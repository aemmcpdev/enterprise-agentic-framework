export interface ConversationMessage {
  id: string;
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCallId?: string;
  toolCalls?: ConversationToolCall[];
  timestamp: Date;
  tokenCount?: number;
}

export interface ConversationToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  agentId: string;
  sessionId: string;
  messages: ConversationMessage[];
  metadata: ConversationMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationMetadata {
  totalTokens: number;
  totalMessages: number;
  totalToolCalls: number;
  compacted: boolean;
  summary?: string;
}

export interface ContextWindow {
  messages: ConversationMessage[];
  totalTokens: number;
  maxTokens: number;
  utilizationPercent: number;
}

export interface ContextCompactionResult {
  originalTokens: number;
  compactedTokens: number;
  savedTokens: number;
  summary: string;
  removedMessageCount: number;
}
