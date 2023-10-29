const { check } = require('express-validator');

exports.register = () => {
  return [
    // email
    check('email', 'email is required').exists(),
    check('email', 'email is invalid').isEmail(),

    // password
    check('password', 'password is required').exists(),
    check('password', 'password is invalid')
      .isLength({ min: 6 })
      .matches('(?=.*[A-Za-z])(?=.*[0-9])(?=.*[!@#$%^&+=])'),

    // address
    check('address', 'address is required').exists(),
  ];
};
exports.login = () => {
  return [
    // email
    check('email', 'email is required').exists(),
    check('email', 'email is invalid').isEmail(),

    // password
    check('password', 'password is required').exists(),
    check('password', 'password is invalid')
      .isLength({ min: 6 })
      .matches('(?=.*[A-Za-z])(?=.*[0-9])(?=.*[!@#$%^&+=])'),
  ];
};
exports.changePassword = () => {
  return [
    // email
    check('email', 'email is required').exists(),
    check('email', 'email is invalid').isEmail(),

    // password
    check('password', 'password is required').exists(),
    check('password', 'password is invalid')
      .isLength({ min: 6 })
      .matches('(?=.*[A-Za-z])(?=.*[0-9])(?=.*[!@#$%^&+=])'),
  ];
};
exports.finishRegistration = () => {
  return [
    // code
    check('userCode', 'code is required').exists(),
  ];
};
exports.finishChangePassword = () => {
  return [
    // code
    check('userCode', 'code is required').exists(),
  ];
};
