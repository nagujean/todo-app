type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger: Logger = {
  debug: (...args) => isDevelopment && console.debug('[DEBUG]', ...args),
  info: (...args) => isDevelopment && console.info('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
};

// Re-export LogLevel type for external use
export type { LogLevel };
