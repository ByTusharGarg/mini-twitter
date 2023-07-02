const checkUser = require("../middlewares/authUser");
const { User, Tweet, Comment } = require("../models");
const indexRoutes = require("express").Router();
const moment = require("moment");
const jwt = require("jsonwebtoken");
const uploadFile = require("../middlewares/fileHandler");

indexRoutes.use(checkUser);
//feed
indexRoutes.get("/feed", async (req, res) => {
  const tweetsToSkip = req.query.t || 0;
  try {
    const { user } = req;
    const { username } = user;
    const docs = await Tweet.find({ isRetweeted: false })
      .populate("postedBy")
      .populate("comments")
      .sort({ createdAt: -1 })
      .skip(tweetsToSkip)
      .limit(20)
      .exec();

    //to know if a person has liked tweet
    docs.forEach((doc) => {
      if (!doc.likes.includes(username)) {
        doc.likeTweetBtn = "black";
        doc.save();
      } else {
        doc.likeTweetBtn = "deeppink";
        doc.save();
      }
    });

    //to know if a person has liked comment
    docs.forEach((doc) => {
      doc.comments.forEach((docComment) => {
        if (!docComment.likes.includes(username)) {
          docComment.likeCommentBtn = "black";
          docComment.save();
        } else {
          docComment.likeCommentBtn = "deeppink";
          docComment.save();
        }
      });
    });

    //to know if a person has retweeted the tweet
    docs.forEach((doc) => {
      if (!doc.retweets.includes(username)) {
        doc.retweetBtn = "black";
      } else {
        doc.retweetBtn = "green";
      }
    });

    return res.json({
      status: "ok",
      tweets: docs,
      activeUser: user,
    });
  } catch (error) {
    return res.json({ status: "error", error: "Session ended :(" });
  }
});

//populate comments of a particular tweet
indexRoutes.get("/feed/comments/:tweetId", (req, res) => {
  const { user } = req;
  const { username } = user;
  Tweet.find({ postedTweetTime: req.params.tweetId })
    .populate("postedBy")

    .populate({
      path: "comments",
      populate: [{ path: "postedBy" }],
    })
    .exec((err, tweet) => {
      if (!err) {
        return res.json({
          status: "ok",
          tweet: tweet,
        });
      } else return res.json({ status: "error", error: "comments not found" });
    });
});

//compose tweet
indexRoutes.post("/feed", uploadFile, async (req, res) => {
  try {
    const { user } = req;
    const { username } = user;
    const info = req.body;
    const tweetInfo = JSON.parse(req.body.tweet);

    let data = {
      content: tweetInfo.content,
      retweets: [],
      tag: tweetInfo.tag,
      postedTweetTime: moment().format("MMMM Do YYYY, h:mm:ss a"),
      postedBy: user._id,
    };

    if (info.image) {
      data.image = info.image;
    }

    let newTweet = await Tweet.create(data);
    user.tweets.unshift(newTweet._id);
    user.save();
    console.log(newTweet, user);
    return res.json({ image: info.image });
  } catch (error) {
    console.log(error);
    return res.json({ status: "error", error: "An error occured" });
  }
});

//compose comment
indexRoutes.post("/feed/comment/:tweetId", (req, res) => {
  const { user } = req;
  const { username } = user;
  Comment.create(
    {
      content: req.body.content,
      postedCommentTime: moment().format("MMMM Do YYYY, h:mm:ss a"),
    },
    (err, newComment) => {
      if (!err) {
        Tweet.findOne({ postedTweetTime: req.params.tweetId }, (err, doc) => {
          if (!err) {
            User.findOne(
              { username: req.body.postedBy.username },
              (err, user) => {
                if (!err) {
                  newComment.postedBy = user._id;
                  if (newComment.postedBy) {
                    newComment.save();
                    doc.comments.unshift(newComment._id);
                    doc.save();
                  } else
                    return res.json({
                      status: "error",
                      error: "An error occured",
                    });
                }
              }
            );

            return res.json({
              comments: doc.comments.length,
            });
          } else
            return res.json({ status: "error", error: "An error occured" });
        });
      }
    }
  );
});

