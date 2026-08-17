const Document = require('../models/Document');
const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/Quiz');

// @desc    Get dashboard overview metrics
// @route   GET /api/dashboard
// @access  Private
const getDashboardOverview = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Run aggregations in parallel
    const [totalDocuments, flashcardCount, quizzesTaken, quizzes] = await Promise.all([
      Document.countDocuments({ user: userId }),
      Flashcard.countDocuments({ user: userId }),
      Quiz.countDocuments({ user: userId, score: { $gt: 0 } }),
      Quiz.find({ user: userId }).select('score totalQuestions')
    ]);

    // Calculate average score
    let averageScore = 0;
    if (quizzes.length > 0) {
      const totalScore = quizzes.reduce((acc, curr) => acc + (curr.score / curr.totalQuestions), 0);
      averageScore = Math.round((totalScore / quizzes.length) * 100);
    }

    res.json({
      totalDocuments,
      flashcardCount,
      quizzesTaken,
      averageScore
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardOverview };
