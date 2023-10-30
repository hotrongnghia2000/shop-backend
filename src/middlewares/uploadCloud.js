const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  allowedFormats: ['jpg', 'png'],
  // cloudinary's api will be used in object params
  params: {
    folder: 'shop',
  },
});

// additional multer can be configured here
// cloudinary does not have a file limit api
// limit via multer will speed up execution
module.exports = multer({
  storage,
  // limits: { fileSize: 100 * 1024 }
});
