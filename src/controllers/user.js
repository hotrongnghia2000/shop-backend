const Product = require('../models/product');
const jwt = require('jsonwebtoken');
const MyError = require('../class/HandleThrowErr');
const User = require('../models/user');
const utils = require('../utils');
// lấy thông tin đăng ký
exports.register = async (req, res) => {
  const { email } = req.body;

  // kiểm tra email có tồn tại trên hệ thống chưa ?
  const isExistUser = await User.findOne({ email });
  if (isExistUser) throw new MyError('email đã được sử dụng', 400);

  // gửi một mail đến email yêu cầu đăng ký
  // tạo một code 4 số
  const code = Math.floor(1000 + Math.random() * 9000);
  // cookie này có thời hạn là 60s
  // http-only đảm bảo chỉ có máy chủ mới được truy cập
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

// xác nhận email và hoàn thành đăng ký tài khoản
exports.finishRegistration = async (req, res) => {
  const cookieData = req.cookies.registrationData;
  if (!cookieData)
    throw new MyError(
      'cookie đã hết hạn hoặc server không có quyền truy cập',
      401
    );
  const { userCode } = req.body;
  // remove code ra khỏi object, chỉ lấy thông tin user
  const { code, ...userData } = cookieData;
  userData.password = utils.hashString(userData.password);
  // xác nhận mã của người dùng gửi lên server
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

// quên mật khẩu, lấy lại mật khẩu
exports.changePassword = async (req, res) => {
  const { email } = req.body;

  // kiểm tra email có tồn tại trên hệ thống chưa ?
  const isExistUser = await User.findOne({ email });
  if (!isExistUser) throw new MyError('email chưa được đăng ký trước đó', 400);

  // gửi một mail đến email yêu cầu đăng ký
  // tạo một code 4 số
  const code = Math.floor(1000 + Math.random() * 9000);
  // cookie này có thời hạn là 60s
  // http-only đảm bảo chỉ có máy chủ mới được truy cập
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

// xác nhận email và hoàn thành thay đổi mật khẩu
exports.finishChangePassword = async (req, res) => {
  const cookieData = req.cookies.finishChangePassword;
  if (!cookieData)
    throw new MyError(
      'cookie đã hết hạn hoặc server không có quyền truy cập',
      401
    );
  const { userCode } = req.body;
  // remove code ra khỏi object, chỉ lấy thông tin user
  const { code, ...userData } = cookieData;
  newPassword = utils.hashString(userData.password);
  // xác nhận mã của người dùng gửi lên server
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

// đăng nhập
// dùng AT và RT để thay thế cho session, cookie
// AT có thời hạn ngắn, tầm 5 phút (tùy), đại diện cho user đi lấy tài nguyên
// RT có thời gian dài hơn, tầm 7 ngày(tùy), đại diện cho phiên đăng nhập
// AT sau khi tạo sẽ được gửi về user, khi user gọi api phải gửi kèm AT
// RT sẽ được lưu ở DB
// theo đó, mỗi khi login, RT sẽ được update giá trị mới, đồng thời RT sẽ được lưu xuống cookie của user và tạo ra AT
// khi AT hết hạn, user phải gọi API yêu cầu refresh AT, điều kiện là RT ở DB phải matched với AT ở user
// khi RT hết hạn, user sẽ được đẩy về login để tiếp tục vòng lặp này
exports.login = async (req, res) => {
  const body = req.body;
  const user = await User.findOne({ email: body.email });
  // kiểm tra email
  if (!user) throw new Error('email này chưa được đăng ký', 400);
  // kiểm tra password
  if (user.password !== utils.hashString(body.password))
    throw new MyError('password không đúng', 400);

  // tạo RT, update DB và lưu vào cookie của user
  const refreshToken = jwt.sign({ _id: user._id }, process.env.JWT_KEY, {
    expiresIn: '120s',
  });
  await User.findByIdAndUpdate(user._id, { refreshToken }, { new: true });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 120 * 1000,
  });

  // tạo AT
  const accessToken = jwt.sign({ _id: user._id }, process.env.JWT_KEY, {
    expiresIn: '5s',
  });

  // loại bỏ password trước khi trả user data về client
  // phải dùng thêm _doc
  delete user._doc.password;
  delete user._doc.refreshToken;

  return res.status(200).json({
    status: 'SUCCESS',
    message: 'Đăng nhập thành công!',
    accessToken,
    data: user,
  });
};

// cấp lại access token
exports.refreshToken = async (req, res) => {
  const cookies = req.cookies;

  // giải mã token, token hết hạn là exception, nó sẽ dừng code và chuyển đến middleware kế
  jwt.verify(cookies.refreshToken, process.env.JWT_KEY, (err) => {
    if (err) {
      if (err.name === 'TokenExpiredError')
        throw new MyError('token đã hết hạn');
      else throw new MyError('token không hợp lệ');
    }
  });
  // kiểm tra refresh token có tồn tại trên db
  const user = await User.findOne({
    refreshToken: cookies.refreshToken,
  });
  if (!user) throw new MyError('refresh token không tồn tại trong DB', 401);

  // tạo AT mới
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
  // kiểm tra xem sản phẩm có trong cart hay chưa
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
