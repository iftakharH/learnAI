'use strict';

const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    originalFilename: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    // Kept for records created before uploads moved to memory storage.
    storedFilepath: { type: String, default: '' },
    fileSize: { type: Number, required: true, min: 0 },
    extractedText: { type: String, required: true },
  },
  { timestamps: true },
);

documentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Document', documentSchema);
