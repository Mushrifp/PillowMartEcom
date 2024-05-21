const mongoose = require('mongoose');

const otp = new mongoose.Schema({
     otp:{
        type:Number,
        required:true
     },
     email:{
        type:String,
        required:true
     },
     createdAt: {
        type: Date,
        default: Date.now,
        required:true
    }
})

module.exports = mongoose.model("otp",otp)