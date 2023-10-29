const express = require('express');
const router = express.Router();
//
const vlds = require('../validators/user');
const mws = require('../middlewares');

const ctrls = require('../controllers/user');

router.post('/register', mws.validate(vlds.register), ctrls.register);
router.post(
  '/finishRegistration',
  mws.validate(vlds.finishRegistration),
  ctrls.finishRegistration
);
router.post(
  '/changePassword',
  mws.validate(vlds.changePassword),
  ctrls.changePassword
);
router.post(
  '/finishChangePassword',
  mws.validate(vlds.finishChangePassword),
  ctrls.finishChangePassword
);
router.post('/login', mws.validate(vlds.login), ctrls.login);
router.get('/refreshToken', ctrls.refreshToken);
router.get('/getCurrent', mws.verifyToken, ctrls.getCurrent);
router.post('/order', mws.verifyToken, ctrls.order);
router.patch('/updateCart', mws.verifyToken, ctrls.updateCart);
router.patch('/delCart', mws.verifyToken, ctrls.delCart);

module.exports = router;
