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
  // các api của cloudinary sẽ được dùng trong object params
  params: {
    folder: 'shop',
  },
});

// có thể cấu hình thêm cho multer tại đây
// cloudinary không có api giới hạn file
// giới hạn qua multer sẽ tăng tốc độ thực thi
module.exports = multer({
  storage,
  // limits: { fileSize: 100 * 1024 }
});
