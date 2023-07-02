const { isEmpty, trim } = require("../libs/checkLib");
const { User } = require("../models");
const jwt = require("jsonwebtoken");
async function checkUser(req, res, next) {
  try {
    let token = trim(
      req?.headers["authorization"] || req.headers["x-access-token"]
    );
    if (isEmpty(token)) {
      return res.json({
        status: "error",
        error: "Invalid login",
      });
    }
    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decoded) {
      return res.json({
        status: "error",
        error: "Invalid login",
      });
    }
    const username = decoded.username;
    const user = await User.findOne({ username: username });

    if (!user) {
      return res.json({
        status: "error",
        error: "Invalid login",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.json({
      status: "error",
      error: "Invalid login",
    });
  }
}
module.exports = checkUser;
