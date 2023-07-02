const mongoose = require("mongoose");
const moment = require("moment");
const userSchema = require("./user.schema");
const tweetSchema = require("./tweet.schema");
const commentSchema = require("./comment.schema");

const User = mongoose.model("User", userSchema);
const Tweet = mongoose.model("Tweet", tweetSchema);
const Comment = mongoose.model("Comment", commentSchema);

module.exports = { User, Tweet, Comment };
