import type { Tool, ToolResult } from '@eaf/core';

export const slackSendTool: Tool = {
  name: 'slack_send',
  description: 'Sends a message to a Slack channel. Requires Slack bot token.',
  category: 'communication',
  parameters: {
    type: 'object',
    properties: {
      channel: { type: 'string', description: 'Slack channel ID or name' },
      message: { type: 'string', description: 'Message text' },
      threadTs: { type: 'string', description: 'Thread timestamp for replies' },
    },
    required: ['channel', 'message'],
  },
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    const token = process.env.SLACK_BOT_TOKEN;
    if (!token) {
      return {
        success: false,
        error: 'Slack not configured. Set SLACK_BOT_TOKEN.',
        metadata: { stub: true },
      };
    }

    try {
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          channel: params.channel,
          text: params.message,
          thread_ts: params.threadTs,
        }),
      });

      const data = (await response.json()) as { ok: boolean; error?: string; ts?: string };

      if (!data.ok) {
        return { success: false, error: `Slack API error: ${data.error}` };
      }

      return { success: true, data: { messageTs: data.ts, channel: params.channel } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  },
};
