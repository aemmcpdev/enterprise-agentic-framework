import { logger } from './logger.js';

export interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
  onRetry?: (error: Error, attempt: number) => void;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000,
  backoffMultiplier: 2,
};

export async function retry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === opts.maxRetries) {
        break;
      }

      if (opts.retryableErrors && opts.retryableErrors.length > 0) {
        const isRetryable = opts.retryableErrors.some(
          (e) => lastError!.message.includes(e) || lastError!.name.includes(e)
        );
        if (!isRetryable) {
          break;
        }
      }

      const delay = Math.min(
        opts.baseDelayMs * Math.pow(opts.backoffMultiplier, attempt),
        opts.maxDelayMs
      );

      const jitter = delay * 0.1 * Math.random();

      logger.debug(`Retry attempt ${attempt + 1}/${opts.maxRetries}`, {
        error: lastError.message,
        delayMs: delay + jitter,
      });

      opts.onRetry?.(lastError, attempt + 1);
      await sleep(delay + jitter);
    }
  }

  throw lastError!;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function timeout<T>(
  promise: Promise<T>,
  ms: number,
  message = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(message)), ms)
    ),
  ]);
}
