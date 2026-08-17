const {
  generateDocumentSummary,
  explainConcept,
  generateFlashcards,
  generateQuiz,
  processDocumentChat
} = require('../services/aiService');
const Document = require('../models/Document');
const ChatHistory = require('../models/ChatHistory');

const getDocAndCheckAuth = async (req, res) => {
  const document = await Document.findById(req.params.documentId);
  if (!document) {
    res.status(404);
    throw new Error('Document not found');
  }
  if (document.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Unauthorized access to document');
  }
  return document;
};

// @desc    Generate a summary for a document
// @route   POST /api/ai/:documentId/summary
// @access  Private
const summarizeDocument = async (req, res, next) => {
  try {
    const document = await getDocAndCheckAuth(req, res);
    const summary = await generateDocumentSummary(document.extractedText);
    res.json({ summary });
  } catch (error) {
    next(error);
  }
};

// @desc    Explain a specific concept from a document
// @route   POST /api/ai/:documentId/explain
// @access  Private
const explainDocumentConcept = async (req, res, next) => {
  try {
    const { concept } = req.body;
    if (!concept) {
      res.status(400);
      throw new Error('Concept is required');
    }
    const document = await getDocAndCheckAuth(req, res);
    const explanation = await explainConcept(concept, document.extractedText);
    res.json({ explanation });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate flashcards from a document
// @route   POST /api/ai/:documentId/flashcards
// @access  Private
const createFlashcards = async (req, res, next) => {
  try {
    const { count } = req.body;
    const document = await getDocAndCheckAuth(req, res);
    const flashcardsData = await generateFlashcards(document.extractedText, count || 10);
    res.json({ flashcards: flashcardsData });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate quiz from a document
// @route   POST /api/ai/:documentId/quiz
// @access  Private
const createQuiz = async (req, res, next) => {
  try {
    const { numQuestions } = req.body;
    const document = await getDocAndCheckAuth(req, res);
    const quizData = await generateQuiz(document.extractedText, numQuestions || 5);
    res.json({ quiz: quizData });
  } catch (error) {
    next(error);
  }
};

// @desc    Chat with a document
// @route   POST /api/ai/:documentId/chat
// @access  Private
const chatWithDocument = async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query) {
      res.status(400);
      throw new Error('Chat query is required');
    }

    const document = await getDocAndCheckAuth(req, res);

    // Fetch existing chat history from DB
    let chatSession = await ChatHistory.findOne({ user: req.user._id, document: document._id });
    if (!chatSession) {
      chatSession = new ChatHistory({
        user: req.user._id,
        document: document._id,
        messages: []
      });
    }

    // Process with Gemini
    const aiResponseText = await processDocumentChat(chatSession.messages, query, document.extractedText);

    // Update history
    chatSession.messages.push({ role: 'user', text: query });
    chatSession.messages.push({ role: 'model', text: aiResponseText });
    await chatSession.save();

    res.json({ response: aiResponseText, messages: chatSession.messages });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  summarizeDocument,
  explainDocumentConcept,
  createFlashcards,
  createQuiz,
  chatWithDocument
};
