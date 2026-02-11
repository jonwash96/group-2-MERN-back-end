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
        if (!v) return true; // Allow empty string 
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

//* MID
merchantSchema.pre('validate', function() {
  if (this.isNew) this.created_at = Date.now();
  console.log("@MerchantSchema. New Merchant Created:", this)
});
/*
// Index for faster queries
merchantSchema.index({ name: 1 });
merchantSchema.index({ category: 1 });

// Virtual for getting merchant initial
merchantSchema.virtual('initial').get(function() {
  return this.name.charAt(0).toUpperCase();
});

// Static method to find or create merchant
merchantSchema.statics.findOrCreate = async function(merchantName) {
  let merchant = await this.findOne({ name: merchantName });
  
  if (!merchant) {
    merchant = await this.create({ name: merchantName });
  }
  
  return merchant;
};

// Static method to get popular merchants
merchantSchema.statics.getPopular = function(limit = 10) {
  return this.aggregate([
    {
      $lookup: {
        from: 'expenses',
        localField: '_id',
        foreignField: 'merchantRef',
        as: 'expenses'
      }
    },
    {
      $addFields: {
        expenseCount: { $size: '$expenses' }
      }
    },
    {
      $sort: { expenseCount: -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        name: 1,
        description: 1,
        webLink: 1,
        logo: 1,
        category: 1,
        expenseCount: 1
      }
    }
  ]);
};
*/
const Merchant = mongoose.model('Merchant', merchantSchema);

module.exports = Merchant;