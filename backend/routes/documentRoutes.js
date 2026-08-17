const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  deleteDocument
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');

// Configure multer
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const safeName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDFs are allowed'), false);
    }
  }
});

const handleUpload = (req, res, next) => {
  upload.single('document')(req, res, (err) => {
    if (!err) {
      return next();
    }

    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400);
      return next(new Error('PDF must be 15MB or smaller'));
    }

    res.status(400);
    return next(err);
  });
};

router.route('/upload')
  .post(protect, handleUpload, uploadDocument);

router.route('/')
  .get(protect, getDocuments);

router.route('/:id')
  .get(protect, getDocumentById)
  .delete(protect, deleteDocument);

module.exports = router;
