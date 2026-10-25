'use strict';

const {
  generateDocumentSummary,
  explainConcept,
  generateFlashcards,
  generateQuiz,
  processDocumentChat,
} = require('../services/aiService');
const { getOwnedDocument } = require('../services/documentService');
const ChatHistory = require('../models/ChatHistory');
const { ApiError } = require('../utils/ApiError');
const logger = require('../utils/logger');

const MAX_QUERY_LENGTH = 2000;
const MAX_STORED_MESSAGES = 40; // 20 turns

const requireDocumentText = (document) => {
  if (!document.extractedText || !document.extractedText.trim()) {
    throw ApiError.unprocessable(
      'This document has no extracted text yet. Upload the PDF again.',
    );
  }
  return document.extractedText;
};

// @desc    Generate a summary
// @route   POST /api/ai/:documentId/summary
// @access  Private
const summarizeDocument = async (req, res) => {
  const document = await getOwnedDocument(req.params.documentId, req.user._id);
  const summary = await generateDocumentSummary(requireDocumentText(document));
  res.json({ summary });
};

// @desc    Explain a concept in the document's context
// @route   POST /api/ai/:documentId/explain
// @access  Private
const explainDocumentConcept = async (req, res) => {
  const concept = String(req.body?.concept || '').trim();
  if (!concept) {
    throw ApiError.badRequest('Concept is required');
  }

  const document = await getOwnedDocument(req.params.documentId, req.user._id);
  const explanation = await explainConcept(concept, requireDocumentText(document));
  res.json({ explanation });
};

// @desc    Generate flashcards (not persisted; the client saves them)
// @route   POST /api/ai/:documentId/flashcards
// @access  Private
const createFlashcards = async (req, res) => {
  const document = await getOwnedDocument(req.params.documentId, req.user._id);
  const flashcards = await generateFlashcards(
    requireDocumentText(document),
    req.body?.count ?? 10,
  );
  res.json({ flashcards });
};

// @desc    Generate a quiz (not persisted; the client saves it)
// @route   POST /api/ai/:documentId/quiz
// @access  Private
const createQuiz = async (req, res) => {
  const document = await getOwnedDocument(req.params.documentId, req.user._id);
  const quiz = await generateQuiz(
    requireDocumentText(document),
    req.body?.numQuestions ?? 5,
  );
  res.json({ quiz });
};

// @desc    Chat with a document, persisting the conversation
// @route   POST /api/ai/:documentId/chat
// @access  Private
const chatWithDocument = async (req, res) => {
  const query = String(req.body?.query || '').trim();
  if (!query) {
    throw ApiError.badRequest('Chat query is required');
  }
  if (query.length > MAX_QUERY_LENGTH) {
    throw ApiError.badRequest(`Chat query cannot exceed ${MAX_QUERY_LENGTH} characters`);
  }

  const document = await getOwnedDocument(req.params.documentId, req.user._id);

  // Upsert keeps exactly one conversation per user/document pair.
  const session = await ChatHistory.findOneAndUpdate(
    { user: req.user._id, document: document._id },
    { $setOnInsert: { user: req.user._id, document: document._id, messages: [] } },
    { returnDocument: 'after', upsert: true, setDefaultsOnInsert: true },
  );

  const reply = await processDocumentChat(
    session.messages,
    query,
    requireDocumentText(document),
  );

  session.messages.push({ role: 'user', text: query }, { role: 'model', text: reply });
  if (session.messages.length > MAX_STORED_MESSAGES) {
    session.messages = session.messages.slice(-MAX_STORED_MESSAGES);
  }

  await session.save();
  logger.debug(`Chat reply stored for document ${document._id}`);

  res.json({ response: reply, messages: session.messages });
};

module.exports = {
  summarizeDocument,
  explainDocumentConcept,
  createFlashcards,
  createQuiz,
  chatWithDocument,
};
