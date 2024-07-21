const mongoose = require("mongoose");

const category = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  offer: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("category", category);
