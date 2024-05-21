const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Address = new mongoose.Schema({  
    UserID:{
        type:ObjectId,
        required:true
    }, 
    userAddress:[{
        type:[],
        required:true
    }]

})
  
module.exports = mongoose.model("Address",Address)