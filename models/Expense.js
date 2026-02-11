const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Housing', 'Food', 'Transport', 'Utilities', 'Entertainment', 'Other', 'Healthcare', 'Shopping', 'Education', 'Personal'],
    default: 'Other'
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringExpense: {
    type: Boolean,
    required:false,
    default: false
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Digital Wallet', 'Other'],
    default: 'Other'
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  receiptUrl: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }],
}, {
  timestamps: true
});

// Index for efficient queries
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });
expenseSchema.index({ user: 1, isDeleted: 1 });

// Virtual for month/year grouping
expenseSchema.virtual('monthYear').get(function() {
  const date = new Date(this.date);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
});

// Static method to get total spending for a user in a date range
expenseSchema.statics.getTotalSpending = async function(userId, startDate, endDate) {
  const result = await this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

expenseSchema.statics.getSpendingByCategory = async function(userId, startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);
};

expenseSchema.set('toJSON', { virtuals: true });
expenseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Expense', expenseSchema);