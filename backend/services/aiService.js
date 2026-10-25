'use strict';

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { config } = require('../config/env');
const { ApiError } = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Google retires model IDs regularly (gemini-2.0-flash is already gone).
 * The alias always points at a current Flash model, so it acts as a safety net.
 */
const FALLBACK_MODEL = 'gemini-flash-latest';
const MAX_HISTORY_MESSAGES = 20;
const MAX_CONCEPT_LENGTH = 120;

let client = null;

const aiError = (message, statusCode = 502) =>
  new ApiError(statusCode, message, { source: 'ai' });

const getClient = () => {
  if (!config.geminiApiKey) {
    throw aiError('GEMINI_API_KEY is not configured in environment variables.', 503);
  }
  if (!client) client = new GoogleGenerativeAI(config.geminiApiKey);
  return client;
};

const buildModel = (modelName, systemInstruction) => {
  const params = { model: modelName };
  if (systemInstruction) params.systemInstruction = systemInstruction;
  return getClient().getGenerativeModel(params, { timeout: config.aiTimeoutMs });
};

// --- Retry & transport ------------------------------------------------------

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const RETRYABLE_ERROR =
  /(429|5\d\d|ECONNRESET|ECONNREFUSED|ETIMEDOUT|socket hang up|timeout|timed out|aborted|overloaded|fetch failed)/i;
const MISSING_MODEL_ERROR = /(404|not found|no longer|retired|does not exist)/i;

/** Google reports how long to wait for quota resets; honour it when present. */
const parseRetryDelayMs = (message = '') => {
  const match = /please retry in ([\d.]+)s/i.exec(message) || /"retryDelay"\s*:\s*"(\d+)s"/i.exec(message);
  if (!match) return null;
  const seconds = Number.parseFloat(match[1]);
  if (!Number.isFinite(seconds)) return null;
  return Math.min(seconds * 1000, 8000);
};

const withRetry = async (operation, label) => {
  const attempts = Math.max(config.aiMaxRetries, 0) + 1;
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const canRetry = attempt < attempts && RETRYABLE_ERROR.test(error.message || '');
      if (!canRetry) break;

      const delay = parseRetryDelayMs(error.message) ?? Math.min(1000 * 2 ** (attempt - 1), 8000);
      logger.warn(
        `[ai] ${label} attempt ${attempt}/${attempts} failed (${error.message.split('\n')[0]}); retrying in ${delay}ms`,
      );
      await sleep(delay);
    }
  }

  throw lastError;
};

const generateContent = async ({ prompt, systemInstruction, json = false, label }) => {
  const run = (modelName) => async () => {
    const model = buildModel(modelName, systemInstruction);
    const payload = json
      ? {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }
      : prompt;

    const result = await model.generateContent(payload);
    const text = (result.response.text() || '').trim();

    if (!text) throw new Error('The AI returned an empty response');
    return text;
  };

  try {
    return await withRetry(run(config.geminiModel), label);
  } catch (error) {
    if (MISSING_MODEL_ERROR.test(error.message || '') && config.geminiModel !== FALLBACK_MODEL) {
      logger.warn(
        `[ai] model "${config.geminiModel}" is unavailable; retrying with "${FALLBACK_MODEL}"`,
      );
      return withRetry(run(FALLBACK_MODEL), label);
    }
    throw error;
  }
};

const toAiError = (error, label) => {
  if (error instanceof ApiError && error.source === 'ai') return error;
  logger.error(`[ai] ${label} failed: ${error.message}`);
  return aiError(`${label} failed: ${error.message}`);
};

// --- JSON helpers -----------------------------------------------------------

/**
 * Pull the first complete JSON array/object out of model output.
 * Models still wrap JSON in prose or code fences often enough to matter.
 */
const extractJsonBlock = (raw) => {
  const text = String(raw)
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/,'');

  const startIndex = text.search(/[[{]/);
  if (startIndex === -1) return null;

  const open = text[startIndex];
  const close = open === '[' ? ']' : '}';
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = startIndex; i < text.length; i += 1) {
    const char = text[i];

    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
      continue;
    }

    if (char === '"') {
      inString = true;
    } else if (char === open) {
      depth += 1;
    } else if (char === close) {
      depth -= 1;
      if (depth === 0) return text.slice(startIndex, i + 1);
    }
  }

  return null;
};

