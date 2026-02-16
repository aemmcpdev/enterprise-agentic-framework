import { ModelResolver, ToolRegistry, MemoryManager, AgentFactory, TemplateRegistry } from '@eaf/cortex';
import { HierarchyManager } from '@eaf/nexus';
import { PolicyEngine, AuditLogger } from '@eaf/aegis';
import { AlertEngine, DashboardEngine, BaselineManager, MeasurementCollector } from '@eaf/command-ai';
import { WebSocketManager } from '@eaf/command-ai';

export interface AppContext {
  modelResolver: ModelResolver;
  toolRegistry: ToolRegistry;
  memoryManager: MemoryManager;
  agentFactory: AgentFactory;
  templateRegistry: TemplateRegistry;
  hierarchyManager: HierarchyManager;
  policyEngine: PolicyEngine;
  auditLogger: AuditLogger;
  alertEngine: AlertEngine;
  dashboardEngine: DashboardEngine;
  wsManager: WebSocketManager;
}

export function createAppContext(): AppContext {
  const templateRegistry = new TemplateRegistry();
  const baselineManager = new BaselineManager();
  const measurementCollector = new MeasurementCollector();

  return {
    modelResolver: new ModelResolver(),
    toolRegistry: new ToolRegistry(),
    memoryManager: new MemoryManager(),
    agentFactory: new AgentFactory(templateRegistry),
    templateRegistry,
    hierarchyManager: new HierarchyManager(),
    policyEngine: new PolicyEngine(),
    auditLogger: new AuditLogger(),
    alertEngine: new AlertEngine(),
    dashboardEngine: new DashboardEngine(baselineManager, measurementCollector),
    wsManager: new WebSocketManager(),
  };
}
