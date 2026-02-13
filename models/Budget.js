const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Budget name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    category: {
        type: String,
        required: [true, 'Budget category is required'],
        enum: [
            'Housing',
            'Food',
            'Transport',
            'Transportation',
            'Utilities',
            'Entertainment',
            'Healthcare',
            'Health',
            'Shopping',
            'Education',
            'Personal',
            'Other',
        ],
        default: 'Other'
    },
    monthlyLimit: {
        type: Number,
        required: [true, 'Monthly limit is required'],
        min: [0, 'Monthly limit must be positive']
    },
    ownerID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Owner ID is required']
    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

budgetSchema.pre('save', function() {
    this.updated_at = Date.now();
});

budgetSchema.index({ ownerID: 1, created_at: -1 });
budgetSchema.index({ ownerID: 1, category: 1 });

budgetSchema.virtual('remainingBudget').get(function() {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(this.monthlyLimit);
});

budgetSchema.methods.getRemainingBudget = function(spent) {
    const percentage = (spent / this.monthlyLimit) * 100;

    if (percentage >= 100) return 'exceeded';
  if (percentage >= 90) return 'critical';
  if (percentage >= 75) return 'warning %75 of the budget used';
  return 'safe FOR NOW';
};

budgetSchema.methods.getRemaining = function(spent) {
  return Math.max(0, this.monthlyLimit - spent);
};

budgetSchema.methods.getUsagePercentage = function(spent) {
  return Math.min((spent / this.monthlyLimit) * 100, 100);
};

budgetSchema.statics.getUserBudgets = function(userId) {
  return this.find({ ownerID: userId }).sort({ category: 1 });
};

module.exports = mongoose.model('Budget', budgetSchema); 
