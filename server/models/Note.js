const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      default: 'Untitled Note',
    },
    content: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      default: 'General',
    },
    color: {
      type: String,
      default: '#ffffff',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Note', noteSchema);