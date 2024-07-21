const mongoose = require("mongoose");

const offer = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  startDate: {
    type: String,
    required: true,
  },
  endDate: {
    type: String,
    required: true,
  },
  offItem: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("offer", offer);
