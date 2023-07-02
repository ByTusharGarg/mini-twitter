const mongoose = require("mongoose");
const moment = require("moment");
const tweetSchema = new mongoose.Schema(
  {
    content: {
      type: String,
    },
    tag: {
      type: String,
    },
    image: {
      type: String,
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    postedTweetTime: {
      type: String,
      default: moment().format("MMMM Do YYYY, h:mm:ss a"),
    },
    likes: {
      type: Array,
    },
    likeTweetBtn: {
      type: String,
      default: "black",
    },
    retweetBtn: {
      type: String,
      default: "black",
    },
    retweetedByUser: {
      type: String,
    },
    isRetweeted: {
      type: Boolean,
      default: false,
    },
    retweets: {
      type: Array,
      default: [],
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  {
    timestamps: true,
  }
);
module.exports = tweetSchema;
