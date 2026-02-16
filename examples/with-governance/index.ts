/**
 * Governance Example
 *
 * This example shows how to set up policy-based governance
 * with audit logging and RBAC.
 */

import { EAFBuilder } from '@eaf/sdk';
import { PolicyEngine, AuditLogger, RBACManager } from '@eaf/aegis';

async function main() {
  const client = new EAFBuilder()
    .setAppName('governance-example')
    .enableAudit()
    .addPolicy({
      id: 'pol_budget',
      name: 'Budget Guard',
      scope: { agentRole: '*' },
      conditions: [{ field: 'cost', operator: 'gt', value: 50 }],
      action: 'deny',
      priority: 100,
      enabled: true,
      createdAt: new Date(),
    })
    .addPolicy({
      id: 'pol_approval',
      name: 'External Communication Approval',
      scope: { toolName: 'send_email' },
      conditions: [],
      action: 'require_approval',
      priority: 90,
      enabled: true,
      createdAt: new Date(),
    })
    .build();

  await client.initialize();

  // Set up RBAC
  const rbac = new RBACManager();
  rbac.createRole('task-agent', [
    'tool.read_file',
    'tool.http_request',
    'memory.read',
    'memory.write',
  ]);
  rbac.createRole('supervisor', [
    'tool.*',
    'memory.*',
    'agent.delegate',
    'agent.monitor',
  ]);
  rbac.createRole('admin', ['*']);

  // Assign roles
  rbac.assignRole('agt_researcher', 'task-agent');
  rbac.assignRole('agt_supervisor', 'supervisor');

  // Check permissions
  console.log('Researcher can read files:', rbac.hasPermission('agt_researcher', 'tool.read_file'));
  console.log('Researcher can delegate:', rbac.hasPermission('agt_researcher', 'agent.delegate'));
  console.log('Supervisor can delegate:', rbac.hasPermission('agt_supervisor', 'agent.delegate'));

  // Audit logging
  const auditLogger = client.getAuditLogger();
  auditLogger.log({
    agentId: 'agt_researcher',
    action: 'tool_call',
    resource: 'http_request',
    details: { url: 'https://api.example.com/data', method: 'GET' },
    timestamp: new Date(),
  });

  console.log('Audit entries:', auditLogger.getEntries().length);
  console.log('Integrity valid:', auditLogger.verifyIntegrity());

  await client.shutdown();
}

main().catch(console.error);
