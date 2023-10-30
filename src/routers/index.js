// there will be many different routers such as user, product, category,.. ==> each router will put in 1 file
// instead of creating a function for each file that takes app as a parameter, we will use express.Router()
// express.Router() is a middleware
const user = require('./user');
const category = require('./category');
const brand = require('./brand');
const product = require('./product');

const initRouters = (app) => {
  // routes
  // any router starting with 'api/v1/user' will run through the user middleware
  app.use('/api/user', user);
  app.use('/api/brand', brand);
  app.use('/api/category', category);
  app.use('/api/product', product);
};

module.exports = initRouters;
