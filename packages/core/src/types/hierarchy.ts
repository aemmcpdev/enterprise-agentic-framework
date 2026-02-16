export interface StrategicGoal {
  id: string;
  name: string;
  description: string;
  targetMetrics: GoalMetric[];
  timeframe: { start: Date; end: Date };
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  objectives: Objective[];
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalMetric {
  name: string;
  baselineValue: number;
  targetValue: number;
  currentValue?: number;
  unit: string;
  source: string;
}

export interface Objective {
  id: string;
  goalId: string;
  name: string;
  description: string;
  supervisorAgentId?: string;
  tasks: TaskDefinition[];
  status: 'pending' | 'active' | 'completed' | 'failed';
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskDefinition {
  id: string;
  objectiveId: string;
  title: string;
  description: string;
  templateName: string;
  assignedAgentId?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'backlog' | 'queued' | 'in_progress' | 'waiting_approval' | 'completed' | 'failed';
  input: Record<string, unknown>;
  output?: Record<string, unknown>;
  dependencies: string[];
  createdAt: Date;
  completedAt?: Date;
}

export interface HierarchyConfig {
  strategic: StrategicAgentConfig[];
}

export interface StrategicAgentConfig {
  name: string;
  goal: string;
  metrics: HierarchyMetricConfig[];
  supervisors: SupervisorAgentConfig[];
}

export interface HierarchyMetricConfig {
  name: string;
  baselineSource: string;
}

export interface SupervisorAgentConfig {
  name: string;
  objective: string;
  agents: TaskAgentConfig[];
}

export interface TaskAgentConfig {
  template: string;
  instances: number;
  configOverrides?: Record<string, unknown>[];
  schedule?: { type: string; expression?: string };
  tools?: string[];
}

export interface AgentHierarchyNode {
  agentId: string;
  name: string;
  role: 'strategic' | 'supervisor' | 'task';
  parentId?: string;
  children: string[];
  status: string;
  metrics?: Record<string, number>;
}

export interface DelegationRule {
  fromRole: string;
  toRole: string;
  taskPattern: string;
  autoDelegate: boolean;
  maxConcurrent: number;
}
