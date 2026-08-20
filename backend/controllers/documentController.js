const Document = require('../models/Document');
const ChatHistory = require('../models/ChatHistory');
const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/Quiz');
const fs = require('fs');
const pdfParse = require('pdf-parse');

// @desc    Upload a new document & extract text
// @route   POST /api/documents/upload
// @access  Private
const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a file');
    }

    // 1. Resolve buffer safely from memory storage or disk path
    let dataBuffer;
    if (req.file.buffer) {
      dataBuffer = req.file.buffer;
    } else if (req.file.path && fs.existsSync(req.file.path)) {
      dataBuffer = fs.readFileSync(req.file.path);
    } else {
      res.status(400);
      throw new Error('Could not read uploaded file buffer');
    }

    // 2. Parse PDF buffer
    let extractedText = '';
    try {
      const parsed = await pdfParse(dataBuffer);
      extractedText = parsed && parsed.text ? parsed.text.trim() : '';
    } catch (parseErr) {
      console.error('[PDF Parse Error]:', parseErr.message);
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        message: 'Failed to parse PDF. Ensure the file is a valid, non-corrupted PDF.',
      });
    }

    // 3. Check for readable text
    if (!extractedText || extractedText.length < 10) {
      if (req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        message: 'No readable text found in PDF. Scanned or image-only PDFs are not supported.',
      });
    }

    // 4. Save record
    const newDocument = await Document.create({
      user: req.user._id,
      originalFilename: req.file.originalname,
      storedFilepath: req.file.path || '',
      fileSize: req.file.size,
      extractedText: extractedText,
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
    const documents = await Document.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('-extractedText');
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

    if (document.storedFilepath && fs.existsSync(document.storedFilepath)) {
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