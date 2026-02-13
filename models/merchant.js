const mongoose = require('mongoose');

const merchantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Merchant name is required'],
    trim: true,
    unique: true
  },
  description: {
    type: String,
    trim: true
  },
  webLink: {
    type: String,
    trim: true,
    default: '',
    validate: {
      validator: function(v) {
        if (!v) return true;
        try {
          new URL(v);
          return true;
        } catch (e) {
          return false;
        }
      },
      message: 'Please provide a valid URL'
    }
  },
  logo: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['Restaurant', 'Grocery', 'Retail', 'Service', 'Entertainment', 'Transportation', 'Other'],
    default: 'Other'
  },
  created_at: {
    type: Number
  }
}, {
  timestamps: true
});

const Merchant = mongoose.model('Merchant', merchantSchema);

module.exports = Merchant;
