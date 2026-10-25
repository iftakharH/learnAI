'use strict';

const Document = require('../models/Document');
const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/Quiz');

// @desc    Aggregated learning stats for the dashboard
// @route   GET /api/dashboard
// @access  Private
const getDashboardOverview = async (req, res) => {
  const userId = req.user._id;

  const [totalDocuments, flashcardCount, attempts] = await Promise.all([
    Document.countDocuments({ user: userId }),
    Flashcard.countDocuments({ user: userId }),
    Quiz.find({ user: userId, score: { $gt: 0 } })
      .select('score totalQuestions')
      .lean(),
  ]);

  const averageScore =
    attempts.length === 0
      ? 0
      : Math.round(
          (attempts.reduce(
            (total, quiz) => total + quiz.score / Math.max(quiz.totalQuestions, 1),
            0,
          ) /
            attempts.length) *
            100,
        );

  res.json({
    totalDocuments,
    flashcardCount,
    quizzesTaken: attempts.length,
    averageScore,
  });
};

module.exports = { getDashboardOverview };