const safeParseJSON = (raw, context = 'AI response') => {
  if (!raw || !String(raw).trim()) {
    throw new Error(`${context}: empty AI response`);
  }

  const block = extractJsonBlock(raw);
  if (!block) {
    throw new Error(`${context}: response did not contain JSON`);
  }

  try {
    return JSON.parse(block);
  } catch (error) {
    logger.error(`[ai] ${context}: JSON parse failed (${error.message}) near ${block.slice(0, 200)}`);
    throw new Error(`${context}: unreadable JSON (${error.message})`);
  }
};

// --- Text helpers -----------------------------------------------------------

const truncateText = (text, label) => {
  if (!text || typeof text !== 'string') return '';
  const normalized = text.trim();
  if (normalized.length <= config.aiMaxTextChars) return normalized;

  logger.warn(
    `[ai] ${label}: text truncated from ${normalized.length} to ${config.aiMaxTextChars} characters`,
  );
  return normalized.slice(0, config.aiMaxTextChars);
};

const clampCount = (value, fallback, min, max) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};

const sanitizeConcept = (concept) =>
  String(concept || '')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_CONCEPT_LENGTH);

// --- Public features --------------------------------------------------------

const generateDocumentSummary = async (text) => {
  const body = truncateText(text, 'summary');
  if (!body) {
    throw aiError('No readable text available to summarize.', 422);
  }

  try {
    const prompt =
      'Summarise the document below for a student who needs to revise quickly.\n' +
      'Structure the answer as:\n' +
      '1. A two-sentence overview.\n' +
      '2. Five to eight key points as short bullets.\n' +
      '3. Three terms worth memorising.\n' +
      'Only use information present in the document.\n\n' +
      `DOCUMENT:\n${body}`;

    logger.info('[ai] generating summary');
    const summary = await generateContent({ prompt, label: 'summary' });
    logger.info(`[ai] summary ready (${summary.length} chars)`);
    return summary;
  } catch (error) {
    throw toAiError(error, 'Summary generation');
  }
};

const explainConcept = async (concept, text) => {
  const term = sanitizeConcept(concept);
  if (!term) {
    throw ApiError.badRequest('Concept is required');
  }

  const body = truncateText(text, `explain:${term}`);

  try {
    const prompt =
      `Explain the concept "${term}" to a student, using the document below as the primary source.\n` +
      'Start with a one-line definition, then give a short worked explanation.\n' +
      'If the document does not cover it, say so and answer from general knowledge ' +
      'under the heading "General knowledge:".\n\n' +
      `DOCUMENT:\n${body}`;

    logger.info(`[ai] explaining "${term}"`);
    return await generateContent({ prompt, label: 'explanation' });
  } catch (error) {
    throw toAiError(error, 'Explanation');
  }
};

const generateFlashcards = async (text, count = 10) => {
  const body = truncateText(text, 'flashcards');
  if (!body) {
    throw aiError('No readable text available for flashcard generation.', 422);
  }

  const total = clampCount(count, 10, 1, 50);

  try {
    const prompt =
      `Create exactly ${total} study flashcards from the document below.\n` +
      'Return ONLY a JSON array. No markdown, no prose, no code fences.\n' +
      'Every object must have exactly two string keys: "front" (question or term) ' +
      'and "back" (answer or definition).\n' +
      'Keep each answer under 60 words and make each card test a different idea.\n' +
      'Example: [{"front":"What is X?","back":"X is Y."}]\n\n' +
      `DOCUMENT:\n${body}`;

    logger.info(`[ai] generating ${total} flashcards`);
    const raw = await generateContent({ prompt, json: true, label: 'flashcards' });
    const cards = safeParseJSON(raw, 'Flashcards');

    if (!Array.isArray(cards)) {
      throw new Error('Flashcards: model did not return an array');
    }

    const seen = new Set();
    const clean = cards
      .filter((card) => card && typeof card.front === 'string' && typeof card.back === 'string')
      .map((card) => ({ front: card.front.trim(), back: card.back.trim() }))
      .filter((card) => {
        const key = card.front.toLowerCase();
        if (!card.front || !card.back || seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, total);

    if (clean.length === 0) {
      throw new Error('Flashcards: model returned 0 valid cards');
    }

    logger.info(`[ai] flashcards ready (${clean.length})`);
    return clean;
  } catch (error) {
    throw toAiError(error, 'Flashcard generation');
  }
};

const generateQuiz = async (text, numQuestions = 5) => {
  const body = truncateText(text, 'quiz');
  if (!body) {
    throw aiError('No readable text available for quiz generation.', 422);
  }

  const total = clampCount(numQuestions, 5, 1, 20);

  try {
    const prompt =
      `Write a multiple-choice quiz with exactly ${total} questions from the document below.\n` +
      'Return ONLY a JSON array. No markdown, no prose, no code fences.\n' +
      'Each object must have:\n' +
      '  "question" (string),\n' +
      '  "options" (array of exactly 4 strings),\n' +
      '  "correctAnswer" (string, identical to one of the options),\n' +
      '  "explanation" (string, under 40 words).\n' +
      'Ask about different parts of the document and avoid negative questions.\n\n' +
      `DOCUMENT:\n${body}`;

    logger.info(`[ai] generating quiz (${total} questions)`);
    const raw = await generateContent({ prompt, json: true, label: 'quiz' });
    const questions = safeParseJSON(raw, 'Quiz');

    if (!Array.isArray(questions)) {
      throw new Error('Quiz: model did not return an array');
    }

    const seen = new Set();
    const clean = questions
      .map((item) => {
        if (!item || typeof item.question !== 'string') return null;
        if (!Array.isArray(item.options)) return null;
        if (typeof item.correctAnswer !== 'string') return null;

        const options = item.options
          .filter((option) => typeof option === 'string' && option.trim())
          .map((option) => option.trim())
          .slice(0, 4);

        if (options.length < 2) return null;

        const answer = item.correctAnswer.trim();
        const matched = options.find((option) => option.toLowerCase() === answer.toLowerCase());
        if (!matched) return null;

        const question = item.question.trim();
        const key = question.toLowerCase();
        if (!question || seen.has(key)) return null;
        seen.add(key);

        return {
          question,
          options,
          correctAnswer: matched,
          explanation: typeof item.explanation === 'string' ? item.explanation.trim() : '',
        };
      })
      .filter(Boolean)
      .slice(0, total);

    if (clean.length === 0) {
      throw new Error('Quiz: model returned 0 valid questions');
    }

    logger.info(`[ai] quiz ready (${clean.length} questions)`);
    return clean;
  } catch (error) {
    throw toAiError(error, 'Quiz generation');
  }
};

/**
 * Gemini requires a history that starts with a user turn, alternates roles and
 * ends with a model turn. Older history can violate all three after trimming.
 */
const normalizeHistory = (messages = []) => {
  const merged = [];

  for (const message of messages) {
    if (!message || typeof message.text !== 'string' || !message.text.trim()) continue;
    if (message.role !== 'user' && message.role !== 'model') continue;

    const text = message.text.trim();
    const last = merged[merged.length - 1];
    if (last && last.role === message.role) {
      last.text = `${last.text}\n\n${text}`;
    } else {
      merged.push({ role: message.role, text });
    }
  }

  while (merged.length > 0 && merged[0].role !== 'user') merged.shift();
  while (merged.length > 0 && merged[merged.length - 1].role !== 'model') merged.pop();

  const capped = merged.slice(-MAX_HISTORY_MESSAGES);
  while (capped.length > 0 && capped[0].role !== 'user') capped.shift();

  return capped.map((message) => ({
    role: message.role,
    parts: [{ text: message.text }],
  }));
};

const buildChatSystemInstruction = (documentContext) =>
  'You are a precise study assistant answering questions about one document.\n' +
  'Rules:\n' +
  '- Use the DOCUMENT CONTEXT as the primary source.\n' +
  '- If the answer is not in the context, say so in one sentence, then answer from ' +
  'general knowledge under the heading "General knowledge:".\n' +
  '- Be concise, use plain language, and refer to terms from the document when useful.\n' +
  '- Never invent facts about the document.\n\n' +
  `DOCUMENT CONTEXT:\n${documentContext}`;

const processDocumentChat = async (chatHistory, userQuery, documentContext) => {
  const query = String(userQuery || '').trim();
  if (!query) {
    throw ApiError.badRequest('Chat query is required');
  }

  const context = truncateText(documentContext, 'chat context');

  try {
    const model = buildModel(config.geminiModel, buildChatSystemInstruction(context));
    const history = normalizeHistory(chatHistory);

    logger.info(`[ai] chat query: ${query.slice(0, 80)}`);
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(query);
    const reply = (result.response.text() || '').trim();

    if (!reply) throw new Error('The AI returned an empty response');

    logger.info(`[ai] chat reply ready (${reply.length} chars)`);
    return reply;
  } catch (error) {
    throw toAiError(error, 'Chat request');
  }
};

module.exports = {
  generateDocumentSummary,
  explainConcept,
  generateFlashcards,
  generateQuiz,
  processDocumentChat,
  // Exported for unit tests
  safeParseJSON,
  extractJsonBlock,
  normalizeHistory,
  truncateText,
};
