const express = require('express');
const router = express.Router();
const {
  getQuizzes,
  saveQuiz,
  submitQuiz
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getQuizzes)
  .post(protect, saveQuiz);

router.put('/:id/submit', protect, submitQuiz);

module.exports = router;
