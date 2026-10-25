'use strict';

const multer = require('multer');
const { config } = require('../config/env');
const { ApiError } = require('../utils/ApiError');

const maxMegabytes = Math.round(config.uploadMaxBytes / (1024 * 1024));

/**
 * Files are parsed from memory.
 *
 * Render's filesystem is ephemeral, so writing the PDF to disk only creates a
 * dangling reference after the next deploy. The extracted text is what the
 * application actually needs, and it lives in MongoDB.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.uploadMaxBytes, files: 1 },
  fileFilter(req, file, cb) {
    const isPdfMime = file.mimetype === 'application/pdf' || file.mimetype === 'application/x-pdf';
    const isPdfName = /\.pdf$/i.test(file.originalname || '');

    if (!isPdfMime && !isPdfName) {
      cb(ApiError.badRequest('Only PDF files are supported'));
      return;
    }

    cb(null, true);
  },
});

const uploadSinglePdf = (fieldName = 'document') => (req, res, next) => {
  upload.single(fieldName)(req, res, (error) => {
    if (!error) return next();

    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(ApiError.payloadTooLarge(`PDF must be ${maxMegabytes} MB or smaller`));
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return next(
        ApiError.badRequest(`Unexpected file field "${error.field}". Use "${fieldName}".`),
      );
    }

    return next(error);
  });
};

module.exports = { uploadSinglePdf };
