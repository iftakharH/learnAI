const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('NOTE: Please ensure your local MongoDB service is running, or update MONGODB_URI in .env with an Atlas URL.');
  }
};

module.exports = connectDB;
