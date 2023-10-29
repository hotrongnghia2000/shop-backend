// sẽ có nhiều router khác nhau như user, product, category,.. ==> mỗi router sẽ cho vào 1 file
// thay vì mỗi file tạo một function nhận tham số là app, ta sẽ dùng express.Router()
// express.Router() là một middleware
const user = require('./user');
const category = require('./category');
const brand = require('./brand');
const product = require('./product');

const initRouters = (app) => {
  // routes
  // mọi router bắt đầu bằng 'api/v1/user' sẽ chạy qua middleware user
  app.use('/api/user', user);
  app.use('/api/brand', brand);
  app.use('/api/category', category);
  app.use('/api/product', product);
};

module.exports = initRouters;
