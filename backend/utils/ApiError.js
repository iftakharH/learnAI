'use strict';

/**
 * Error type that carries an HTTP status code.
 *
 * Controllers throw these instead of mutating `res.statusCode`, which keeps
 * status handling in exactly one place: the error middleware.
 */
class ApiError extends Error {
  constructor(statusCode, message, options = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.expose = options.expose ?? statusCode < 500;
    this.source = options.source;
    this.details = options.details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  static badRequest(message, details) {
    return new ApiError(400, message, { details });
  }

  static unauthorized(message = 'Authentication required') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'You do not have access to this resource') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(404, message);
  }

  static conflict(message) {
    return new ApiError(409, message);
  }

  static payloadTooLarge(message) {
    return new ApiError(413, message);
  }

  static unprocessable(message, details) {
    return new ApiError(422, message, { details });
  }

  static serviceUnavailable(message) {
    return new ApiError(503, message);
  }
}

module.exports = { ApiError };
