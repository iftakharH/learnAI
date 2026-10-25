'use strict';

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'model'], required: true },
    text: { type: String, required: true, maxlength: 20000 },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
);

const chatHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    document: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    messages: [messageSchema],
  },
  { timestamps: true },
);

// One conversation per user per document.
chatHistorySchema.index({ user: 1, document: 1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
