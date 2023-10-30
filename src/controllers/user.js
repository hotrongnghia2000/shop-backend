const Product = require('../models/product');
const jwt = require('jsonwebtoken');
const MyError = require('../class/HandleThrowErr');
const User = require('../models/user');
const utils = require('../utils');

// get registration information
exports.register = async (req, res) => {
  const { email } = req.body;

  // check if email exists on the system?
  const isExistUser = await User.findOne({ email });
  if (isExistUser) throw new MyError('email đã được sử dụng', 400);

  // send an email to the registration request email
  // create a 4-digit code
  const code = Math.floor(1000 + Math.random() * 9000);
  // This cookie has a duration of 60 seconds
  // http-only ensures only the server is accessed
  const cookieData = { ...req.body, code };
  await res.cookie('registrationData', cookieData, {
    httpOnly: true,
    maxAge: 60 * 1000,
  });
  await utils.sendEmail({
    email,
    html: `<p style='font-size: 16px'>Bạn vui lòng nhập mã xác thực để hoàn tất việc xác thực tài khoản!<p/><br/><span style='font-size:16px'>Mã xác thực: <span/><h3 style='display:inline'>${code}<h3/><p>Mã xác thực sẽ hết hạn sau: <strong>60s<strong/><p/>`,
    subject: `Mã xác thực: ${code}`,
  });
  return res.status(200).json({
    status: 'SUCCESS',
    message:
      'Chúng tôi đã gửi một mã xác thực đến email của bạn, vui lòng dùng mã này để xác thực tài khoản, mã này có thời hạn là 60s',
  });
};

// confirm email and complete account registration
exports.finishRegistration = async (req, res) => {
  const cookieData = req.cookies.registrationData;
  if (!cookieData)
    throw new MyError(
      'cookie đã hết hạn hoặc server không có quyền truy cập',
      401
    );
  const { userCode } = req.body;
  // remove code from object, only get user information
  const { code, ...userData } = cookieData;
  userData.password = utils.hashString(userData.password);
  // confirm the user's code sent to the server
  if (cookieData.code !== +userCode)
    throw new MyError('mã xác thực không đúng, vui lòng check lại email', 400);
  else {
    const resDB = await User.create(userData);
    return res.status(200).json({
      status: 'SUCCESS',
      data: resDB,
    });
  }
};

// forgot password, reset password
exports.changePassword = async (req, res) => {
  const { email } = req.body;

  // check if email exists on the system?
  const isExistUser = await User.findOne({ email });
  if (!isExistUser) throw new MyError('email chưa được đăng ký trước đó', 400);

  // send an email to the registration request email
  // create a 4-digit code
  const code = Math.floor(1000 + Math.random() * 9000);
  // This cookie has a duration of 60 seconds
  // http-only ensures only the server is accessed
  const cookieData = { ...req.body, code };
  await res.cookie('finishChangePassword', cookieData, {
    httpOnly: true,
    maxAge: 60 * 1000,
  });
  await utils.sendEmail({
    email,
    html: `<p style='font-size: 16px'>Bạn vui lòng nhập mã xác thực để hoàn tất việc xác thực tài khoản!<p/><br/><span style='font-size:16px'>Mã xác thực: <span/><h3 style='display:inline'>${code}<h3/><p>Mã xác thực sẽ hết hạn sau: <strong>60s<strong/><p/>`,
    subject: `Mã xác thực: ${code}`,
  });
  return res.status(200).json({
    status: 'SUCCESS',
    message:
      'Chúng tôi đã gửi một mã xác thực đến email của bạn, vui lòng dùng mã này để xác thực tài khoản, mã này có thời hạn là 60s',
  });
};

// confirm email and complete password change
exports.finishChangePassword = async (req, res) => {
  const cookieData = req.cookies.finishChangePassword;
  if (!cookieData)
    throw new MyError(
      'cookie đã hết hạn hoặc server không có quyền truy cập',
      401
    );
  const { userCode } = req.body;
  // remove code from object, only get user information
  const { code, ...userData } = cookieData;
  newPassword = utils.hashString(userData.password);
  // confirm the user's code sent to the server
  if (cookieData.code !== +userCode)
    throw new MyError('mã xác thực không đúng, vui lòng check lại email', 400);
  else {
    const resDB = await User.findOneAndUpdate(
      { email: userData.email },
      { password: newPassword },
      { new: true }
    );
    return res.status(200).json({
      status: 'SUCCESS',
      data: resDB,
    });
  }
};

