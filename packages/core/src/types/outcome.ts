export interface Baseline {
  id: string;
  agentId: string;
  metricName: string;
  value: number;
  unit: string;
  source: string;
  capturedAt: Date;
  methodology: string;
  confidence: number;
}

export interface MetricMeasurement {
  id: string;
  agentId: string;
  metricName: string;
  value: number;
  unit: string;
  tags: Record<string, string>;
  timestamp: Date;
}

export interface Delta {
  metric: string;
  before: number;
  after: number;
  change: number;
  changePercent: number;
  confidence: number;
  attribution: Attribution[];
  narrative: string;
}

export interface Attribution {
  agentId: string;
  agentName: string;
  contribution: number;
  description: string;
}

export interface Outcome {
  id: string;
  agentId: string;
  period: { start: Date; end: Date };
  baselines: Baseline[];
  measurements: MetricMeasurement[];
  deltas: Delta[];
  impact: Impact;
  roi: ROI;
  narrative: string;
}

export interface Impact {
  efficiency: {
    timeSaved: number;
    tasksCompleted: number;
    throughputChange: number;
  };
  quality: {
    errorRateChange: number;
    csatChange: number;
    reworkRateChange: number;
  };
  cost: {
    agentCost: number;
    valueCreated: number;
    roi: number;
  };
  learning: {
    improvementTrend: number[];
    humanInterventionFrequency: number[];
  };
}

export interface ROI {
  totalCost: number;
  totalValue: number;
  netValue: number;
  roiPercent: number;
  paybackPeriodDays: number;
  projectedAnnualValue: number;
}

export interface DashboardData {
  level: 'ceo' | 'vp' | 'director' | 'team_lead' | 'agent_detail';
  entityId?: string;
  period: { start: Date; end: Date };
  metrics: DashboardMetric[];
  trends: TrendData[];
  alerts: DashboardAlert[];
}

export interface DashboardMetric {
  name: string;
  value: number;
  previousValue?: number;
  change?: number;
  changePercent?: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
}

export interface TrendData {
  metricName: string;
  dataPoints: { timestamp: Date; value: number }[];
  trend: 'improving' | 'stable' | 'declining';
}

export interface DashboardAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  agentId?: string;
  timestamp: Date;
  acknowledged: boolean;
}
