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
try {
  require('./config/passportGoogle'); 
} catch (e) { /* ignore if not configured */ }
// Load optional Facebook strategy
try {
  require('./config/passportFacebook'); 
} catch (e) { /* ignore if not configured */ }

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
// Allow explicit origins from CORS_ORIGIN, but also permit localhost and loopback
// origins (different dev ports like 5173/3001/3000) to ease local development.
const configuredOrigins = (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.split(',').map((value) => value.trim()).filter(Boolean)) || [];
const isLocalhostOrigin = (origin) => {
  try {
    const normalizedOrigin = origin.trim();
    const { hostname } = new URL(normalizedOrigin);
    const normalizedHostname = hostname.replace(/^\[|\]$/g, '');
    return ['localhost', '127.0.0.1', '0.0.0.0', '::1', '::ffff:127.0.0.1'].includes(normalizedHostname);
  } catch (e) {
    return false;
  }
};
app.use(cors({
  origin: (origin, cb) => {
    // Allow non-browser requests (e.g., curl) with no origin
    if (!origin) return cb(null, true);
    const normalizedOrigin = origin.trim();
    if (configuredOrigins.includes(normalizedOrigin)) return cb(null, true);
    if (isLocalhostOrigin(normalizedOrigin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
}));

// Body parsing middleware
// Increase limits to handle larger profile payloads (e.g., richer user objects).
// Note: prefer multipart/form-data for file uploads; this increases JSON limits
// to 50mb to avoid intermittent PayloadTooLarge errors from large requests.
// Protect specific endpoints from huge embedded base64 JSON payloads by
// rejecting large JSON bodies early before the body parser consumes them.
// This helps return a friendly 413 and avoids excessive memory use when
// clients accidentally embed images as data URLs in JSON.
const PROFILE_JSON_LIMIT = parseInt(process.env.PROFILE_MAX_JSON_BYTES || '200000', 10); // 200KB default
app.use('/api/auth/profile', (req, res, next) => {
  try {
    const contentType = (req.headers['content-type'] || '').toLowerCase();
    if (contentType.includes('application/json')) {
      const len = parseInt(req.headers['content-length'] || '0', 10);
      if (len && len > PROFILE_JSON_LIMIT) {
        return res.status(413).json({ success: false, message: 'Payload too large. Upload images using multipart/form-data or the /api/upload endpoint instead of embedding large base64 data in JSON.' });
      }
    }
  } catch (e) {
    // ignore header parsing errors and let the body parser handle them
  }
  next();
});

// Body parsers with friendly error handling for malformed JSON
app.use(express.json({ limit: process.env.EXPRESS_JSON_LIMIT || '50mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.EXPRESS_JSON_LIMIT || '50mb' }));

// Friendly handler for malformed JSON payloads thrown by express.json()
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    // Common body-parser error when clients send invalid JSON
    logger.warn('Malformed JSON received in request', { url: req.originalUrl, ip: req.ip });
    return res.status(400).json({ success: false, message: 'Malformed JSON in request body' });
  }
  // Delegate to next error handler
  return next(err);
});
app.use(cookieParser());
// Initialize passport for OAuth routes
app.use(passport.initialize());

// Sanitize sensitive query params from request URL before logging to avoid
// leaking authorization codes or tokens in logs (e.g. Google callback codes).
const SENSITIVE_QUERY_KEYS = ['code', 'token', 'access_token', 'id_token', 'refresh_token', 'state', 'authuser'];
const sanitizeUrl = (originalUrl) => {
  try {
    if (!originalUrl || !originalUrl.includes('?')) {
      return originalUrl;
    }
    const [path, qs] = originalUrl.split('?');
    const params = new URLSearchParams(qs);
    for (const k of SENSITIVE_QUERY_KEYS) {
      if (params.has(k)) {
        params.set(k, '[REDACTED]');
      }
    }
    return `${path}?${params.toString()}`;
  } catch (e) {
    return originalUrl;
  }
};

// Attach a sanitized URL property for logging and diagnostics
app.use((req, res, next) => {
  try {
    req.sanitizedUrl = sanitizeUrl(req.originalUrl || req.url || '');
  } catch (e) {
    req.sanitizedUrl = req.originalUrl || req.url || '';
  }
  next();
});

// Compression
app.use(compression());

// Logging: route morgan output through our winston stream so request logs
// are persisted to `logs/combined.log` in all environments. Use a custom
// token that prints a sanitized URL to avoid leaking OAuth codes/tokens.
morgan.token('sanitized-url', (req) => req.sanitizedUrl || req.originalUrl || req.url);
const morganFormat = process.env.NODE_ENV === 'development'
  ? ':method :sanitized-url :status :response-time ms - :res[content-length]'
  : ':remote-addr - :remote-user [:date[clf]] ":method :sanitized-url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"';
app.use(morgan(morganFormat, { stream: loggerStream }));

// Rate limiting
if (process.env.NODE_ENV !== 'development') {
  app.use('/api/', rateLimitMiddleware);
}

// Static files
app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api', routes);

// Backwards-compatible alias for OAuth routes: internally rewrite `/auth/*` -> `/api/auth/*`
// This helps browsers or bookmarks that hit `/auth/google` (without the `/api` prefix)
// without losing headers or changing the original method.
app.use((req, res, next) => {
  try {
    if (req.path && req.path.startsWith('/auth/')) {
      const qs = req.originalUrl.includes('?') ? `?${  req.originalUrl.split('?').slice(1).join('?')}` : '';
      req.url = `/api${req.path}${qs}`;
      return next();
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
    'restaurants', 'users', 'notifications', 'dashboard', 'orders', 'menus', 'templates', 'settings', 'payments', 'reports',
  ];

  app.use((req, res, next) => {
    try {
      if (!req.path) {
        return next();
      }
      // Do not touch already namespaced paths or static/health/socket routes
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path === '/health' || req.path.startsWith('/socket.io') || req.path === '/favicon.ico') {
        return next();
      }

      const firstSegment = req.path.split('/')[1];
      if (apiAliases.includes(firstSegment)) {
        const qs = req.originalUrl.includes('?') ? `?${  req.originalUrl.split('?').slice(1).join('?')}` : '';
        req.url = `/api${req.path}${qs}`;
        return next();
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

// Root and health endpoints
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MenuGo API is running',
    docs: '/health',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use(errorMiddleware);

module.exports = app;
