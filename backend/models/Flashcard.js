'use strict';

const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema(
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
    front: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    back: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true },
);

flashcardSchema.index({ user: 1, document: 1, createdAt: -1 });

module.exports = mongoose.model('Flashcard', flashcardSchema);
