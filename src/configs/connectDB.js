const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    if (conn.connection.readyState === 1)
      console.log('DB connection is successfully!');
    else console.log('DB connecting');
  } catch (err) {
    console.log('DB connection is failed');
    console.log(err);
  }
};

module.exports = connectDB;
