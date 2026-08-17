const Quiz = require('../models/Quiz');
const Document = require('../models/Document');

// @desc    Get all quizzes for user
// @route   GET /api/quizzes
// @access  Private
const getQuizzes = async (req, res, next) => {
  try {
    const filter = { user: req.user._id };
    if (req.query.document) filter.document = req.query.document;

    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    next(error);
  }
};

// @desc    Save a newly generated quiz
// @route   POST /api/quizzes
// @access  Private
const saveQuiz = async (req, res, next) => {
  try {
    const { documentId, title, questions } = req.body;
    
    if (!questions || !Array.isArray(questions)) {
      res.status(400);
      throw new Error('Please provide an array of questions');
    }

    if (documentId) {
      const document = await Document.findOne({ _id: documentId, user: req.user._id });
      if (!document) {
        res.status(404);
        throw new Error('Document not found or unauthorized');
      }
    }

    const quiz = await Quiz.create({
      user: req.user._id,
      document: documentId || null,
      title: title || 'Generated Quiz',
      questions,
      totalQuestions: questions.length
    });

    res.status(201).json(quiz);
  } catch (error) {
    next(error);
  }
};

// @desc    Submit quiz answers and update score
// @route   PUT /api/quizzes/:id/submit
// @access  Private
const submitQuiz = async (req, res, next) => {
  try {
    const { score } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz || quiz.user.toString() !== req.user._id.toString()) {
      res.status(404);
      throw new Error('Quiz not found or unauthorized');
    }

    quiz.score = score;
    await quiz.save();
    
    res.json(quiz);
  } catch (error) {
    next(error);
  }
};

module.exports = { getQuizzes, saveQuiz, submitQuiz };
