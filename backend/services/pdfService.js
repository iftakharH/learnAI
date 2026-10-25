'use strict';

const { PDFParse } = require('pdf-parse');
const { ApiError } = require('../utils/ApiError');
const logger = require('../utils/logger');

const MIN_TEXT_LENGTH = 10;
// MongoDB documents are capped at 16 MB; keep well below that.
const MAX_STORED_CHARS = 2_000_000;

/**
 * Extract selectable text from a PDF held in memory.
 *
 * Throws a 422 when the file cannot be parsed or contains no real text, because
 * both cases are the user's file rather than a server fault.
 */
const extractPdfText = async (buffer) => {
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw ApiError.badRequest('The uploaded file is empty');
  }

  const parser = new PDFParse({ data: buffer, verbosity: 0 });

  try {
    const result = await parser.getText();
    let text = (result?.text || '').replace(/\u0000/g, '').trim();

    if (text.length < MIN_TEXT_LENGTH) {
      throw ApiError.unprocessable(
        'This PDF has no selectable text. Scanned or image-only files are not supported.',
      );
    }

    if (text.length > MAX_STORED_CHARS) {
      logger.warn(`PDF text truncated from ${text.length} to ${MAX_STORED_CHARS} characters`);
      text = text.slice(0, MAX_STORED_CHARS);
    }

    return text;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    logger.warn(`PDF parsing failed: ${error.message}`);
    throw ApiError.unprocessable(
      'Could not read this PDF. Make sure the file is valid, not corrupted, and not password protected.',
    );
  } finally {
    await parser.destroy().catch(() => {});
  }
};

module.exports = { extractPdfText };
