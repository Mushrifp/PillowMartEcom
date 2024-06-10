const mongoose = require("mongoose");

const wallet = new mongoose.Schema({
    user:{
       type:String,
       required:true
    },
    amount:{
        type:Number,
        required:true
    },
    history:{
        type: Array,
        default: []
    }
 });
 
 module.exports = mongoose.model("wallet", wallet); 