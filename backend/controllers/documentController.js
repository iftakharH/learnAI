const Document = require('../models/Document');
const ChatHistory = require('../models/ChatHistory');
const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/Quiz');
const fs = require('fs');
const { PDFParse } = require('pdf-parse');

// @desc    Upload a new document & extract text
// @route   POST /api/documents/upload
// @access  Private
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a file');
    }

    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: dataBuffer });
    let data;

    try {
      data = await parser.getText();
    } finally {
      await parser.destroy();
    }

    const newDocument = await Document.create({
      user: req.user._id,
      originalFilename: req.file.originalname,
      storedFilepath: filePath,
      fileSize: req.file.size,
      extractedText: data.text,
    });

    res.status(201).json(newDocument);
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Get all documents for logged in user
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res, next) => {
  try {
    const documents = await Document.find({ user: req.user._id }).sort({ createdAt: -1 }).select('-extractedText');
    res.json(documents);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single document by ID
// @route   GET /api/documents/:id
// @access  Private
const getDocumentById = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document || document.user.toString() !== req.user._id.toString()) {
      res.status(404);
      throw new Error('Document not found or unauthorized');
    }

    res.json(document);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete document
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res, next) => {
  try {
    const document = await Document.findById(req.params.id);

    if (!document || document.user.toString() !== req.user._id.toString()) {
      res.status(404);
      throw new Error('Document not found or unauthorized');
    }

    // Delete file from filesystem
    if (fs.existsSync(document.storedFilepath)) {
      fs.unlinkSync(document.storedFilepath);
    }

    await Promise.all([
      ChatHistory.deleteMany({ document: document._id, user: req.user._id }),
      Flashcard.deleteMany({ document: document._id, user: req.user._id }),
      Quiz.deleteMany({ document: document._id, user: req.user._id }),
    ]);

    await document.deleteOne();
    res.json({ message: 'Document removed' });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadDocument, getDocuments, getDocumentById, deleteDocument };
