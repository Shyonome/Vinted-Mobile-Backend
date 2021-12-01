const mongoose = require("mongoose");

const User = mongoose.model("User", {
    email : {
        unique: true,
        required: true,
        type: String,
    },
    account: {
        username: {
            required: true,
            type: String,
        },
        phone: Number,
        avatar: Object,
    },
    token: String,
    hash: String,
    salt: String,
  });
  
  module.exports = User;