//retweet
indexRoutes.route("/post/:userName/retweet/:tweetId").post((req, res) => {
  const { user } = req;
  const { username } = user;
  Tweet.findOne({ postedTweetTime: req.params.tweetId }, (err, doc) => {
    if (!err) {
      if (!doc.retweets.includes(req.params.userName)) {
        //create a new tweet
        newTweet = Tweet.create(
          {
            content: doc.content,
            postedBy: doc.postedBy,
            likes: doc.likes,
            likeTweetBtn: doc.likeTweetBtn,
            image: doc.image,
            postedTweetTime: doc.postedTweetTime,
            retweetedByUser: req.params.userName,
            isRetweeted: true,
            retweetBtn: "green",
            retweets: [req.params.userName],
          },
          (err, newTweet) => {
            if (!err) {
              User.findOne({ username: req.params.userName }, (err, doc) => {
                if (!err) {
                  doc.tweets.unshift(newTweet._id);
                  doc.save();
                } else console.log(err);
              });
            }
          }
        );

        //update the number of retweets
        doc.retweets.push(req.params.userName);

        doc.retweetBtn = "green";
        doc.save();
      } else {
        const user = req.params.user;
        Tweet.find({})
          .populate("postedBy")
          .deleteOne(
            {
              "postedBy.username": user,
              content: doc.content,
              isRetweeted: true,
            },
            (err, res) => {
              console.log(res);
            }
          );

        let indexForRetweets = doc.retweets.indexOf(req.params.userName);
        doc.retweets.splice(indexForRetweets, 1);
        doc.retweetBtn = "black";

        doc.save();
      }
    } else console.log(err);
  });
});

//like tweet
indexRoutes.route("/post/:userName/like/:tweetId").post((req, res) => {
  const { user } = req;
  const { username } = user;
  Tweet.find({ postedTweetTime: req.params.tweetId }, (err, docs) => {
    docs.forEach((doc) => {
      if (!err) {
        if (!doc.likes.includes(req.params.userName)) {
          doc.likes.push(req.params.userName);
          doc.likeTweetBtn = "deeppink";
          doc.save();
        } else {
          let indexForLikes = doc.likes.indexOf(req.params.userName);
          doc.likes.splice(indexForLikes, 1);
          doc.likeTweetBtn = "black";
          doc.save();
        }
      } else console.log(err);
    });
  });
});

//like comment
indexRoutes.route("/comment/:userName/like/:commentId").post((req, res) => {
  const { user } = req;
  const { username } = user;
  Comment.findOne({ postedCommentTime: req.params.commentId }, (err, doc) => {
    if (!err) {
      if (!doc.likes.includes(req.params.userName)) {
        doc.likes.push(req.params.userName);
        doc.likeCommentBtn = "deeppink";
        doc.save();
        return res.json({ btnColor: "deeppink", likes: doc.likes.length });
      } else {
        let indexForLikes = doc.likes.indexOf(req.params.userName);
        doc.likes.splice(indexForLikes, 1);
        doc.likeCommentBtn = "black";
        doc.save();
        return res.json({ btnColor: "black", likes: doc.likes.length });
      }
    } else console.log(err);
  });
});

//delete tweet
indexRoutes.route("/deleteTweet/:tweetId").post((req, res) => {
  const { user } = req;
  const { username } = user;
  Tweet.findOneAndDelete({ postedTweetTime: req.params.tweetId }, (err) => {
    if (!err) {
      return res.json({
        status: "ok",
      });
    } else console.log(err);
  });
});

//delete comment
indexRoutes.route("/deleteComment/:commentId").post((req, res) => {
  const { user } = req;
  const { username } = user;
  Comment.findOneAndDelete(
    { postedCommentTime: req.params.commentId },
    (err) => {
      if (!err) {
        return res.json({
          status: "ok",
        });
      } else console.log(err);
    }
  );
});

//edit tweet
indexRoutes.route("/editTweet/:tweetId").post((req, res) => {
  const { user } = req;
  const { username } = user;
  Tweet.findOne({ postedTweetTime: req.params.tweetId }, (err, doc) => {
    doc.content = req.body.content;
    doc.isEdited = true;
    doc.save();
    return res.json({
      status: "ok",
    });
  });
});

//edit comment
indexRoutes.route("/editComment/:commentId").post((req, res) => {
  const { user } = req;
  const { username } = user;
  Comment.findOne({ postedCommentTime: req.params.commentId }, (err, doc) => {
    doc.content = req.body.content;
    doc.isEdited = true;
    doc.save();
    return res.json({
      status: "ok",
    });
  });
});

