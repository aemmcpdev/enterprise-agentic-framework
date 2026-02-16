import type { Message } from '../types/agent.js';

export function serializeContext(messages: Message[]): string {
  return JSON.stringify(messages);
}

export function deserializeContext(data: string): Message[] {
  return JSON.parse(data) as Message[];
}

export function serializeToJsonl(entries: Record<string, unknown>[]): string {
  return entries.map((entry) => JSON.stringify(entry)).join('\n');
}

export function deserializeFromJsonl(data: string): Record<string, unknown>[] {
  return data
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line) as Record<string, unknown>);
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

export function safeStringify(obj: unknown, indent?: number): string {
  const seen = new WeakSet();
  return JSON.stringify(
    obj,
    (_key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    },
    indent
  );
}
