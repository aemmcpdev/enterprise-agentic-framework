import { logger } from '@eaf/core';

export interface StructuredFinding {
  id: string;
  agentId: string;
  type: 'insight' | 'anomaly' | 'recommendation' | 'error' | 'status';
  title: string;
  detail: string;
  confidence: number;
  evidence: string[];
  tags: string[];
  timestamp: Date;
}

export class FindingRegistry {
  private findings: StructuredFinding[] = [];

  record(agentId: string, type: StructuredFinding['type'], title: string, detail: string, confidence = 0.8, evidence: string[] = [], tags: string[] = []): StructuredFinding {
    const finding: StructuredFinding = {
      id: `find_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      agentId,
      type,
      title,
      detail,
      confidence,
      evidence,
      tags,
      timestamp: new Date(),
    };

    this.findings.push(finding);
    logger.info('Finding recorded', { agentId, type, title });
    return finding;
  }

  getByAgent(agentId: string): StructuredFinding[] {
    return this.findings.filter((f) => f.agentId === agentId);
  }

  getByType(type: StructuredFinding['type']): StructuredFinding[] {
    return this.findings.filter((f) => f.type === type);
  }

  getRecent(limit = 50): StructuredFinding[] {
    return this.findings.slice(-limit);
  }

  search(query: string): StructuredFinding[] {
    const q = query.toLowerCase();
    return this.findings.filter(
      (f) => f.title.toLowerCase().includes(q) || f.detail.toLowerCase().includes(q) || f.tags.some((t) => t.toLowerCase().includes(q))
    );
  }
}