indexRoutes.post("/avatar/:userName", (req, res) => {
  const { user } = req;
  const { username } = user;
  User.findOne({ username: req.params.userName }, (err, user) => {
    if (!err) {
      user.avatar = req.body.avatar;
      if (user.avatar) {
        user.save();
        return res.json({ status: "ok", avatar: req.body.avatar });
      }
    } else return res.json({ status: "error", error: "Please choose again" });
  });
});

//user profile
indexRoutes.get("/profile/:userName", async (req, res) => {
  try {
    const { user } = req;
    const { username } = user;
    User.findOne({ username: req.params.userName })
      .populate({
        path: "tweets",
        populate: [
          { path: "postedBy" },
          { path: "comments", populate: [{ path: "postedBy" }] },
        ],
      })

      .exec((err, doc) => {
        if (!err) {
          if (!doc.followers.includes(username)) {
            doc.followBtn = "Follow";
          } else doc.followBtn = "Following";

          doc.tweets.forEach((tweet) => {
            if (!tweet.likes.includes(username)) {
              tweet.likeTweetBtn = "black";
            } else tweet.likeTweetBtn = "deeppink";
          });

          doc.tweets.forEach((tweet) => {
            if (!tweet.retweets.includes(username)) {
              tweet.retweetBtn = "black";
            } else tweet.retweetBtn = "green";
          });

          return res.json({
            status: "ok",
            tweets: doc.tweets,
            followers: doc.followers.length,
            followBtn: doc.followBtn,
            activeUser: username,
            avatar: doc.avatar,
          });
        } else console.log(err);
      });
  } catch (error) {
    return res.json({ status: "error", error: "invalid token" });
  }
});

//follow
//userName= active user
//user= profile
indexRoutes.route("/user/:user/follow/:userName").post((req, res) => {
  User.findOne({ username: req.params.userName }, (err, doc) => {
    if (!err) {
      if (doc.username !== req.params.user) {
        if (!doc.followers.includes(req.params.user)) {
          doc.followers.push(req.params.user);
          doc.followBtn = "Following";
          doc.save();
        } else {
          let indexForUnFollow = doc.followers.indexOf(req.params.user);
          doc.followers.splice(indexForUnFollow, 1);
          doc.followBtn = "Follow";
          doc.save();
        }
        return res.json({
          followers: doc.followers.length,
          followBtn: doc.followBtn,
        });
      }
    }
  });
});

// search page
indexRoutes.get("/search/:user", (req, res) => {
  User.find(
    { username: { $regex: `${req.params.user}`, $options: "i" } },
    function (err, docs) {
      if (!err) {
        return res.json({ status: "ok", users: docs });
      } else return res.json({ status: "error", error: err });
    }
  );
});

indexRoutes.get("/topic/:tag", async (req, res) => {
  const tweetsToSkip = req.query.t || 0;

  try {
    const { user } = req;
    const { username } = user;
    Tweet.find({ isRetweeted: false, tag: req.params.tag })
      .populate("postedBy")
      .populate("comments")
      .sort({ createdAt: -1 })
      .skip(tweetsToSkip)
      .limit(20)
      .exec((err, docs) => {
        if (!err) {
          //to know if a person has liked tweet
          docs.forEach((doc) => {
            if (!doc.likes.includes(username)) {
              doc.likeTweetBtn = "black";
              doc.save();
            } else {
              doc.likeTweetBtn = "deeppink";
              doc.save();
            }
          });

          //to know if a person has liked comment
          docs.forEach((doc) => {
            doc.comments.forEach((docComment) => {
              if (!docComment.likes.includes(username)) {
                docComment.likeCommentBtn = "black";
                docComment.save();
              } else {
                docComment.likeCommentBtn = "deeppink";
                docComment.save();
              }
            });
          });

          //to know if a person has retweeted the tweet
          docs.forEach((doc) => {
            if (!doc.retweets.includes(username)) {
              doc.retweetBtn = "black";
            } else {
              doc.retweetBtn = "green";
            }
          });

          return res.json({
            status: "ok",
            tweets: docs,
            activeUser: user,
          });
        }
      });
  } catch (error) {
    return res.json({ status: "error", error: "Session ended :(" });
  }
});
module.exports = indexRoutes;
