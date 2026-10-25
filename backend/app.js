'use strict';

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const { config } = require('./config/env');
const { isDbConnected } = require('./config/db');
const { apiLimiter, authLimiter } = require('./middleware/rateLimit');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { ApiError } = require('./utils/ApiError');
const logger = require('./utils/logger');

const authRoutes = require('./routes/authRoutes');
const documentRoutes = require('./routes/documentRoutes');
const aiRoutes = require('./routes/aiRoutes');
const flashcardRoutes = require('./routes/flashcardRoutes');
const quizRoutes = require('./routes/quizRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const { version } = require('./package.json');

const app = express();

// Render terminates TLS at its proxy; trust exactly one hop so rate limiting
// and req.ip see the real client address.
app.set('trust proxy', 1);
app.disable('x-powered-by');

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);

app.use(
  cors({
    credentials: true,
    origin(origin, callback) {
      // Same-origin requests and server-to-server calls have no Origin header.
      if (!origin || config.corsAllowAll || config.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      // Vercel gives every deployment a unique preview URL. Allowing the
      // *.vercel.app family keeps previews working without listing each one.
      if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
        callback(null, true);
        return;
      }

      callback(ApiError.forbidden(`Origin ${origin} is not allowed`));
    },
  }),
);

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Request log: method, path, status and duration. Health checks are excluded.
if (!config.isTest) {
  app.use((req, res, next) => {
    if (req.path === '/api/health') return next();

    const startedAt = process.hrtime.bigint();
    res.on('finish', () => {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
      logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(0)}ms`);
    });
    return next();
  });
}

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'learnAI API',
    version,
    documentation: 'https://github.com/iftakharH/learnAI#api-endpoints',
  });
});

// Health check is intentionally outside the rate limiter so Render can poll it.
app.get('/api/health', (req, res) => {
  const database = isDbConnected() ? 'connected' : 'disconnected';
  const healthy = database === 'connected';

  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'ok' : 'degraded',
    database,
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', apiLimiter);

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
