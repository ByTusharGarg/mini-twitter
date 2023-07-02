const cloudinary = require("cloudinary").v2;
const crypto = require("crypto");
cloudinary.config({
  cloud_name: "dkrkbrrqv",
  api_key: "524344592356716",
  api_secret: "Jxb1TYueV0-qdEOgnrDMelfp5GQ",
});

const randomImageName = (byte = 32) => {
  return crypto.randomBytes(byte).toString("hex");
};

const uploadFile = async (req, res, next) => {
  try {
    let uploads = [];
    console.log(req.files);
    if (req?.files) {
      for (const key in req.files) {
        if (Object.hasOwnProperty.call(req.files, key)) {
          if (Array.isArray(req.files[key])) {
            //upload all the files in the array
            let files = [];
            req.files[key].forEach(async (file) => {
              let fn = randomImageName();
              let data = await cloudinary.uploader.upload(file.tempFilePath, {
                filename_override: fn,
                public_id: fn,
              });
              files.push(data.url);
            });
            req.body[key] = files;
            return;
          }
          let fn = randomImageName();
          let data = await cloudinary.uploader.upload(
            req.files[key].tempFilePath,
            {
              filename_override: fn,
              public_id: fn,
            }
          );
          console.log(data);
          req.body[key] = data.url;
        }
      }
    }
    await Promise.all(uploads);
    next();
  } catch (error) {
    console.log(error);
    return res.json({
      status: "error",
      error: "Invalid login",
    });
  }
};
module.exports = uploadFile;
