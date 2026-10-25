'use strict';

const mongoose = require('mongoose');
const { config } = require('./env');
const logger = require('../utils/logger');

mongoose.set('strictQuery', true);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Connect to MongoDB with bounded exponential backoff.
 *
 * Retrying matters on Render: free instances start cold and Atlas occasionally
 * rejects the first connection while it wakes up. After the final attempt the
 * error is re-thrown so the process exits with a readable reason instead of
 * sitting in a half-initialised state.
 */
const connectDB = async () => {
  if (!config.mongoUri) {
    throw new Error(
      'MONGODB_URI is not set. Add it in the Render dashboard (Environment tab). ' +
        'If you copied the variable name from older docs, MONGO_URI also works.',
    );
  }

  const attempts = Math.max(config.mongoRetries, 1);
  let lastError;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const connection = await mongoose.connect(config.mongoUri, {
        dbName: config.mongoDbName,
        serverSelectionTimeoutMS: config.mongoTimeoutMs,
        maxPoolSize: 10,
        minPoolSize: 1,
      });

      logger.info(
        `MongoDB connected: ${connection.connection.host}/${connection.connection.name}`,
      );
      return connection;
    } catch (error) {
      lastError = error;
      logger.error(
        `MongoDB connection attempt ${attempt}/${attempts} failed: ${error.message}`,
      );

      if (attempt === attempts) break;

      const delay = Math.min(1000 * 2 ** (attempt - 1), 15000);
      logger.info(`Retrying MongoDB connection in ${delay}ms...`);
      await sleep(delay);
    }
  }

  throw new Error(
    `Could not connect to MongoDB after ${attempts} attempts: ${lastError?.message}. ` +
      'Check that MONGODB_URI is correct and that 0.0.0.0/0 (or Render\'s IP range) is allowed in Atlas.',
  );
};

const isDbConnected = () => mongoose.connection.readyState === 1;

const disconnectDB = () => mongoose.disconnect();

const registerConnectionEvents = () => {
  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected');
  });
};

module.exports = { connectDB, disconnectDB, isDbConnected, registerConnectionEvents };
