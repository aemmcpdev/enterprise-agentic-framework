// === Hierarchy ===
export { StrategicAgent } from './hierarchy/strategic-agent.js';
export { SupervisorAgent } from './hierarchy/supervisor-agent.js';
export { TaskAgent } from './hierarchy/task-agent.js';
export { HierarchyManager } from './hierarchy/hierarchy-manager.js';
export { DelegationEngine } from './hierarchy/delegation.js';

// === Orchestration ===
export { VerticalOrchestrator } from './orchestration/vertical.js';
export { HorizontalOrchestrator } from './orchestration/horizontal.js';
export { WorkRouter } from './orchestration/router.js';
export { LoadBalancer } from './orchestration/load-balancer.js';
export { EscalationManager } from './orchestration/escalation.js';

// === Human-in-the-Loop ===
export { ApprovalGate } from './human-in-the-loop/approval-gate.js';
export { GuidanceChannel } from './human-in-the-loop/guidance-channel.js';
export { InterventionManager } from './human-in-the-loop/intervention.js';
export { FeedbackCapture } from './human-in-the-loop/feedback-capture.js';
export { NotificationManager } from './human-in-the-loop/notification.js';

// === Communication ===
export { AgentBus } from './communication/agent-bus.js';
export { FindingRegistry } from './communication/structured-finding.js';
export { KnowledgePropagation } from './communication/knowledge-propagation.js';
export { MessageProtocol } from './communication/protocol.js';

// === Channels ===
export { ChannelAdapter } from './channels/channel-adapter.js';
export { MessageNormalizer } from './channels/normalizer.js';
export { WebChannelAdapter } from './channels/adapters/web.js';
export { APIChannelAdapter } from './channels/adapters/api.js';
