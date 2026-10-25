'use strict';

const mongoose = require('mongoose');
const Flashcard = require('../models/Flashcard');
const { getOwnedDocument } = require('../services/documentService');
const { ApiError } = require('../utils/ApiError');

const MAX_BULK_SIZE = 100;
const MAX_FRONT_LENGTH = 1000;
const MAX_BACK_LENGTH = 4000;

const assertValidId = (id, label = 'id') => {
  if (!mongoose.isValidObjectId(id)) {
    throw ApiError.badRequest(`Invalid ${label}`);
  }
};

const normalizeCard = (card, index) => {
  const front = typeof card?.front === 'string' ? card.front.trim() : '';
  const back = typeof card?.back === 'string' ? card.back.trim() : '';

  if (!front || !back) {
    throw ApiError.badRequest(`Flashcard at position ${index + 1} needs both "front" and "back"`);
  }
  if (front.length > MAX_FRONT_LENGTH) {
    throw ApiError.badRequest(
      `Flashcard at position ${index + 1} has a front longer than ${MAX_FRONT_LENGTH} characters`,
    );
  }
  if (back.length > MAX_BACK_LENGTH) {
    throw ApiError.badRequest(
      `Flashcard at position ${index + 1} has a back longer than ${MAX_BACK_LENGTH} characters`,
    );
  }

  return { front, back };
};

// @desc    List the user's flashcards, optionally filtered by document
// @route   GET /api/flashcards?document=:id
// @access  Private
const getFlashcards = async (req, res) => {
  const filter = { user: req.user._id };

  if (req.query.document) {
    assertValidId(req.query.document, 'document id');
    filter.document = req.query.document;
  }

  const flashcards = await Flashcard.find(filter).sort({ createdAt: -1 });
  res.json(flashcards);
};

// @desc    Save a batch of generated flashcards
// @route   POST /api/flashcards/bulk
// @access  Private
const bulkSaveFlashcards = async (req, res) => {
  const { documentId, flashcards } = req.body || {};

  if (!Array.isArray(flashcards) || flashcards.length === 0) {
    throw ApiError.badRequest('Provide a non-empty array of flashcards');
  }
  if (flashcards.length > MAX_BULK_SIZE) {
    throw ApiError.badRequest(`Cannot save more than ${MAX_BULK_SIZE} flashcards at once`);
  }

  if (documentId) {
    await getOwnedDocument(documentId, req.user._id, { includeText: false });
  }

  const cards = flashcards.map(normalizeCard);

  const saved = await Flashcard.insertMany(
    cards.map((card) => ({
      user: req.user._id,
      document: documentId || null,
      front: card.front,
      back: card.back,
    })),
  );

  res.status(201).json(saved);
};

// @desc    Toggle a flashcard's favourite flag
// @route   PUT /api/flashcards/:id/favorite
// @access  Private
const toggleFavorite = async (req, res) => {
  assertValidId(req.params.id, 'flashcard id');

  const flashcard = await Flashcard.findOne({ _id: req.params.id, user: req.user._id });
  if (!flashcard) {
    throw ApiError.notFound('Flashcard not found');
  }

  flashcard.isFavorite = !flashcard.isFavorite;
  await flashcard.save();

  res.json(flashcard);
};

// @desc    Delete a flashcard
// @route   DELETE /api/flashcards/:id
// @access  Private
const deleteFlashcard = async (req, res) => {
  assertValidId(req.params.id, 'flashcard id');

  const result = await Flashcard.deleteOne({ _id: req.params.id, user: req.user._id });
  if (result.deletedCount === 0) {
    throw ApiError.notFound('Flashcard not found');
  }

  res.json({ message: 'Flashcard removed' });
};

module.exports = { getFlashcards, bulkSaveFlashcards, toggleFavorite, deleteFlashcard };
