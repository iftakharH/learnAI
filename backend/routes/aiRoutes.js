const express = require('express');
const router = express.Router();
const {
  summarizeDocument,
  explainDocumentConcept,
  createFlashcards,
  createQuiz,
  chatWithDocument
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:documentId/summary', protect, summarizeDocument);
router.post('/:documentId/explain', protect, explainDocumentConcept);
router.post('/:documentId/flashcards', protect, createFlashcards);
router.post('/:documentId/quiz', protect, createQuiz);
router.post('/:documentId/chat', protect, chatWithDocument);

module.exports = router;
