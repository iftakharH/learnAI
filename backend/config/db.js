const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not configured');
    }

    // Force database name to lowercase to avoid casing conflicts
    const dbName = (process.env.MONGODB_DB_NAME || 'learnai').toLowerCase();

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: dbName,
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;