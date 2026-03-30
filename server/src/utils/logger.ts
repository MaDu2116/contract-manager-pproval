type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  if (IS_PRODUCTION) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
    });
  }
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `[${new Date().toISOString()}] [${level}] ${message}${metaStr}`;
}

export const logger = {
  info(message: string, meta?: Record<string, unknown>) {
    console.log(formatMessage('INFO', message, meta));
  },
  warn(message: string, meta?: Record<string, unknown>) {
    console.warn(formatMessage('WARN', message, meta));
  },
  error(message: string, meta?: Record<string, unknown>) {
    console.error(formatMessage('ERROR', message, meta));
  },
  debug(message: string, meta?: Record<string, unknown>) {
    if (!IS_PRODUCTION) {
      console.debug(formatMessage('DEBUG', message, meta));
    }
  },
};
