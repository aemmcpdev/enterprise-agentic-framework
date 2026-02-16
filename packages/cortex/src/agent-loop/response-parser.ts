import type { ToolCallRequest } from '@eaf/core';
import type { ModelResponse } from '../model-resolver/providers/base.js';

export interface ParsedTextResponse {
  type: 'text';
  text: string;
  toolCalls: never[];
}

export interface ParsedToolCallResponse {
  type: 'tool_calls';
  text: string;
  toolCalls: ToolCallRequest[];
}

export type ParsedResponse = ParsedTextResponse | ParsedToolCallResponse;

export class ResponseParser {
  parse(response: ModelResponse): ParsedResponse {
    // If there are tool calls, it's a tool call response
    if (response.toolCalls && response.toolCalls.length > 0) {
      return {
        type: 'tool_calls',
        text: response.content || '',
        toolCalls: response.toolCalls.map((tc) => ({
          id: tc.id,
          name: tc.name,
          input: tc.input,
        })),
      };
    }

    // Otherwise, it's a text response
    return {
      type: 'text',
      text: response.content,
      toolCalls: [] as never[],
    };
  }
}
