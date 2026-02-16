// Outcome Engine
export { BaselineManager } from './outcome-engine/baseline.js';
export { MeasurementCollector } from './outcome-engine/measurement.js';
export { DeltaCalculator } from './outcome-engine/delta.js';
export { AttributionEngine } from './outcome-engine/attribution.js';
export { ROICalculator } from './outcome-engine/roi-calculator.js';
export { NarrativeGenerator } from './outcome-engine/narrative.js';
export { TrendAnalyzer } from './outcome-engine/trend.js';

// Dashboards
export { DashboardEngine } from './dashboards/dashboard-engine.js';
export { buildCEOView } from './dashboards/views/ceo.js';
export { buildVPView } from './dashboards/views/vp.js';
export { buildDirectorView } from './dashboards/views/director.js';
export { buildTeamLeadView } from './dashboards/views/team-lead.js';
export { buildAgentDetailView } from './dashboards/views/agent-detail.js';

// Network Designer
export { NetworkDesigner } from './network-designer/designer.js';
export { NetworkSimulator } from './network-designer/simulator.js';
export { RecommendationEngine } from './network-designer/recommendation.js';

// Alerts
export { AlertEngine } from './alerts/alert-engine.js';
export { createErrorRateRule, createCostBudgetRule, createLatencyRule, createAgentDownRule, createQueueDepthRule } from './alerts/alert-rules.js';
export { EmailAlertChannel } from './alerts/channels/email.js';
export { SlackAlertChannel } from './alerts/channels/slack.js';
export { WebhookAlertChannel } from './alerts/channels/webhook.js';
export { AlertEscalationManager } from './alerts/escalation.js';

// API
export { buildRoutes } from './api/rest.js';
export { WebSocketManager } from './api/websocket.js';

// Types
export type { Baseline } from './outcome-engine/baseline.js';
export type { Measurement } from './outcome-engine/measurement.js';
export type { DeltaResult } from './outcome-engine/delta.js';
export type { Attribution } from './outcome-engine/attribution.js';
export type { ROIResult } from './outcome-engine/roi-calculator.js';
export type { TrendResult } from './outcome-engine/trend.js';
export type { NetworkDesign } from './network-designer/designer.js';
export type { SimulationResult, SimulationScenario } from './network-designer/simulator.js';
export type { NetworkRecommendation, WorkloadProfile } from './network-designer/recommendation.js';
export type { Alert, AlertSeverity, AlertStatus, AlertChannel } from './alerts/alert-engine.js';
export type { AlertRule } from './alerts/alert-rules.js';
export type { CommandAPIConfig, RouteDefinition } from './api/rest.js';
export type { WSMessage, WSEventType, WSClient } from './api/websocket.js';
export type { CEODashboard } from './dashboards/views/ceo.js';
export type { VPDashboard } from './dashboards/views/vp.js';
export type { DirectorDashboard } from './dashboards/views/director.js';
export type { TeamLeadDashboard } from './dashboards/views/team-lead.js';
export type { AgentDetailDashboard } from './dashboards/views/agent-detail.js';
