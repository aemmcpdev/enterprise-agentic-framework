/**
 * Simple token estimator. Uses the ~4 chars per token heuristic.
 * For production, integrate tiktoken or the model provider's tokenizer.
 */

const CHARS_PER_TOKEN = 4;

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

export function estimateMessagesTokens(
  messages: { role: string; content: string }[]
): number {
  let total = 0;
  for (const msg of messages) {
    // Each message has overhead (~4 tokens for role/formatting)
    total += 4;
    total += estimateTokens(msg.content);
  }
  // Every reply is primed with <|start|>assistant<|message|> (~3 tokens)
  total += 3;
  return total;
}

export function truncateToTokenLimit(text: string, maxTokens: number): string {
  const maxChars = maxTokens * CHARS_PER_TOKEN;
  if (text.length <= maxChars) {
    return text;
  }
  return text.substring(0, maxChars) + '... [truncated]';
}

export function fitsInContextWindow(
  messages: { role: string; content: string }[],
  maxTokens: number,
  reserveTokens = 1000
): boolean {
  const estimated = estimateMessagesTokens(messages);
  return estimated <= maxTokens - reserveTokens;
}
