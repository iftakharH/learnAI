const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalFilename: { type: String, required: true },
  storedFilepath: { type: String, required: true },
  fileSize: { type: Number, required: true },
  extractedText: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
