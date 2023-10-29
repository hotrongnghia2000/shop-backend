const express = require('express');
const router = express.Router();
//
const mws = require('../middlewares');
const vlds = require('../validators/brand');

const ctrls = require('../controllers/brand');

router.post('/add', mws.validate(vlds.add), ctrls.add);
router.patch('/update/:id', ctrls.update);
router.delete('/delete/:id', ctrls.delete);
router.delete('/deleteChecks', ctrls.deleteChecks);
router.get('/getAll', ctrls.getAll);
router.get('/getOne/:id', ctrls.getOne);

module.exports = router;
