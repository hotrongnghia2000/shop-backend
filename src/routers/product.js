const express = require('express');
//
const router = express.Router();
const vlds = require('../validators/product');
const mws = require('../middlewares');
const ctrls = require('../controllers/product');

router.post(
  '/add',
  mws.uploadCloud.fields([
    { name: 'thumb', maxCount: 1 },
    { name: 'images', maxCount: 10 },
  ]),
  mws.validate(vlds.add),
  ctrls.add
);
router.patch(
  '/update/:id',
  mws.validate(vlds.update),
  // upload 1 field per file, use single, can use array and limit upload to 1 file
  // When uploading a field with multiple files, use array
  // When uploading multiple fields, use fields
  mws.uploadCloud.fields([
    { name: 'thumb', maxCount: 1 },
    { name: 'images', maxCount: 10 },
  ]),
  ctrls.update
);
router.get('/filter', mws.validate(vlds.filter), ctrls.filter);
router.get('/getAll', ctrls.getAll);
router.patch('/rate/:id', mws.verifyToken, ctrls.rate);
router.patch('/comment/:id', mws.verifyToken, ctrls.comment);
router.patch('/repComment/:id/:parent_id', mws.verifyToken, ctrls.repComment);
router.delete('/deleteChecks', ctrls.deleteChecks);
router.delete('/delete/:id', ctrls.delete);
router.get('/getOne/:id', ctrls.getOne);
router.get('/filter', ctrls.filter);

module.exports = router;
