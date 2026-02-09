//* MNT
const mongoose = require('mongoose');

const webLinkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Link title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  url: {
    type: String,
    required: [true, 'URL is required'],
    trim: true,
    validate: {
      validator: function(v) {
        try {
          const urlObj = new URL(v);
          return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch (e) {
          return false;
        }
      },
      message: 'Invalid HTTP or HTTPS URL'
    }
  },
  domain: {
    type: String,
    trim: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});