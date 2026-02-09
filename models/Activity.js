//* MNT
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  action: {
    type: String,
    required: [true, 'Action is required'],
    enum: [
      'expense_created',
      'expense_updated',
      'expense_deleted',
      'budget_created',
      'budget_updated',
      'budget_deleted',
      'budget_exceeded',
      'budget_alert',
      'user_login',
      'user_logout',
      'profile_updated',
      'merchant_created',
      'recurring_expense_created',
      'recurring_expense_updated',
      'recurring_expense_deleted'
    ]
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  resourceType: {
    type: String,
    enum: ['Expense', 'Budget', 'User', 'Merchant', 'RecurringExpense', null],
    default: null
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  importance: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  }
}, {
  timestamps: true
});

activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ user: 1, action: 1 });
activitySchema.index({ resourceType: 1, resourceId: 1 });

activitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); 

activitySchema.statics.log = async function(activityData) {
  try {
    return await this.create(activityData);
  } catch (error) {
    console.error('Failed to log activity:', error);
    return null;
  }
};

activitySchema.statics.getRecentActivities = async function(userId, limit = 20) {
  return await this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('resourceId');
};

activitySchema.statics.getActivitySummary = async function(userId, startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        user: mongoose.Types.ObjectId(userId),
        createdAt: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$action',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

module.exports = mongoose.model('Activity', activitySchema);
