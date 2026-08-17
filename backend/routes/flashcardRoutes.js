const express = require('express');
const router = express.Router();
const {
  getFlashcards,
  bulkSaveFlashcards,
  toggleFavorite,
  deleteFlashcard
} = require('../controllers/flashcardController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getFlashcards);

router.post('/bulk', protect, bulkSaveFlashcards);

router.put('/:id/favorite', protect, toggleFavorite);
router.delete('/:id', protect, deleteFlashcard);

module.exports = router;
