'use strict';

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true, maxlength: 2000 },
    options: {
      type: [{ type: String, trim: true }],
      validate: {
        validator: (options) => Array.isArray(options) && options.length >= 2,
        message: 'A question needs at least two options',
      },
    },
    correctAnswer: { type: String, required: true, trim: true },
    explanation: { type: String, trim: true, default: '' },
  },
  { _id: false },
);

const quizSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    questions: {
      type: [questionSchema],
      validate: {
        validator: (questions) => Array.isArray(questions) && questions.length > 0,
        message: 'A quiz needs at least one question',
      },
    },
    score: { type: Number, default: 0, min: 0 },
    totalQuestions: { type: Number, required: true, min: 1 },
    lastAttemptAt: { type: Date },
  },
  { timestamps: true },
);

quizSchema.index({ user: 1, document: 1, createdAt: -1 });

module.exports = mongoose.model('Quiz', quizSchema);
