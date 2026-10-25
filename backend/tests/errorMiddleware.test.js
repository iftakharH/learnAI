'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { resolveStatus, errorHandler } = require('../middleware/errorMiddleware');
const { ApiError } = require('../utils/ApiError');

const createResponse = () => {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  return res;
};

const createRequest = () => ({
  method: 'POST',
  originalUrl: '/api/test',
  user: undefined,
});

const run = (error) => {
  const req = createRequest();
  const res = createResponse();
  errorHandler(error, req, res, () => {});
  return res;
};

test('resolveStatus keeps an explicit status code', () => {
  assert.equal(resolveStatus(new ApiError(422, 'bad file')), 422);
});

test('resolveStatus treats unknown errors as 500', () => {
  assert.equal(resolveStatus(new Error('boom')), 500);
});

test('resolveStatus maps duplicate keys to 409', () => {
  assert.equal(resolveStatus({ code: 11000 }), 409);
});

test('resolveStatus maps multer file size errors to 413', () => {
  const error = Object.assign(new Error('File too large'), {
    name: 'MulterError',
    code: 'LIMIT_FILE_SIZE',
  });
  assert.equal(resolveStatus(error), 413);
});

test('resolveStatus maps mongoose validation errors to 400', () => {
  assert.equal(resolveStatus({ name: 'ValidationError', errors: {} }), 400);
});

test('a bad request keeps its message', () => {
  const res = run(ApiError.badRequest('Password must be at least 6 characters'));
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, 'Password must be at least 6 characters');
});

test('an unexpected error hides internal details', () => {
  const res = run(new Error('database exploded'));
  assert.equal(res.statusCode, 500);
  assert.equal(res.body.message, 'Something went wrong. Please try again.');
  assert.ok(!String(res.body.message).includes('database exploded'));
});

test('validation errors surface the first field message', () => {
  const res = run({
    name: 'ValidationError',
    message: 'User validation failed',
    errors: { email: { message: 'Email is required' } },
  });
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, 'Validation failed: Email is required');
});

test('AI quota errors become a friendly, retryable message', () => {
  const res = run(
    new ApiError(502, 'Summary generation failed: 429 quota exceeded', { source: 'ai' }),
  );
  assert.equal(res.statusCode, 502);
  assert.equal(res.body.message, 'The AI service is busy right now. Please try again in a moment.');
});

test('detail payloads are forwarded without leaking internals', () => {
  const res = run(ApiError.badRequest('Invalid input', { field: 'email' }));
  assert.deepEqual(res.body.details, { field: 'email' });
});
