'use strict';

const express = require('express');
const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument,
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSinglePdf } = require('../middleware/uploadMiddleware');

const router = express.Router();

router.post('/upload', protect, uploadSinglePdf('document'), uploadDocument);
router.get('/', protect, getDocuments);
router.get('/:id', protect, getDocumentById);
router.delete('/:id', protect, deleteDocument);

module.exports = router;
