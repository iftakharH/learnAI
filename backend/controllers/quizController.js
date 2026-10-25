'use strict';

const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
const { getOwnedDocument } = require('../services/documentService');
const { ApiError } = require('../utils/ApiError');

const MAX_QUESTIONS = 50;
const MAX_TITLE_LENGTH = 120;
const MAX_OPTIONS = 4;

const assertValidId = (id, label = 'id') => {
  if (!mongoose.isValidObjectId(id)) {
    throw ApiError.badRequest(`Invalid ${label}`);
  }
};

const normalizeQuestion = (question, index) => {
  const position = index + 1;

  if (!question || typeof question.question !== 'string' || !question.question.trim()) {
    throw ApiError.badRequest(`Question ${position} is missing its text`);
  }

  if (!Array.isArray(question.options) || question.options.length < 2) {
    throw ApiError.badRequest(`Question ${position} needs at least two options`);
  }

  const options = question.options
    .filter((option) => typeof option === 'string' && option.trim())
    .map((option) => option.trim())
    .slice(0, MAX_OPTIONS);

  if (options.length < 2) {
    throw ApiError.badRequest(`Question ${position} needs at least two non-empty options`);
  }

  const answer = typeof question.correctAnswer === 'string' ? question.correctAnswer.trim() : '';
  const matched = options.find((option) => option.toLowerCase() === answer.toLowerCase());
  if (!matched) {
    throw ApiError.badRequest(`Question ${position} has a correctAnswer that matches no option`);
  }

  return {
    question: question.question.trim(),
    options,
    correctAnswer: matched,
    explanation: typeof question.explanation === 'string' ? question.explanation.trim() : '',
  };
};

// @desc    List the user's quizzes, optionally filtered by document
// @route   GET /api/quizzes?document=:id
// @access  Private
const getQuizzes = async (req, res) => {
  const filter = { user: req.user._id };

  if (req.query.document) {
    assertValidId(req.query.document, 'document id');
    filter.document = req.query.document;
  }

  const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });
  res.json(quizzes);
};

// @desc    Save a generated quiz
// @route   POST /api/quizzes
// @access  Private
const saveQuiz = async (req, res) => {
  const { documentId, title, questions } = req.body || {};

  if (!Array.isArray(questions) || questions.length === 0) {
    throw ApiError.badRequest('Provide a non-empty array of questions');
  }
  if (questions.length > MAX_QUESTIONS) {
    throw ApiError.badRequest(`A quiz cannot contain more than ${MAX_QUESTIONS} questions`);
  }

  if (documentId) {
    await getOwnedDocument(documentId, req.user._id, { includeText: false });
  }

  const normalized = questions.map(normalizeQuestion);
  const quizTitle = String(title || 'Generated Quiz').trim().slice(0, MAX_TITLE_LENGTH) || 'Generated Quiz';

  const quiz = await Quiz.create({
    user: req.user._id,
    document: documentId || null,
    title: quizTitle,
    questions: normalized,
    totalQuestions: normalized.length,
  });

  res.status(201).json(quiz);
};

// @desc    Record a quiz attempt
// @route   PUT /api/quizzes/:id/submit
// @access  Private
const submitQuiz = async (req, res) => {
  assertValidId(req.params.id, 'quiz id');

  const score = Number(req.body?.score);
  if (!Number.isInteger(score) || score < 0) {
    throw ApiError.badRequest('score must be a non-negative integer');
  }

  const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });
  if (!quiz) {
    throw ApiError.notFound('Quiz not found');
  }
  if (score > quiz.totalQuestions) {
    throw ApiError.badRequest(`score cannot exceed ${quiz.totalQuestions}`);
  }

  quiz.score = score;
  quiz.lastAttemptAt = new Date();
  await quiz.save();

  res.json(quiz);
};

module.exports = { getQuizzes, saveQuiz, submitQuiz };
