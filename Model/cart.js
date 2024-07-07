const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const cart = new mongoose.Schema({
   user:{
      type:ObjectId,
      required:true
   },
    product:{
      type:[],
      required:true
    }
});

module.exports = mongoose.model("cart", cart);  