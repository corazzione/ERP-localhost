/**
 * Development Logger Utility
 * Only logs in development environment to avoid console pollution in production
 */

const isDev = process.env.NODE_ENV === 'development';

export const devLog = (...args) => isDev && console.log(...args);
export const devWarn = (...args) => isDev && console.warn(...args);
export const devError = (...args) => isDev && console.error(...args);

export default { devLog, devWarn, devError };
