const { check } = require('express-validator');

exports.add = () => {
  return [check('name', 'name is required').exists()];
};
