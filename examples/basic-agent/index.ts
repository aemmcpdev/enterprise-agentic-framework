/**
 * Basic Agent Example
 *
 * This example shows how to create and run a simple agent
 * using the EAF SDK.
 */

import { EAFBuilder } from '@eaf/sdk';
import { AnthropicProvider } from '@eaf/cortex';

async function main() {
  // Build the EAF client using the fluent builder
  const client = new EAFBuilder()
    .setAppName('basic-example')
    .setDefaultModel('claude-sonnet-4-5-20250929')
    .setLogLevel('info')
    .enableAudit()
    .addProvider(
      new AnthropicProvider({
        name: 'anthropic',
        apiKey: process.env.ANTHROPIC_API_KEY!,
        defaultModel: 'claude-sonnet-4-5-20250929',
      }),
    )
    .build();

  await client.initialize();

  // Create a simple agent
  const agentId = await client.createAgent({
    name: 'Assistant',
    model: 'claude-sonnet-4-5-20250929',
    systemPrompt: 'You are a helpful AI assistant. Answer questions clearly and concisely.',
    tools: ['http_request', 'read_file'],
    maxIterations: 10,
  });

  console.log(`Agent created: ${agentId}`);

  // In a full implementation, you would run the agent loop here:
  // const result = await client.runAgent(agentId, "What is the weather today?");

  await client.shutdown();
}

main().catch(console.error);
