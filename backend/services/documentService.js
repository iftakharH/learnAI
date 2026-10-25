'use strict';

const mongoose = require('mongoose');
const Document = require('../models/Document');
const { ApiError } = require('../utils/ApiError');

/**
 * Load a document only if it belongs to the given user.
 * Filtering by user (instead of comparing after the fetch) avoids leaking
 * whether another user's document exists.
 */
const getOwnedDocument = async (documentId, userId, { includeText = true } = {}) => {
  if (!mongoose.isValidObjectId(documentId)) {
    throw ApiError.badRequest('Invalid document id');
  }

  const query = Document.findOne({ _id: documentId, user: userId });
  if (!includeText) query.select('-extractedText');

  const document = await query;
  if (!document) {
    throw ApiError.notFound('Document not found');
  }

  return document;
};

/** Public projection: never send multi-megabyte extracted text by accident. */
const toDocumentResponse = (document, { includeText = false } = {}) => {
  const data = document.toObject ? document.toObject() : { ...document };
  if (!includeText) delete data.extractedText;
  return data;
};

module.exports = { getOwnedDocument, toDocumentResponse };
