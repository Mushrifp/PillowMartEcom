const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');

const wish = new mongoose.Schema({
   user:{
      type:ObjectId,
      required:true
   },
    product:[{
        type: ObjectId,
        required: true
    }]
});

module.exports = mongoose.model("wish", wish);