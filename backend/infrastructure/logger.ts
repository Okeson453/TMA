export interface Logger {
  info(message: string, context?: Record<string, any>): void;
  warn(message: string, context?: Record<string, any>): void;
  error(message: string, context?: Record<string, any>): void;
  debug(message: string, context?: Record<string, any>): void;
}

function formatLog(level: string, message: string, context?: Record<string, any>) {
  const timestamp = new Date().toISOString();
  const meta = context ? JSON.stringify(context) : '';
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  if (level === 'error') {
    console.error(`${prefix} ${message} ${meta}`);
  } else if (level === 'warn') {
    console.warn(`${prefix} ${message} ${meta}`);
  } else {
    console.log(`${prefix} ${message} ${meta}`);
  }
}

export const logger: Logger = {
  info: (msg, ctx) => formatLog('info', msg, ctx),
  warn: (msg, ctx) => formatLog('warn', msg, ctx),
  error: (msg, ctx) => formatLog('error', msg, ctx),
  debug: (msg, ctx) => {
    if (process.env.DEBUG) formatLog('debug', msg, ctx);
  },
};