// log in
// Use AT and RT to replace sessions and cookies
// AT has a short duration, about 5 minutes (depending), representing the user to get resources
// RT has a longer time, about 7 days (depending), representing the login session
// After creating AT, it will be sent to the user. When the user calls the api, AT must be sent with it
// RT will be saved in DB
// Accordingly, every time you log in, RT will be updated with a new value, and RT will be saved in the user's cookie and create AT
// When AT expires, the user must call the API to request a refresh of AT, the condition is that the RT in the DB must match with the AT in the user
// When RT expires, the user will be pushed back to login to continue this loop
exports.login = async (req, res) => {
  const body = req.body;
  const user = await User.findOne({ email: body.email });
  // check email
  if (!user) throw new Error('email này chưa được đăng ký', 400);
  // check password
  if (user.password !== utils.hashString(body.password))
    throw new MyError('password không đúng', 400);

  // create RT, update DB and save to user's cookie
  const refreshToken = jwt.sign({ _id: user._id }, process.env.JWT_KEY, {
    expiresIn: '60s',
  });
  await User.findByIdAndUpdate(user._id, { refreshToken }, { new: true });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 60 * 1000,
  });

  // create AT
  const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_KEY, {
    expiresIn: '5s',
  });

  // remove password before returning user data to client
  // must use _doc
  delete user._doc.password;
  delete user._doc.refreshToken;

  return res.status(200).json({
    status: 'SUCCESS',
    message: 'Đăng nhập thành công!',
    accessToken,
    data: user,
  });
};

// re-issue access token
exports.refreshToken = async (req, res) => {
  const cookies = req.cookies;

  // decode the token, expired token is an exception, it will stop the code and move to the next middleware
  jwt.verify(cookies.refreshToken, process.env.JWT_KEY, (err) => {
    if (err) {
      if (err.name === 'TokenExpiredError')
        throw new MyError('token đã hết hạn');
      else throw new MyError('token không hợp lệ');
    }
  });
  // check if the refresh token exists on the database
  const user = await User.findOne({
    refreshToken: cookies.refreshToken,
  });
  if (!user) throw new MyError('refresh token không tồn tại trong DB', 401);

  // create new AT
  const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_KEY, {
    expiresIn: '10s',
  });

  return res.status(200).json({
    status: 'SUCCESS',
    accessToken,
  });
};

exports.getCurrent = async (req, res) => {
  const user = await User.findById(req.user._id).populate('cart.product');
  res.status(200).json({
    status: 'SUCCESS',
    data: user,
  });
};

exports.delCart = async (req, res) => {
  const { _id } = req.user;
  const { id } = req.body;

  let resDB = null;
  if (id) {
    resDB = await User.findByIdAndUpdate(
      _id,
      { $pull: { cart: { product: id } } },
      { new: true }
    );
  } else {
    resDB = await User.findByIdAndUpdate(
      _id,
      { $set: { cart: [] } },
      { new: true }
    );
  }

  return res.status(200).json({
    status: 'SUCCESS',
    data: resDB,
  });
};

exports.updateCart = async (req, res) => {
  const { _id } = req.user;
  const { productId, quantity = 1 } = req.body;
  if (!productId) throw new MyError('missing inputs');

  const user = await User.findById(_id);
  // check if the product is in the cart or not
  const product = user.cart.find((el) => el.product.toString() === productId);
  if (!product) {
    const resDB = await User.findByIdAndUpdate(
      _id,
      {
        $push: { cart: { product: productId, quantity } },
      },
      { new: true }
    );
    return res.status(200).json({
      status: 'SUCCESS',
      data: resDB,
    });
  } else {
    const resDB = await User.updateOne(
      { cart: { $elemMatch: product } },
      { $set: { 'cart.$.quantity': quantity } },
      { new: true }
    );
    return res.status(200).json({
      success: 'SUCCESS',
      data: resDB,
    });
  }
};

exports.order = async (req, res) => {
  const body = req.body;
  const user_id = req.user._id;

  const user = await User.findById(user_id);
  console.log(user);
  let products = [];
  let totalPrice = 0;
  for (let index in body.products) {
    const product = await Product.findById(body.products[index]);
    products.push({ product, quantity: body.quantities[index] });
    totalPrice += product.price * body.quantities[index];
  }
  user.order.push({ products, total_price: totalPrice });
  await user.save();

  res.status(200).json({
    status: 'SUCCESS',
    data: user,
  });
};
