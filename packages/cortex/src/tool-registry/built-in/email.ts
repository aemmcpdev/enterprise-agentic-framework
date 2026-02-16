import type { Tool, ToolResult } from '@eaf/core';

export const sendEmailTool: Tool = {
  name: 'send_email',
  description: 'Sends an email message. Requires SMTP configuration.',
  category: 'communication',
  parameters: {
    type: 'object',
    properties: {
      to: { type: 'string', description: 'Recipient email address(es)' },
      subject: { type: 'string', description: 'Email subject' },
      body: { type: 'string', description: 'Email body' },
      cc: { type: 'string', description: 'CC recipients' },
      isHtml: { type: 'boolean', description: 'Whether body is HTML' },
    },
    required: ['to', 'subject', 'body'],
  },
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    return {
      success: false,
      error: 'Email service not configured. Set SMTP settings in environment.',
      metadata: { stub: true, to: params.to, subject: params.subject },
    };
  },
};

export const readEmailTool: Tool = {
  name: 'read_email',
  description: 'Reads emails from a configured mailbox.',
  category: 'communication',
  parameters: {
    type: 'object',
    properties: {
      folder: { type: 'string', description: 'Email folder (default: INBOX)' },
      from: { type: 'string', description: 'Filter by sender' },
      subject: { type: 'string', description: 'Filter by subject' },
      limit: { type: 'number', description: 'Max emails to return' },
      unreadOnly: { type: 'boolean', description: 'Only unread emails' },
    },
    required: [],
  },
  execute: async (): Promise<ToolResult> => {
    return {
      success: false,
      error: 'Email service not configured. Set IMAP settings in environment.',
      metadata: { stub: true },
    };
  },
};
