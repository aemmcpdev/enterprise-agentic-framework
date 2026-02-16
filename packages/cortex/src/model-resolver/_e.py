import base64
t = """import type { Message, ToolCallRequest } from '@eaf/core';

export interface ModelCallOptions {
  model: string;
  messages: Message[];
  tools?: ModelToolDefinition[];
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  systemPrompt?: string;
}"""
print(base64.b64encode(t.encode('utf-8')).decode('ascii'))
