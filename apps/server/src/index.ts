import { config } from 'dotenv';
config();

import { logger } from '@eaf/core';
import { createServer } from './server.js';

const port = parseInt(process.env.PORT ?? '3000', 10);
const host = process.env.HOST ?? '0.0.0.0';

async function main(): Promise<void> {
  const server = await createServer();

  try {
    await server.listen({ port, host });
    logger.info(`EAF Server listening on ${host}:${port}`);
  } catch (err) {
    logger.error('Failed to start server', { error: String(err) });
    process.exit(1);
  }
}

main();
