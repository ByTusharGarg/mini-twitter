const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  avatar: {
    type: String,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  followers: {
    type: Array,
  },
  followBtn: {
    type: String,
    default: "Follow",
  },
  tweets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tweet" }],
});

module.exports = userSchema