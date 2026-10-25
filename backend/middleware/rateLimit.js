'use strict';

const { rateLimit } = require('express-rate-limit');
const { config } = require('../config/env');

const passthrough = (req, res, next) => next();

const buildLimiter = (options) => {
  if (!config.rateLimitEnabled) return passthrough;

  return rateLimit({
    windowMs: config.rateLimitWindowMs,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    ...options,
  });
};

/** Broad protection for the whole API surface. */
const apiLimiter = buildLimiter({
  limit: config.rateLimitMax,
  message: { message: 'Too many requests. Please slow down and try again shortly.' },
});

/** Tighter limit for credential endpoints, successful requests are not counted. */
const authLimiter = buildLimiter({
  limit: config.authRateLimitMax,
  skipSuccessfulRequests: true,
  message: { message: 'Too many authentication attempts. Please try again in 15 minutes.' },
});

module.exports = { apiLimiter, authLimiter };
