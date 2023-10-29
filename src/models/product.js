const mongoose = require('mongoose');

var schema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    price: {
      type: Number,
      required: true,
    },
    inventory: {
      type: Number,
      required: true,
    },
    sold: {
      type: Number,
      default: 0,
    },
    brand_id: {
      type: mongoose.Types.ObjectId,
      ref: 'Brand',
    },
    category_id: {
      type: mongoose.Types.ObjectId,
      ref: 'Category',
    },
    thumb: {
      type: [
        {
          originalname: {
            type: String,
          },
          path: {
            type: String,
          },
          filename: {
            type: String,
          },
        },
      ],
    },
    images: {
      type: [
        {
          originalname: {
            type: String,
          },
          path: {
            type: String,
          },
          filename: {
            type: String,
          },
        },
      ],
    },
    desc: { type: Object },
    ratings: {
      type: [
        {
          star: { type: Number },
          user_id: { type: mongoose.Types.ObjectId, ref: 'User' },
        },
      ],
    },
    rating_avg: {
      type: Number,
      default: 0,
    },
    comments: [
      {
        user_id: { type: mongoose.Types.ObjectId, ref: 'User' },
        content: { type: String },
        parent_id: { type: mongoose.Types.ObjectId, default: null },
      },
      { timestamps: true },
    ],
    status: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', schema);
