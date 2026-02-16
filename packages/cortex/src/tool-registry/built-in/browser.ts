import type { Tool, ToolResult } from '@eaf/core';

export const browserNavigateTool: Tool = {
  name: 'browser_navigate',
  description: 'Navigates to a URL and returns page content. Requires Playwright setup.',
  category: 'system',
  parameters: {
    type: 'object',
    properties: {
      url: { type: 'string', description: 'URL to navigate to' },
      waitForSelector: { type: 'string', description: 'CSS selector to wait for' },
      timeout: { type: 'number', description: 'Navigation timeout in ms' },
    },
    required: ['url'],
  },
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    return {
      success: false,
      error: 'Browser automation not configured. Install Playwright.',
      metadata: { stub: true, url: params.url },
    };
  },
};
