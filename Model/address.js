const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const Address = new mongoose.Schema({  
    UserID:{
        type:ObjectId,
        required:true
    }, 
    userAddress:[{}]

})
  
module.exports = mongoose.model("Address",Address)