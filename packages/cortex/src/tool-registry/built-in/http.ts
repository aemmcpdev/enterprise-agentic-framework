import type { Tool, ToolResult } from '@eaf/core';

export const httpTool: Tool = {
  name: 'http_request',
  description: 'Makes an HTTP request to a specified URL and returns the response.',
  category: 'data',
  parameters: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'The URL to request' },
      method: { type: 'string', description: 'HTTP method (GET, POST, PUT, PATCH, DELETE)' },
      headers: { type: 'object', description: 'Request headers' },
      body: { type: 'string', description: 'Request body (for POST/PUT/PATCH)' },
      timeout: { type: 'number', description: 'Timeout in milliseconds' },
    },
    required: ['url'],
  },
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    const url = params.url as string;
    const method = (params.method as string) || 'GET';
    const headers = (params.headers as Record<string, string>) || {};
    const body = params.body as string | undefined;
    const timeout = (params.timeout as number) || 30000;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: method !== 'GET' ? body : undefined,
        signal: controller.signal,
      });

      clearTimeout(timer);

      const contentType = response.headers.get('content-type') || '';
      let data: unknown;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      return {
        success: response.ok,
        data: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: data,
        },
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
      };
    } catch (error) {
      clearTimeout(timer);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
