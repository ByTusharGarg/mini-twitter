const mongoose = require("mongoose");
const moment = require("moment");
const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    postedCommentTime: {
      type: String,
      default: moment().format("MMMM Do YYYY, h:mm:ss a"),
    },
    likes: {
      type: Array,
    },
    likeCommentBtn: {
      type: String,
      default: "black",
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
module.exports = commentSchema;
