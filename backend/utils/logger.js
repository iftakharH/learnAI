'use strict';

/**
 * Minimal structured logger.
 *
 * Keeps a single, predictable line format so Render's log viewer stays readable.
 * `debug` is suppressed in production to avoid leaking request details.
 */
const isProduction = () => process.env.NODE_ENV === 'production';

const write = (stream, level, message, meta) => {
  const line = `${new Date().toISOString()} [${level}] ${message}`;
  if (meta === undefined) {
    stream(line);
    return;
  }
  stream(line, meta);
};

const logger = {
  info(message, meta) {
    write(console.log, 'info', message, meta);
  },
  warn(message, meta) {
    write(console.warn, 'warn', message, meta);
  },
  error(message, meta) {
    write(console.error, 'error', message, meta);
  },
  debug(message, meta) {
    if (!isProduction()) write(console.log, 'debug', message, meta);
  },
};

module.exports = logger;
