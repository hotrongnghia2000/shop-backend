const Category = require('../models/category');

exports.add = async (req, res) => {
  const body = req.body;

  const resDB = await Category.create(body);
  return res.status(200).json({
    status: 'SUCCESS',
    data: resDB,
  });
};

exports.update = async (req, res) => {
  const { id } = req.params;
  const body = req.body;
  console.log(body);

  const resDB = await Category.findByIdAndUpdate(id, body, { new: true });
  return res.status(200).json({
    status: 'SUCCESS',
    data: resDB,
  });
};

exports.delete = async (req, res) => {
  const { id } = req.params;

  const resDB = await Category.findByIdAndDelete(id);
  return res.status(200).json({
    status: 'SUCCESS',
    data: resDB,
  });
};

exports.deleteChecks = async (req, res) => {
  const query = req.query;
  const resDB = await Category.deleteMany({ _id: query.checkCategories });
  return res.status(200).json({
    status: 'SUCCESS',
    data: resDB,
  });
};

exports.getAll = async (req, res) => {
  // populate sẽ tham chiếu thuộc tính nằm trong table Category, và đó là thuộc tính categories
  const resDB = await Category.find().populate('brands');
  return res.status(200).json({
    status: 'SUCCESS',
    data: resDB,
  });
};

exports.getOne = async (req, res) => {
  // populate sẽ tham chiếu thuộc tính nằm trong table Category, và đó là thuộc tính categories
  const params = req.params;
  const resDB = await Category.findById(params.id).populate('brands');
  return res.status(200).json({
    status: 'SUCCESS',
    data: resDB,
  });
};
