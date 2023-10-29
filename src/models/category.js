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
    brands: [
      {
        type: mongoose.Types.ObjectId,
        ref: 'Brand',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', schema);
