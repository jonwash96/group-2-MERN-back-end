//* MNT
const mongoose = require('mongoose');
const { webLinkSchema } = require('./WebLink');

const userSchema = new mongoose.Schema({
    created_at:{type:Number, required:true},
    username:{type:String, required:true},
    displayName:{type:String, required:false},
    photo:webLinkSchema,
    password:{
        type:String,
        required:true,
        select:false
    },
    activity:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Activity',
        required:false,
        default:[]
    }],
    notifications:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Notification',
        required:false,
        default:[]
    }],
    expenses:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Expense',
        required:false,
        default:[]
    }],
    receipts:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'WebLink',
        required:false,
        default:[]
    }],
    budgets:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Budget',
        required:false,
        default:[]
    }]
}, {timestamps: true});

//* MID
userSchema.pre('validate', function() {
    if (this.isNew) this.created_at = Date.now();
    console.log("@UserSchema. New User Created:", this)
});

//* MODEL
const User = mongoose.model('User', userSchema);

//* IO
module.exports = User;
