import type { RawDocument } from '../ingestor.js';
import { BaseConnector } from '../ingestor.js';

export class GitHubConnector extends BaseConnector {
  readonly type = 'github';
  private token?: string;
  private owner?: string;
  private repo?: string;

  async connect(config: Record<string, unknown>): Promise<void> {
    this.token = (config.token as string) || process.env.GITHUB_TOKEN;
    this.owner = config.owner as string;
    this.repo = config.repo as string;
  }

  async fetch(): Promise<RawDocument[]> {
    if (!this.token || !this.owner || !this.repo) return [];

    const docs: RawDocument[] = [];

    try {
      const response = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/issues?state=open&per_page=50`,
        { headers: { Authorization: `Bearer ${this.token}` } }
      );

      if (response.ok) {
        const issues = (await response.json()) as Array<{
          number: number;
          title: string;
          body: string;
          labels: Array<{ name: string }>;
        }>;

        for (const issue of issues) {
          docs.push({
            id: `gh-issue-${issue.number}`,
            title: issue.title,
            content: issue.body || '',
            type: 'incident',
            source: `github:${this.owner}/${this.repo}`,
            metadata: { number: issue.number, labels: issue.labels.map((l) => l.name) },
          });
        }
      }
    } catch {
      // Will be logged by ingestor
    }

    return docs;
  }

  async disconnect(): Promise<void> {}
}
