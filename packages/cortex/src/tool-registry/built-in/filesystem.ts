import * as fs from 'fs/promises';
import * as path from 'path';
import type { Tool, ToolResult } from '@eaf/core';

export const readFileTool: Tool = {
  name: 'read_file',
  description: 'Reads the contents of a file from the filesystem.',
  category: 'data',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'File path to read' },
      encoding: { type: 'string', description: 'File encoding (default: utf-8)' },
    },
    required: ['path'],
  },
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    const filePath = params.path as string;
    const encoding = (params.encoding as BufferEncoding) || 'utf-8';

    try {
      const resolved = path.resolve(filePath);
      const content = await fs.readFile(resolved, encoding);
      const stats = await fs.stat(resolved);

      return {
        success: true,
        data: { content, path: resolved, size: stats.size, modified: stats.mtime.toISOString() },
      };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  },
};

export const writeFileTool: Tool = {
  name: 'write_file',
  description: 'Writes content to a file. Creates directories if needed.',
  category: 'data',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'File path to write' },
      content: { type: 'string', description: 'Content to write' },
      append: { type: 'boolean', description: 'Append instead of overwrite' },
    },
    required: ['path', 'content'],
  },
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    const filePath = params.path as string;
    const content = params.content as string;
    const append = params.append as boolean;

    try {
      const resolved = path.resolve(filePath);
      await fs.mkdir(path.dirname(resolved), { recursive: true });

      if (append) {
        await fs.appendFile(resolved, content, 'utf-8');
      } else {
        await fs.writeFile(resolved, content, 'utf-8');
      }

      return { success: true, data: { path: resolved, bytesWritten: Buffer.byteLength(content) } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  },
};

export const listDirectoryTool: Tool = {
  name: 'list_directory',
  description: 'Lists files and directories in a given path.',
  category: 'data',
  parameters: {
    type: 'object',
    properties: {
      path: { type: 'string', description: 'Directory path to list' },
      recursive: { type: 'boolean', description: 'List recursively' },
    },
    required: ['path'],
  },
  execute: async (params: Record<string, unknown>): Promise<ToolResult> => {
    const dirPath = params.path as string;

    try {
      const resolved = path.resolve(dirPath);
      const entries = await fs.readdir(resolved, { withFileTypes: true });

      const items = entries.map((entry) => ({
        name: entry.name,
        type: entry.isDirectory() ? 'directory' : 'file',
        path: path.join(resolved, entry.name),
      }));

      return { success: true, data: { path: resolved, items, count: items.length } };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
  },
};
