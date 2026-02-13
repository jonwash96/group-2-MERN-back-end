const mongoose = require('mongoose');
const { webLinkSchema } = require('./WebLink');

const notificationSchema = new mongoose.Schema({
    created_at:{type:Number, required:false},
    title:{type:String, required:true},
    description:{type:String, required:false},
    priority:{type:Number, required:false, default: 3},
    created_at:{type:Number, required:true},
    action:{type:String, required:false},
    status:{
        type:String, 
        enum: ['unread', 'read', 'pinned', 'archived'],
        required:true, 
        default:'unread'
    },
    activityId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Activity',
        required:false,
    }
}, {timestamps: true});
notificationSchema.pre('validate', function() {
    if (this.isNew) this.created_at = Date.now();
});
const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
