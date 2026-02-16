/**
 * Multi-Agent Team Example
 *
 * This example demonstrates how to set up a hierarchical
 * multi-agent team with a supervisor and task agents.
 */

import { EAFBuilder } from '@eaf/sdk';
import { AnthropicProvider } from '@eaf/cortex';

async function main() {
  const client = new EAFBuilder()
    .setAppName('multi-agent-team')
    .setDefaultModel('claude-sonnet-4-5-20250929')
    .setLogLevel('info')
    .enableAudit()
    .setMaxConcurrentAgents(5)
    .addProvider(
      new AnthropicProvider({
        name: 'anthropic',
        apiKey: process.env.ANTHROPIC_API_KEY!,
        defaultModel: 'claude-sonnet-4-5-20250929',
      }),
    )
    .build();

  await client.initialize();

  // Create the hierarchy
  const hierarchy = client.getHierarchyManager();

  // Strategic agent (top level)
  const strategicId = await client.createAgent({
    name: 'Strategic Planner',
    model: 'claude-sonnet-4-5-20250929',
    systemPrompt: 'You are a strategic planning agent. Break down high-level goals into objectives for supervisors.',
  });

  // Supervisor
  const supervisorId = await client.createAgent({
    name: 'Research Supervisor',
    model: 'claude-sonnet-4-5-20250929',
    systemPrompt: 'You supervise research tasks. Delegate to task agents and compile results.',
  });

  // Task agents
  const researcherId = await client.createAgent({
    name: 'Web Researcher',
    model: 'claude-haiku-4-5-20251001',
    systemPrompt: 'You research topics using web search and compile findings.',
    tools: ['http_request'],
  });

  const analystId = await client.createAgent({
    name: 'Data Analyst',
    model: 'claude-haiku-4-5-20251001',
    systemPrompt: 'You analyze data and produce statistical summaries.',
    tools: ['read_file', 'database_query'],
  });

  console.log('Team created:');
  console.log(`  Strategic: ${strategicId}`);
  console.log(`  Supervisor: ${supervisorId}`);
  console.log(`  Researcher: ${researcherId}`);
  console.log(`  Analyst: ${analystId}`);

  // In a full implementation:
  // hierarchy.registerAgent(strategicId, 'strategic', null);
  // hierarchy.registerAgent(supervisorId, 'supervisor', strategicId);
  // hierarchy.registerAgent(researcherId, 'task', supervisorId);
  // hierarchy.registerAgent(analystId, 'task', supervisorId);
  //
  // await hierarchy.submitGoal(strategicId, {
  //   name: 'Market Analysis',
  //   description: 'Analyze Q1 market trends for our product category',
  // });

  await client.shutdown();
}

main().catch(console.error);
