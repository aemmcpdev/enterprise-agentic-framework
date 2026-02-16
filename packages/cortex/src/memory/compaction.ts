import { logger, estimateTokens } from '@eaf/core';
import type { MemoryEntry } from '@eaf/core';

/**
 * Compacts memory entries into summaries to save context window tokens.
 * Uses a simple extractive summarization approach.
 * In production, use the LLM itself to generate summaries.
 */
export class ContextCompactor {
  async compact(entries: MemoryEntry[]): Promise<string> {
    if (entries.length === 0) return '';

    logger.info('Compacting memory entries', { count: entries.length });

    // Group by type
    const grouped = new Map<string, MemoryEntry[]>();
    for (const entry of entries) {
      const key = entry.type;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(entry);
    }

    const sections: string[] = [];

    for (const [type, typeEntries] of grouped) {
      // Sort by importance (desc) then recency (desc)
      typeEntries.sort((a, b) => {
        const importanceDiff = b.importance - a.importance;
        if (importanceDiff !== 0) return importanceDiff;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });

      // Keep top entries as-is, summarize the rest
      const topN = Math.min(5, typeEntries.length);
      const topEntries = typeEntries.slice(0, topN);
      const remainingEntries = typeEntries.slice(topN);

      let section = `## ${type} Memory\n\n`;

      // Top entries preserved
      for (const entry of topEntries) {
        section += `- [${entry.importance.toFixed(1)}] ${entry.content.substring(0, 200)}\n`;
      }

      // Remaining entries summarized
      if (remainingEntries.length > 0) {
        section += `\n(${remainingEntries.length} additional entries summarized)\n`;

        // Extract key terms from remaining
        const allText = remainingEntries.map((e) => e.content).join(' ');
        const keyTerms = this.extractKeyTerms(allText, 10);
        section += `Key topics: ${keyTerms.join(', ')}\n`;
      }

      sections.push(section);
    }

    const summary = `# Memory Summary\n\nCompacted ${entries.length} entries at ${new Date().toISOString()}\n\n${sections.join('\n')}`;

    logger.info('Memory compaction complete', {
      originalEntries: entries.length,
      summaryTokens: estimateTokens(summary),
    });

    return summary;
  }

  async compactMessages(
    messages: { role: string; content: string }[],
    maxTokens: number
  ): Promise<{ messages: { role: string; content: string }[]; summary: string }> {
    if (messages.length <= 4) {
      return { messages, summary: '' };
    }

    // Keep first message (system) and last few messages
    const keepFirst = messages.slice(0, 1);
    const keepLast = messages.slice(-4);
    const toCompact = messages.slice(1, -4);

    if (toCompact.length === 0) {
      return { messages, summary: '' };
    }

    // Create a summary of compacted messages
    const summaryParts: string[] = [];
    for (const msg of toCompact) {
      const truncated = msg.content.substring(0, 100);
      summaryParts.push(`[${msg.role}]: ${truncated}...`);
    }

    const summary = `[Previous conversation summary (${toCompact.length} messages):\n${summaryParts.join('\n')}\n]`;

    const compactedMessages = [
      ...keepFirst,
      { role: 'system' as const, content: summary },
      ...keepLast,
    ];

    return { messages: compactedMessages, summary };
  }

  private extractKeyTerms(text: string, count: number): string[] {
    const words = text.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
    const frequency = new Map<string, number>();

    // Common stopwords
    const stopwords = new Set([
      'this', 'that', 'with', 'from', 'have', 'been', 'were', 'they',
      'their', 'will', 'would', 'could', 'should', 'about', 'which',
      'when', 'what', 'where', 'there', 'then', 'than', 'some', 'more',
      'also', 'just', 'only', 'very', 'into', 'over', 'such', 'after',
    ]);

    for (const word of words) {
      if (stopwords.has(word)) continue;
      frequency.set(word, (frequency.get(word) || 0) + 1);
    }

    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([word]) => word);
  }
}
