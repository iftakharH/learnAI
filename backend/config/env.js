'use strict';

const DEFAULT_CORS_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://learn-ai-edu.vercel.app',
  'https://learnai.vercel.app',
];

const toInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toList = (value, fallback) => {
  if (!value) return fallback;
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

/**
 * Render (and other hosts) sometimes document the Mongo variable as MONGO_URI.
 * Accept both so a naming mismatch can never take the service down.
 */
const resolveMongoUri = () => process.env.MONGODB_URI || process.env.MONGO_URI || '';

const nodeEnv = process.env.NODE_ENV || 'development';

const config = {
  env: nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',

  port: toInt(process.env.PORT, 5000),

  mongoUri: resolveMongoUri(),
  mongoDbName: (process.env.MONGODB_DB_NAME || 'learnai').toLowerCase(),
  mongoRetries: toInt(process.env.MONGODB_CONNECT_RETRIES, 5),
  mongoTimeoutMs: toInt(process.env.MONGODB_TIMEOUT_MS, 10000),

  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '30d',

  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
  aiTimeoutMs: toInt(process.env.AI_TIMEOUT_MS, 45000),
  aiMaxTextChars: toInt(process.env.AI_MAX_TEXT_CHARS, 400000),
  aiMaxRetries: toInt(process.env.AI_MAX_RETRIES, 1),

  corsOrigins: toList(process.env.CORS_ORIGINS, DEFAULT_CORS_ORIGINS),
  corsAllowAll: process.env.CORS_ORIGINS === '*',

  uploadMaxBytes: toInt(process.env.UPLOAD_MAX_BYTES, 15 * 1024 * 1024),

  rateLimitEnabled: process.env.RATE_LIMIT_DISABLED !== 'true' && nodeEnv !== 'test',
  rateLimitWindowMs: toInt(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  rateLimitMax: toInt(process.env.RATE_LIMIT_MAX, 300),
  authRateLimitMax: toInt(process.env.AUTH_RATE_LIMIT_MAX, 20),
};

const REQUIRED_IN_PRODUCTION = {
  mongoUri: 'MONGODB_URI (or MONGO_URI) — MongoDB connection string',
  jwtSecret: 'JWT_SECRET — random string used to sign auth tokens',
  geminiApiKey: 'GEMINI_API_KEY — Google AI Studio API key',
};

/**
 * Fail fast with an actionable message.
 *
 * A missing variable is a configuration error, and it is much cheaper to see it
 * in the deploy log than to debug a 500 later.
 */
const validateConfig = () => {
  if (config.jwtSecret && config.jwtSecret.length < 16) {
    throw new Error('JWT_SECRET must be at least 16 characters long');
  }

  if (!config.isProduction) {
    const missing = Object.entries(REQUIRED_IN_PRODUCTION)
      .filter(([key]) => !config[key])
      .map(([, hint]) => hint);

    if (missing.length > 0) {
      // Local development is allowed to start without every secret.
      console.warn(
        `[config] Missing environment variables (AI/auth features will fail): ${missing.join('; ')}`,
      );
    }
    return;
  }

  const missing = Object.entries(REQUIRED_IN_PRODUCTION)
    .filter(([key]) => !config[key])
    .map(([, hint]) => hint);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n  - ${missing.join('\n  - ')}\n` +
        'Set these in the Render dashboard (Environment tab) and redeploy.',
    );
  }
};

module.exports = { config, validateConfig, DEFAULT_CORS_ORIGINS };
