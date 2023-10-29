const { body, query } = require('express-validator');

exports.add = () => {
  return [
    body('name', 'name is required').exists(),

    body('price', 'price is required').exists(),
    body('price', 'price is invalid').isInt({ gt: 1000, lt: 1000000000 }),

    // body('thumb', 'thumb is required').exists(),

    // body('images', 'images is required').exists(),
    // dấu * là đại diện cho tất cả phần tử trong mảng
    // body('images[*].url', 'url is required').exists(),
    // body('images[*].desc', 'desc is required').exists(),

    body('inventory', 'inventory is required').exists(),
    body('inventory', 'inventory is invalid').isInt({ gt: 0, lt: 1000 }),

    body('brand_id', 'brand_id is required').exists(),

    body('category_id', 'category_id is required').exists(),
  ];
};

exports.update = () => {
  return [
    body('price', 'price is invalid')
      .if(body('price').notEmpty())
      .isInt({ gt: 1000, lt: 1000000000 }),

    // body('images[*].url', 'url is required').exists(),
    // body('images[*].desc', 'desc is required').exists(),

    body('inventory', 'inventory is invalid')
      .if(body('inventory').notEmpty())
      .isInt({ gt: 0, lt: 1000 }),
  ];
};

exports.filter = () => {
  return [
    // query('page', 'page is required').exists()
  ];
};
