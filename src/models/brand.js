const mongoose = require('mongoose');

var schema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
      unique: true,
    },
    desc: {
      type: Object,
    },
    categories: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Category',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Brand', schema);
