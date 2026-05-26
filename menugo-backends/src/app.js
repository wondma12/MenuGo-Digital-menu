const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
require('express-async-errors');

const { logger, stream: loggerStream } = require('./utils/logger');
const { errorMiddleware } = require('./middleware/errorMiddleware');
const { rateLimitMiddleware } = require('./middleware/rateLimitMiddleware');
const { securityMiddleware } = require('./middleware/securityMiddleware');
const passport = require('passport');
// Load passport strategies (JWT is already configured in config/passport.js)
require('./config/passport');
// Load optional Google strategy
try { require('./config/passportGoogle'); } catch (e) { /* ignore if not configured */ }
// Load optional Facebook strategy
try { require('./config/passportFacebook'); } catch (e) { /* ignore if not configured */ }

// Import routes
const routes = require('./routes');

const app = express();

// Disable automatic ETag generation for API responses to avoid conditional GET 304
app.set('etag', false);

// Prevent caching for API responses so clients always receive fresh JSON
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Security middleware
app.use(helmet());
app.use(securityMiddleware);

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
// Initialize passport for OAuth routes
app.use(passport.initialize());

// Compression
app.use(compression());

// Logging: route morgan output through our winston stream so request logs
// are persisted to `logs/combined.log` in all environments (helps debugging OAuth callbacks).
const morganFormat = process.env.NODE_ENV === 'development' ? 'dev' : 'combined';
app.use(morgan(morganFormat, { stream: loggerStream }));

// Rate limiting
if (process.env.NODE_ENV !== 'development') {
  app.use('/api/', rateLimitMiddleware);
}

// Static files
app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api', routes);

// Backwards-compatible alias for OAuth routes: redirect `/auth/*` -> `/api/auth/*`
// This helps browsers or bookmarks that hit `/auth/google` (without the `/api` prefix).
app.use((req, res, next) => {
  try {
    if (req.path && req.path.startsWith('/auth/')) {
      // Preserve query string if present
      const qs = req.originalUrl.includes('?') ? '?' + req.originalUrl.split('?').slice(1).join('?') : '';
      const target = `/api${req.path}${qs}`;
      return res.redirect(302, target);
    }
  } catch (e) {
    // ignore and continue to next middleware
  }
  next();
});

// Backwards-compatible alias for common top-level API paths without the /api prefix.
// This helps older frontends or bookmarks that call e.g. GET /restaurants instead of /api/restaurants.
try {
  const apiAliases = [
    'restaurants', 'users', 'notifications', 'dashboard', 'orders', 'menus', 'templates', 'settings', 'payments', 'reports'
  ];

  app.use((req, res, next) => {
    try {
      if (!req.path) return next();
      // Do not touch already namespaced paths or static/health/socket routes
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path === '/health' || req.path.startsWith('/socket.io') || req.path === '/favicon.ico') {
        return next();
      }

      const firstSegment = req.path.split('/')[1];
      if (apiAliases.includes(firstSegment)) {
        const qs = req.originalUrl.includes('?') ? '?' + req.originalUrl.split('?').slice(1).join('?') : '';
        const target = `/api${req.path}${qs}`;
        return res.redirect(302, target);
      }
    } catch (e) {
      // ignore
    }
    next();
  });
} catch (e) {
  // ignore mounting errors
}

// Backwards-compatible public alias: some frontends may call /restaurants/:id/calls without the /api prefix.
// Provide a thin public POST handler that forwards to the same controller used by the /api routes.
try {
  // require here to avoid circular deps at module load time
  const { createCallRequest } = require('./controllers/customerController');
  app.post('/restaurants/:id/calls', createCallRequest);
} catch (e) {
  // If controller isn't available for any reason, don't crash the app — just log.
  logger.warn('Could not mount legacy /restaurants/:id/calls route alias:', e && e.message);
}

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Global error handler
app.use(errorMiddleware);

module.exports = app;
