type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface Logger {
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

const getIsDevelopment = () => process.env.NODE_ENV === 'development';

export const logger: Logger = {
  debug: (...args) => getIsDevelopment() && console.debug('[DEBUG]', ...args),
  info: (...args) => getIsDevelopment() && console.info('[INFO]', ...args),
  warn: (...args) => console.warn('[WARN]', ...args),
  error: (...args) => console.error('[ERROR]', ...args),
};

// Re-export LogLevel type for external use
export type { LogLevel };
