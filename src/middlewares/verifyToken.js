const MyError = require('../class/HandleThrowErr');
const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  const auth = req.headers?.authorization;
  if (!auth || !auth.startsWith('Bearer'))
    throw new MyError('authorization không có hoặc không hợp lệ!');
  const accessToken = auth.split(' ')[1];
  // verify token
  jwt.verify(accessToken, process.env.JWT_KEY, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError')
        throw new MyError('token đã hết hạn');
      else throw new MyError('token không hợp lệ');
    }
    // nếu token hợp lệ, gắn decoded vào req và chuyển đến mdw kết tiếp
    req.user = decoded;
    next();
  });
};
