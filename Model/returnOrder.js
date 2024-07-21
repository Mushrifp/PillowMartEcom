const mongoose = require("mongoose");

const returnOrder = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  orderId: {
    type: String,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("returnOrder", returnOrder);
