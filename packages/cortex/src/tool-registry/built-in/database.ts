import type { Tool, ToolResult } from '@eaf/core';

export const databaseQueryTool: Tool = {
  name: 'database_query',
  description: 'Executes a SQL query against a configured database. Only SELECT queries are allowed by default.',
  category: 'data',
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'SQL query to execute' },
      database: { type: 'string', description: 'Database name or connection identifier' },
      params: { type: 'array', description: 'Query parameters for prepared statements' },
    },
    required: ['query'],
  },
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    const query = (params.query as string).trim();
    const database = (params.database as string) || 'default';

    // Safety check: block destructive queries
    const dangerousPatterns = [
      /\bDROP\b/i,
      /\bTRUNCATE\b/i,
      /\bDELETE\b/i,
      /\bALTER\b/i,
      /\bGRANT\b/i,
      /\bREVOKE\b/i,
    ];

    for (const pattern of dangerousPatterns) {
      if (pattern.test(query)) {
        return {
          success: false,
          error: 'Query blocked: potentially destructive SQL detected. Use explicit approval.',
        };
      }
    }

    // Stub: implement with actual database driver
    return {
      success: false,
      error: `Database not configured. Database: ${database}. Query: ${query.substring(0, 100)}`,
      metadata: { stub: true },
    };
  },
};
