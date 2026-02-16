import yaml from 'js-yaml';
import type { AgentTemplate } from '@eaf/core';

export class TemplateParser {
  parse(content: string): AgentTemplate {
    let data: unknown;

    // Try YAML first, then JSON
    try {
      data = yaml.load(content);
    } catch {
      try {
        data = JSON.parse(content);
      } catch {
        throw new Error('Failed to parse template: not valid YAML or JSON');
      }
    }

    return this.validate(data);
  }

  private validate(data: unknown): AgentTemplate {
    if (!data || typeof data !== 'object') {
      throw new Error('Template must be an object');
    }

    const obj = data as Record<string, unknown>;

    // Validate required fields
    if (!obj.apiVersion || typeof obj.apiVersion !== 'string') {
      throw new Error('Template must have apiVersion');
    }
    if (obj.kind !== 'AgentTemplate') {
      throw new Error('Template kind must be "AgentTemplate"');
    }

    const metadata = obj.metadata as Record<string, unknown>;
    if (!metadata || !metadata.name) {
      throw new Error('Template must have metadata.name');
    }

    const spec = obj.spec as Record<string, unknown>;
    if (!spec || !spec.role) {
      throw new Error('Template must have spec.role');
    }

    // Build the template
    const template: AgentTemplate = {
      apiVersion: obj.apiVersion as string,
      kind: 'AgentTemplate',
      metadata: {
        name: metadata.name as string,
        version: (metadata.version as string) || '1.0.0',
        description: (metadata.description as string) || '',
        author: (metadata.author as string) || '',
        tags: (metadata.tags as string[]) || [],
      },
      spec: {
        role: spec.role as string,
        tools: this.parseTools(spec.tools),
        policies: this.parsePolicies(spec.policies),
        escalation: spec.escalation
          ? this.parseEscalation(spec.escalation)
          : undefined,
        metrics: spec.metrics
          ? this.parseMetrics(spec.metrics)
          : undefined,
        configOverrides: (spec.config_overrides || spec.configOverrides) as string[] | undefined,
        schedule: spec.schedule
          ? this.parseSchedule(spec.schedule)
          : undefined,
      },
    };

    return template;
  }

  private parseTools(tools: unknown): AgentTemplate['spec']['tools'] {
    if (!Array.isArray(tools)) return [];
    return tools.map((t: Record<string, unknown>) => ({
      name: (t.name as string) || '',
      description: (t.description as string) || '',
      required: (t.required as boolean) ?? true,
    }));
  }

  private parsePolicies(policies: unknown): AgentTemplate['spec']['policies'] {
    if (!policies || typeof policies !== 'object') {
      return { autonomous: [], requiresApproval: [], denied: [] };
    }
    const p = policies as Record<string, unknown>;
    return {
      autonomous: (p.autonomous as string[]) || [],
      requiresApproval: ((p.requires_approval || p.requiresApproval) as string[]) || [],
      denied: (p.denied as string[]) || [],
    };
  }

  private parseEscalation(escalation: unknown): NonNullable<AgentTemplate['spec']['escalation']> {
    const e = escalation as Record<string, unknown>;
    return {
      conditions: ((e.conditions as unknown[]) || []).map((c: unknown) => {
        const cond = c as Record<string, string>;
        return {
          severity: cond.severity,
          confidence: cond.confidence,
          customerTier: cond.customer_tier || cond.customerTier,
        };
      }),
      path: ((e.path as unknown[]) || []).map((p: unknown) => ({
        role: (p as Record<string, string>).role,
      })),
    };
  }

  private parseMetrics(metrics: unknown): NonNullable<AgentTemplate['spec']['metrics']> {
    if (!Array.isArray(metrics)) return [];
    return metrics.map((m: Record<string, string>) => ({
      name: m.name || '',
      type: (m.type as 'duration' | 'accuracy' | 'percentage' | 'count' | 'currency') || 'count',
      description: m.description || '',
    }));
  }

  private parseSchedule(schedule: unknown): NonNullable<AgentTemplate['spec']['schedule']> {
    const s = schedule as Record<string, string>;
    return {
      type: (s.type as 'continuous' | 'cron' | 'on-demand') || 'on-demand',
      expression: s.expression,
      heartbeat: s.heartbeat,
    };
  }
}
