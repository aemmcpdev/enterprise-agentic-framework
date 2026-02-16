import { logger } from '@eaf/core';
import type { NetworkDesign } from './designer.js';

export interface SimulationScenario {
  name: string;
  taskVolume: number;
  complexityDistribution: { simple: number; medium: number; complex: number };
  durationHours: number;
}

export interface SimulationResult {
  designId: string;
  scenario: SimulationScenario;
  metrics: {
    throughput: number;
    avgLatency: number;
    errorRate: number;
    utilizationRate: number;
    estimatedMonthlyCost: number;
    bottlenecks: string[];
  };
  recommendations: string[];
}

export class NetworkSimulator {
  simulate(design: NetworkDesign, scenario: SimulationScenario): SimulationResult {
    const tasksPerAgent = scenario.taskVolume / design.agentCount;
    const complexityFactor =
      scenario.complexityDistribution.simple * 1 +
      scenario.complexityDistribution.medium * 2.5 +
      scenario.complexityDistribution.complex * 5;

    const avgLatency = complexityFactor * (1 + Math.max(0, tasksPerAgent - 10) * 0.1);
    const utilizationRate = Math.min(0.95, tasksPerAgent / 20);
    const errorRate = utilizationRate > 0.85 ? (utilizationRate - 0.85) * 0.5 : 0.01;
    const throughput = design.agentCount * (1 / avgLatency) * scenario.durationHours * 3600;

    const bottlenecks: string[] = [];
    if (utilizationRate > 0.85) bottlenecks.push('agent_overload');
    if (tasksPerAgent > 15) bottlenecks.push('queue_depth');
    if (errorRate > 0.05) bottlenecks.push('error_cascade');

    const recommendations: string[] = [];
    if (utilizationRate > 0.8) {
      recommendations.push(`Consider adding ${Math.ceil(design.agentCount * 0.3)} more agents to reduce load`);
    }
    if (errorRate > 0.05) {
      recommendations.push('Implement circuit breakers to prevent error cascading');
    }
    if (scenario.complexityDistribution.complex > 0.3) {
      recommendations.push('Add specialized agents for complex tasks');
    }

    const monthlyCost = design.estimatedCost * 30 * utilizationRate;

    logger.info('Simulation completed', { designId: design.id, scenario: scenario.name });

    return {
      designId: design.id,
      scenario,
      metrics: {
        throughput: Math.round(throughput),
        avgLatency: Math.round(avgLatency * 100) / 100,
        errorRate: Math.round(errorRate * 1000) / 1000,
        utilizationRate: Math.round(utilizationRate * 100) / 100,
        estimatedMonthlyCost: Math.round(monthlyCost),
        bottlenecks,
      },
      recommendations,
    };
  }

  compareDesigns(designs: NetworkDesign[], scenario: SimulationScenario): SimulationResult[] {
    return designs.map((d) => this.simulate(d, scenario)).sort((a, b) => {
      const scoreA = a.metrics.throughput / a.metrics.estimatedMonthlyCost;
      const scoreB = b.metrics.throughput / b.metrics.estimatedMonthlyCost;
      return scoreB - scoreA;
    });
  }
}
