const Brand = require('../models/brand');

exports.add = async (req, res) => {
  const body = req.body;

  const resDB = await Brand.create(body);
  return res.status(200).json({
    status: 'SUCCESS',
    data: resDB,
  });
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  const resDB = await Brand.findByIdAndUpdate(id, body, { new: true });
  return res.status(200).json({
    status: 'SUCCESS',
    data: resDB,
  });
};

exports.delete = async (req, res) => {
  const { id } = req.params;

  const resDB = await Brand.findByIdAndDelete(id);
  return res.status(200).json({
    status: 'SUCCESS',
    data: resDB,
  });
};

exports.deleteChecks = async (req, res) => {
  const query = req.query;
  const resDB = await Brand.deleteMany({ _id: query.checkBrands });
  return res.status(200).json({
    status: 'SUCCESS',
    data: resDB,
  });
};

exports.getAll = async (req, res) => {
  // populate sẽ tham chiếu thuộc tính nằm trong table Category, và đó là thuộc tính categories
  const resDB = await Brand.find().populate('categories');
  return res.status(200).json({
    status: 'SUCCESS',
    data: resDB,
  });
};
exports.getOne = async (req, res) => {
  // populate sẽ tham chiếu thuộc tính nằm trong table Category, và đó là thuộc tính categories
  const params = req.params;
  const resDB = await Brand.findById(params.id).populate('categories');
  return res.status(200).json({
    status: 'SUCCESS',
    data: resDB,
  });
};
