'use strict';

const path = require('path');
const fs = require('fs');
const Document = require('../models/Document');
const ChatHistory = require('../models/ChatHistory');
const Flashcard = require('../models/Flashcard');
const Quiz = require('../models/Quiz');
const { extractPdfText } = require('../services/pdfService');
const { getOwnedDocument, toDocumentResponse } = require('../services/documentService');
const { ApiError } = require('../utils/ApiError');
const logger = require('../utils/logger');

const MAX_FILENAME_LENGTH = 255;

const safeFilename = (originalName) =>
  path
    .basename(String(originalName || 'document.pdf'))
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, MAX_FILENAME_LENGTH);

// @desc    Upload a PDF and store its extracted text
// @route   POST /api/documents/upload
// @access  Private
const uploadDocument = async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('Please attach a PDF using the "document" field');
  }

  const extractedText = await extractPdfText(req.file.buffer);

  const document = await Document.create({
    user: req.user._id,
    originalFilename: safeFilename(req.file.originalname),
    fileSize: req.file.size,
    extractedText,
  });

  logger.info(
    `Document ${document._id} uploaded by ${req.user._id} (${req.file.size} bytes, ${extractedText.length} chars)`,
  );

  res.status(201).json(toDocumentResponse(document));
};

// @desc    List the signed-in user's documents
// @route   GET /api/documents
// @access  Private
const getDocuments = async (req, res) => {
  const documents = await Document.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select('-extractedText');

  res.json(documents.map((document) => toDocumentResponse(document)));
};

// @desc    Get one document including its extracted text
// @route   GET /api/documents/:id
// @access  Private
const getDocumentById = async (req, res) => {
  const document = await getOwnedDocument(req.params.id, req.user._id);
  res.json(toDocumentResponse(document, { includeText: true }));
};

// @desc    Delete a document and everything generated from it
// @route   DELETE /api/documents/:id
// @access  Private
const deleteDocument = async (req, res) => {
  const document = await getOwnedDocument(req.params.id, req.user._id);

  // Legacy records created before uploads moved to memory storage.
  if (document.storedFilepath) {
    fs.rm(document.storedFilepath, { force: true }, (error) => {
      if (error) logger.warn(`Could not delete legacy upload ${document.storedFilepath}: ${error.message}`);
    });
  }

  await Promise.all([
    ChatHistory.deleteMany({ document: document._id, user: req.user._id }),
    Flashcard.deleteMany({ document: document._id, user: req.user._id }),
    Quiz.deleteMany({ document: document._id, user: req.user._id }),
  ]);

  await document.deleteOne();
  res.json({ message: 'Document removed' });
};

module.exports = { uploadDocument, getDocuments, getDocumentById, deleteDocument };
