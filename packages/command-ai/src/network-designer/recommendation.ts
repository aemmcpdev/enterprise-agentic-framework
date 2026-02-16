import { logger } from '@eaf/core';

export interface WorkloadProfile {
  avgDailyTasks: number;
  peakMultiplier: number;
  complexityMix: { simple: number; medium: number; complex: number };
  requiredUptime: number;
  budgetPerMonth: number;
}

export interface NetworkRecommendation {
  agentCount: number;
  agentTypes: { role: string; count: number; model: string }[];
  estimatedMonthlyCost: number;
  expectedThroughput: number;
  rationale: string[];
}

export class RecommendationEngine {
  recommend(profile: WorkloadProfile): NetworkRecommendation {
    const peakTasks = profile.avgDailyTasks * profile.peakMultiplier;
    const complexWeight =
      profile.complexityMix.simple * 1 +
      profile.complexityMix.medium * 3 +
      profile.complexityMix.complex * 8;

    const baseAgents = Math.ceil(peakTasks / 50);
    const complexAgents = Math.ceil(peakTasks * profile.complexityMix.complex / 20);
    const supervisorCount = Math.max(1, Math.ceil((baseAgents + complexAgents) / 5));
    const totalAgents = baseAgents + complexAgents + supervisorCount + 1;

    const agentTypes: NetworkRecommendation['agentTypes'] = [
      { role: 'strategic', count: 1, model: 'claude-sonnet-4-5-20250929' },
      { role: 'supervisor', count: supervisorCount, model: 'claude-sonnet-4-5-20250929' },
      { role: 'task-general', count: baseAgents, model: 'claude-haiku-4-5-20251001' },
    ];

    if (complexAgents > 0) {
      agentTypes.push({ role: 'task-complex', count: complexAgents, model: 'claude-sonnet-4-5-20250929' });
    }

    const costPerTask = complexWeight * 0.01;
    const estimatedMonthlyCost = profile.avgDailyTasks * 30 * costPerTask + totalAgents * 10;

    const rationale: string[] = [];
    rationale.push(`${baseAgents} general task agents for ${Math.round(peakTasks * (1 - profile.complexityMix.complex))} simple/medium tasks/day`);
    if (complexAgents > 0) {
      rationale.push(`${complexAgents} specialized agents for ${Math.round(peakTasks * profile.complexityMix.complex)} complex tasks/day`);
    }
    rationale.push(`${supervisorCount} supervisors for coordination (1:5 ratio)`);

    if (estimatedMonthlyCost > profile.budgetPerMonth) {
      rationale.push(`Warning: estimated cost $${estimatedMonthlyCost}/mo exceeds budget $${profile.budgetPerMonth}/mo`);
      rationale.push('Consider reducing agent count or using cheaper models for simple tasks');
    }

    logger.info('Network recommendation generated', { totalAgents, estimatedMonthlyCost });

    return {
      agentCount: totalAgents,
      agentTypes,
      estimatedMonthlyCost: Math.round(estimatedMonthlyCost),
      expectedThroughput: Math.round(peakTasks * 0.95),
      rationale,
    };
  }
}
