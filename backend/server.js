'use strict';

const path = require('path');

// Render injects real environment variables. A `.env` file is a local-dev
// convenience only, so it is skipped in production.
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
  require('dotenv').config({ path: path.resolve(__dirname, '.env') });
}

const app = require('./app');
const { config, validateConfig } = require('./config/env');
const { connectDB, disconnectDB, registerConnectionEvents } = require('./config/db');
const logger = require('./utils/logger');

let server;

const shutdown = (signal) => {
  logger.info(`${signal} received, shutting down`);

  const finish = async () => {
    try {
      await disconnectDB();
    } catch (error) {
      logger.error(`Error while closing MongoDB connection: ${error.message}`);
    }
    process.exit(0);
  };

  if (!server) {
    finish();
    return;
  }

  server.close(() => finish());

  // Never hang a deploy: force-exit if connections do not drain in time.
  setTimeout(() => {
    logger.warn('Forcing shutdown after 10s');
    process.exit(1);
  }, 10000).unref();
};

const start = async () => {
  validateConfig();

  registerConnectionEvents();
  await connectDB();

  server = app.listen(config.port, () => {
    logger.info(`learnAI API listening on port ${config.port} (${config.env})`);
    logger.info(`AI model: ${config.geminiModel}`);
  });

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled promise rejection: ${reason instanceof Error ? reason.stack : reason}`);
});

process.on('uncaughtException', (error) => {
  logger.error(`Uncaught exception: ${error.stack || error.message}`);
  process.exit(1);
});

start().catch((error) => {
  logger.error(`Failed to start the API: ${error.message}`);
  process.exit(1);
});
