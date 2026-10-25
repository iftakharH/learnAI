'use strict';

const { ApiError } = require('../utils/ApiError');
const logger = require('../utils/logger');

const NEUTRAL_AI_ERROR =
  'The AI service could not complete this request right now. Please try again.';

/**
 * Turn raw provider errors into messages a student can act on.
 * Only applied to errors flagged with `source: 'ai'` so normal API errors keep
 * their own wording.
 */
const AI_ERROR_MESSAGES = [
  {
    re: /api.?key|invalid.*credentials|authenticat|permission|denied|forbidden|403/i,
    msg: NEUTRAL_AI_ERROR,
  },
  {
    re: /quota|rate.?limit|429|resource.?exhausted/i,
    msg: 'The AI service is busy right now. Please try again in a moment.',
  },
  {
    re: /timeout|timed.?out|network|ECONNRESET|ECONNREFUSED|fetch.?failed|aborted/i,
    msg: 'The AI service took too long to respond. Please try again.',
  },
  {
    re: /context.?length|token.?limit|content.?too.?long|too.?many.?tokens/i,
    msg: 'This document is too long to process at once. Try a shorter file or split it into parts.',
  },
  {
    re: /malformed|unparseable|json.?parse|invalid.?json|response.?schema|no.?text/i,
    msg: 'The AI returned data we could not read. Please retry the request.',
  },
  {
    re: /empty.*(response|ai|data)|readable text|no readable|scanned|image.?pdf/i,
    msg: 'This file has no selectable text. It may be a scanned PDF or an unsupported format.',
  },
  {
    re: /model.*(not.?found|retired|no longer|unavailable)|404/i,
    msg: 'The AI model is currently unavailable. Please try again shortly.',
  },
];

const makeFriendly = (message) => {
  if (!message) return 'Something went wrong. Please try again.';
  const match = AI_ERROR_MESSAGES.find(({ re }) => re.test(message));
  return match ? match.msg : NEUTRAL_AI_ERROR;
};

/**
 * Single source of truth for HTTP status codes.
 */
const resolveStatus = (error = {}) => {
  const explicit = error.statusCode ?? error.status;
  if (Number.isInteger(explicit) && explicit >= 400 && explicit <= 599) {
    return explicit;
  }

  if (error.code === 11000) return 409;

  switch (error.name) {
    case 'ValidationError':
      return 400;
    case 'CastError':
      return 400;
    case 'JsonWebTokenError':
    case 'TokenExpiredError':
      return 401;
    case 'MulterError':
      return error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    case 'SyntaxError':
      return 'body' in error ? 400 : 500;
    default:
      return 500;
  }
};

const describeValidationError = (error) => {
  if (error.name !== 'ValidationError' || !error.errors) return null;
  const first = Object.values(error.errors)[0];
  return first?.message ? `Validation failed: ${first.message}` : 'Validation failed';
};

const notFound = (req, res, next) => {
  next(ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};

// Express recognises error middleware by its four-argument signature.
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
  const status = resolveStatus(err);
  const isServerError = status >= 500;
  const isAiError = err.source === 'ai';

  let message;
  if (isAiError) {
    message = makeFriendly(err.message);
  } else if (err instanceof ApiError && err.expose) {
    message = err.message;
  } else if (status === 409) {
    message = 'That record already exists.';
  } else if (status === 400 || status === 422) {
    message = describeValidationError(err) || err.message || 'Invalid request.';
  } else {
    message = 'Something went wrong. Please try again.';
  }

  const userId = req.user?._id ? String(req.user._id) : 'anonymous';
  const line = `${req.method || '?'} ${req.originalUrl || ''} -> ${status} user=${userId} | ${err.message}`;

  if (isServerError) {
    logger.error(line, err.stack);
  } else {
    logger.warn(line);
  }

  const payload = { message };
  if (err.details) payload.details = err.details;
  if (!process.env.NODE_ENV || process.env.NODE_ENV !== 'production') {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
};

module.exports = { errorHandler, notFound, makeFriendly, resolveStatus };
