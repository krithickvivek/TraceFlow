/**
 * @file logger.js
 * @description Dev-only console wrapper. All logging is silenced in production.
 * @module utils/logger
 */

/** @type {boolean} Whether the app is running in development mode. */
const isDev = import.meta.env.DEV;

/**
 * Log a message to the console (dev only).
 * @param {...any} args
 */
export function log(...args) {
  if (isDev) console.log('[TraceFlow]', ...args);
}

/**
 * Log a warning (dev only).
 * @param {...any} args
 */
export function warn(...args) {
  if (isDev) console.warn('[TraceFlow]', ...args);
}

/**
 * Log an error (dev only).
 * @param {...any} args
 */
export function error(...args) {
  if (isDev) console.error('[TraceFlow]', ...args);
}
