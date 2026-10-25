'use strict';

// Must be set before the config module is loaded.
process.env.AI_MAX_TEXT_CHARS = '20';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  safeParseJSON,
  extractJsonBlock,
  normalizeHistory,
  truncateText,
} = require('../services/aiService');

test('extractJsonBlock finds an array embedded in prose', () => {
  const raw = 'Here you go:\n[{"front":"A","back":"B"}]\nHope that helps.';
  assert.equal(extractJsonBlock(raw), '[{"front":"A","back":"B"}]');
});

test('extractJsonBlock ignores braces inside strings', () => {
  const raw = '{"question":"What is }?","options":["a","b"]}';
  assert.equal(extractJsonBlock(raw), raw);
});

test('extractJsonBlock returns null when there is no JSON', () => {
  assert.equal(extractJsonBlock('no json here'), null);
});

test('safeParseJSON handles fenced JSON', () => {
  const parsed = safeParseJSON('```json\n[{"front":"Q","back":"A"}]\n```', 'Flashcards');
  assert.deepEqual(parsed, [{ front: 'Q', back: 'A' }]);
});

test('safeParseJSON rejects empty output', () => {
  assert.throws(() => safeParseJSON('   ', 'Flashcards'), /empty AI response/);
});

test('safeParseJSON rejects an unbalanced JSON fragment', () => {
  assert.throws(() => safeParseJSON('[{"front":"Q"', 'Flashcards'), /did not contain JSON/);
});

test('safeParseJSON rejects malformed JSON', () => {
  assert.throws(() => safeParseJSON('[{"front":}]', 'Flashcards'), /unreadable JSON/);
});

test('normalizeHistory drops leading model turns', () => {
  const history = normalizeHistory([
    { role: 'model', text: 'stale answer' },
    { role: 'user', text: 'hello' },
    { role: 'model', text: 'hi' },
  ]);

  assert.deepEqual(history, [
    { role: 'user', parts: [{ text: 'hello' }] },
    { role: 'model', parts: [{ text: 'hi' }] },
  ]);
});

test('normalizeHistory merges consecutive same-role messages', () => {
  const history = normalizeHistory([
    { role: 'user', text: 'one' },
    { role: 'user', text: 'two' },
    { role: 'model', text: 'answer' },
  ]);

  assert.equal(history.length, 2);
  assert.equal(history[0].parts[0].text, 'one\n\ntwo');
});

test('normalizeHistory drops a trailing user turn', () => {
  const history = normalizeHistory([
    { role: 'user', text: 'one' },
    { role: 'model', text: 'answer' },
    { role: 'user', text: 'unanswered' },
  ]);

  assert.equal(history.length, 2);
  assert.equal(history[1].role, 'model');
});

test('truncateText respects the configured limit', () => {
  const result = truncateText('x'.repeat(50), 'test');
  assert.equal(result.length, 20);
});

test('truncateText returns an empty string for bad input', () => {
  assert.equal(truncateText(null, 'test'), '');
  assert.equal(truncateText(42, 'test'), '');
});
