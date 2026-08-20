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

    const filePath = req.file.path;
    const dataBuffer = fs.readFileSync(filePath);

    // pdf-parse v2.x: default export is a function returning { text }
    let extractedText = '';
    try {
      const parsed = await pdfParse(dataBuffer);
      extractedText = (parsed && parsed.text) || '';
    } catch (parseErr) {
      console.error('[PDF Parse] parse error:', parseErr.message);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({ message: 'Failed to parse PDF. Ensure the file is a valid, non-corrupted PDF.' });
    }

    console.log(`[PDF Parse] Extracted ${extractedText.length} characters from: ${req.file.originalname}`);

    if (!extractedText || extractedText.trim().length < 10) {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({ message: 'No readable text found in the PDF. This usually means the file is a scanned image rather than a text-based PDF.' });
    }

    const newDocument = await Document.create({
      user: req.user._id,
      originalFilename: req.file.originalname,
      storedFilepath: filePath,
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
