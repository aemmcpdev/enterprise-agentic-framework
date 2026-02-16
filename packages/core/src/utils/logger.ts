import winston from 'winston';

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

export function createLogger(service: string): winston.Logger {
  return winston.createLogger({
    level: LOG_LEVEL,
    format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service },
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
            const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
            return `${timestamp} [${service}] ${level}: ${message}${metaStr}`;
          })
        ),
      }),
    ],
  });
}

export const logger = createLogger('eaf');
