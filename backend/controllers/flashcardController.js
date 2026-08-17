const Flashcard = require('../models/Flashcard');
const Document = require('../models/Document');

// @desc    Get all flashcards for user (optional filter by document)
// @route   GET /api/flashcards
// @access  Private
const getFlashcards = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.document) filter.document = req.query.document;

    const flashcards = await Flashcard.find(filter).sort({ createdAt: -1 });
    res.json(flashcards);
  } catch (error) {
    next(error);
  }
};

// @desc    Bulk save flashcards
// @route   POST /api/flashcards/bulk
// @access  Private
const bulkSaveFlashcards = async (req, res, next) => {
  try {
    const { documentId, flashcards } = req.body;
    
    if (!flashcards || !Array.isArray(flashcards)) {
      res.status(400);
      throw new Error('Please provide an array of flashcards');
    }

    if (documentId) {
      const document = await Document.findOne({ _id: documentId, user: req.user._id });
      if (!document) {
        res.status(404);
        throw new Error('Document not found or unauthorized');
      }
    }

    const flashcardsToInsert = flashcards.map(fc => ({
      user: req.user._id,
      document: documentId || null,
      front: fc.front,
      back: fc.back
    }));

    const savedCards = await Flashcard.insertMany(flashcardsToInsert);
    res.status(201).json(savedCards);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle flashcard favorite status
// @route   PUT /api/flashcards/:id/favorite
// @access  Private
const toggleFavorite = async (req, res, next) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id);

    if (!flashcard || flashcard.user.toString() !== req.user._id.toString()) {
      res.status(404);
      throw new Error('Flashcard not found or unauthorized');
    }

    flashcard.isFavorite = !flashcard.isFavorite;
    await flashcard.save();
    
    res.json(flashcard);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete flashcard
// @route   DELETE /api/flashcards/:id
// @access  Private
const deleteFlashcard = async (req, res, next) => {
  try {
    const flashcard = await Flashcard.findById(req.params.id);

    if (!flashcard || flashcard.user.toString() !== req.user._id.toString()) {
      res.status(404);
      throw new Error('Flashcard not found or unauthorized');
    }

    await flashcard.deleteOne();
    res.json({ message: 'Flashcard removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getFlashcards, bulkSaveFlashcards, toggleFavorite, deleteFlashcard };
