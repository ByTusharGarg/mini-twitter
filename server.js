const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const authRoutes = require("./routes/authRoutes");
const indexRoutes = require("./routes/indexRoutes");
const fileUpload = require("express-fileupload");
require("dotenv").config();
app.use(cors());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());
app.use(express.static("Twitter-Frontend/build"));
app.use("/api/images", express.static("images"));
app.use(
  fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // 500 MB
    useTempFiles: true, // flag for use temporary directory for handling file coming through api requests
    tempFileDir: "/tmp/", // temporary directory for handling file coming through api requests
    abortOnLimit: false, // abort api request if the incoming file size is larger then the specified size
    createParentPath: true,
  })
);
mongoose.connect(process.env.MONGO_URI, (err) => {
  if (err) console.log(err);
  else console.log("mongdb is connected");
});

app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});
app.use("/api/auth", authRoutes);
app.use("/api", indexRoutes);

app.listen("5000", () => {
  console.log("server running on port 5000");
});
