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
    trim: true
  },
  category: {
    type: String,
    enum: ['website', 'photo'],
    required: false,
    default: 'website'
  },
  domain: {
    type: String,
    trim: true
  },
  created_at: {
    type: Number,
    required: false
  }
}, {
  timestamps: true
});

webLinkSchema.pre('validate', function() {
  if (this.isNew) this.created_at = Date.now();
  this.isNew && console.log("@WebLink. New Link Created:", this)
});

const WebLink = mongoose.model('WebLink', webLinkSchema);

module.exports = { WebLink, webLinkSchema };