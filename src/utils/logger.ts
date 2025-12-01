/**
 * Logger Utility
 *
 * Provides development-only logging that is stripped in production builds.
 * Uses console.warn and console.error which are allowed by ESLint config.
 */

const isDev = import.meta.env.DEV;

/**
 * Development-only logger that wraps console methods.
 * - debug/info: Only log in development mode
 * - warn/error: Always log (allowed by ESLint config)
 */
export const logger = {
  /**
   * Log debug information (development only)
   */
  debug: (...args: unknown[]): void => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.log('[DEBUG]', ...args);
    }
  },

  /**
   * Log general information (development only)
   */
  info: (...args: unknown[]): void => {
    if (isDev) {
      // eslint-disable-next-line no-console
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Log warnings (always enabled)
   */
  warn: (...args: unknown[]): void => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Log errors (always enabled)
   */
  error: (...args: unknown[]): void => {
    console.error('[ERROR]', ...args);
  },
};

export default logger;
