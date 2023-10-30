const cloudinary = require('cloudinary').v2;
var slugify = require('slugify');
const Product = require('../models/product');
const MyError = require('../class/HandleThrowErr');

exports.delete = async (req, res) => {
  const { id } = req.params;
  const query = req.query;
  console.log(query);
  console.log(id);
  const resDB = await Product.findByIdAndDelete(id);
  if (resDB) {
    cloudinary.api.delete_resources(query.filenames, function (error, result) {
      console.log(result, error);
    });
  }
  console.log(resDB);
  return res.status(200).json({
    status: 'SUCCESS',
    data: resDB,
  });
};

exports.deleteChecks = async (req, res) => {
  const query = req.query;
  console.log(query);
  const resDB = await Product.deleteMany({ _id: query.checks });
  if (resDB) {
    cloudinary.api.delete_resources(query.filenames, function (error, result) {
      console.log(result, error);
    });
  }
  return res.status(200).json({
    status: 'SUCCESS',
    data: resDB,
  });
};

exports.getOne = async (req, res) => {
  const params = req.params;
  const resDB = await Product.findById(params.id)
    .populate('comments.user_id', '-password -refreshToken -role')
    .populate('brand_id')
    .populate('category_id');
  return res.status(200).json({
    status: 'SUCCESS',
    data: resDB,
  });
};

exports.add = async (req, res) => {
  const body = req.body;
  const files = req.files;
  const data = { ...body, desc: JSON.parse(body.desc) };
  const isExistProduct = await Product.findOne({ name: body.name });
  if (isExistProduct)
    throw new MyError('Vui lòng dùng tên khác, tên sản phẩm đã tồn tại!', 400);
  for (const obj in files) {
    for (const arr of files[obj]) {
      data[obj] = [];
      data[obj].push(arr);
    }
  }

  data.slug = slugify(body.name, { lower: true });
  const resDB = await Product.create(data);
  return res.status(200).json({
    status: 'SUCCESS',
    data: resDB,
  });
};
exports.getAll = async (req, res) => {
  const resDB = await Product.find();
  return res.status(200).json({
    status: 'SUCCESS',
    data: resDB,
  });
};

exports.update = async (req, res) => {
  const params = req.params;
  const body = req.body;
  const files = req.files;

  if (files) var product = await Product.findById(params.id);

  if (body.desc) body.desc = JSON.parse(body.desc);
  if (body.name) body.slug = slugify(body.name, { lower: true });

  for (const obj in files) {
    for (const arr of files[obj]) {
      if (!body[obj]) body[obj] = [];
      body[obj].push(arr);
    }
  }

  const resDB = await Product.findByIdAndUpdate(params.id, body, {
    new: true,
  });

  // clear previously saved files on cloudinary
  if (resDB && files) {
    if (files.thumb && product.thumb) {
      for (let item of product.thumb) {
        cloudinary.uploader.destroy(item.filename);
      }
    }
    if (files.images && product.images) {
      for (let item of product.images) {
        cloudinary.uploader.destroy(item.filename);
      }
    }
  }
  return res.status(200).json({
    status: 'SUCCESS',
    data: resDB,
  });
};

exports.filter = async (req, res) => {
  const query = req.query;

  // 1.FILTER
  // since query is an object, mySQL uses operator '...' to refer to the variable myFilter
  let myFilter = { ...query };
  // strip some values ​​from myFilter
  const removalList = ['page', 'limit', 'sort', 'select'];
  for (const el of removalList) delete myFilter[el];
  // convert myFilter to string to add $ sign before gt, gte, lt, lte on all object values
  myFilter = JSON.stringify(myFilter).replace(
    //match any word in brackets, with different letters in front and back, eg: xgte, gtex, xgtex
    /\b(gte|gt|lte|lt)\b/g,
    (match) => `$${match}`
  );
  // convert myFilter to JSON
  myFilter = JSON.parse(myFilter);
  if (query.name) {
    myFilter.name = { $regex: query.name, $options: 'i' };
  }
  if (!myFilter) myFilter = null;
  // 2. SORT
  const mySorter = query.sort?.split(',').join(' ') || '-createdAt';

  // 3. SELECT
  const mySelector = query.select?.split(',').join(' ');

  // 4. PAGINATION
  const page = query.page || 1;
  const limit = query.limit || 4;
  const skip = (page - 1) * limit;

  const resDB = await Product.find(myFilter)
    .populate('category_id')
    .sort(mySorter)
    .select(mySelector)
    .skip(skip)
    .limit(limit)
    .then(async (resolve) => {
      const count = await Product.find(myFilter).countDocuments();
      return res.status(200).json({
        status: 'SUCCESS',
        count: count,
        data: resolve,
      });
    });
};

exports.rate = async (req, res) => {
  const params = req.params;
  const body = req.body;
  const user = req.user;
  console.log(body);

  const product = await Product.findById(params.id);
  // check if users have rated this product before
  const isRated = product.ratings.find(
    (el) => el.user_id.toString() === user._id
  );
  // handle when not previously evaluated
  let resDB = {};
  if (!isRated) {
    // update avg
    const updateRatingAvg =
      product.rating_avg +
      (body.star - product.rating_avg) / (product.ratings.length + 1);
    // update ratings
    const contentUpdate = {
      rating_avg: updateRatingAvg,
      $push: {
        ratings: {
          user_id: user._id,
          star: body.star,
        },
      },
    };
    if (body.comment)
      contentUpdate.$push.comments = {
        user_id: user._id,
        content: body.comment,
      };
    resDB = await Product.findByIdAndUpdate(params.id, contentUpdate, {
      new: true,
    });
  }
  // handle once evaluated
  else {
    const ratingAvg = product.rating_avg || 0;
    const updateRatingAvg =
      ratingAvg + (body.star - isRated.star) / product.ratings.length;
    //
    const contentUpdate = {
      // $ points to the element found in the ratings array
      $set: { 'ratings.$.star': body.star, rating_avg: updateRatingAvg },
    };
    if (body.comment)
      contentUpdate.$push = {
        comments: {
          user_id: user._id,
          content: body.comment,
        },
      };
    resDB = await Product.updateOne({ ratings: isRated }, contentUpdate, {
      new: true,
    });
  }

  return res.status(200).json({
    status: 'SUCCESS',
    data: resDB,
  });
};

exports.comment = async (req, res) => {
  const params = req.params;
  const body = req.body;
  const user = req.user;

  const resDB = await Product.findByIdAndUpdate(
    params.id,
    {
      $push: {
        comments: {
          user_id: user._id,
          content: body.content,
        },
      },
    },
    { new: true }
  );

  return res.status(200).json({
    status: 'SUCCESS',
    data: resDB,
  });
};

exports.repComment = async (req, res) => {
  const params = req.params;
  const body = req.body;
  const user = req.user;

  const resDB = await Product.findByIdAndUpdate(
    params.id,
    {
      $push: {
        comments: {
          user_id: user._id,
          content: body.content,
          parent_id: params.parent_id,
        },
      },
    },
    { new: true }
  );

  return res.status(200).json({
    status: 'SUCCESS',
    data: resDB,
  });
};
