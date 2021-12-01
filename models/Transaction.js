const mongoose = require("mongoose");

const Transaction = mongoose.model("Transaction", {
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer",
  },
  annonce: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer",
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = Transaction;