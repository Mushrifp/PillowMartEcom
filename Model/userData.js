const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({   
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },  
    password:{
        type:String,
        required:true
    },
    isVerified:{
        type:Boolean,
        default: false,
        required:true
    },
    isAdminBlocked:{
        type:Boolean,
        default: false,
        required:true
    },

})
  
module.exports = mongoose.model("user",userSchema)