const rateLimit = require('express-rate-limit');

const shouldSkipRateLimit = () =>
  process.env.NODE_ENV === 'development' || process.env.RATE_LIMIT_ENABLED === 'false';

// General API rate limit
const rateLimitMiddleware = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skip: shouldSkipRateLimit,
});

// Strict rate limit for authentication
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  skip: shouldSkipRateLimit,
});

// API rate limit (per minute)
const apiRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: {
    success: false,
    message: 'Too many requests, please slow down.',
  },
  skip: shouldSkipRateLimit,
});

// Login rate limit
const loginRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  skipSuccessfulRequests: true,
  keyGenerator: (req) => {
    return req.body.email || req.ip;
  },
  message: {
    success: false,
    message: 'Too many login attempts, please try again later.',
  },
  skip: shouldSkipRateLimit,
});

// Order creation rate limit
const orderRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    success: false,
    message: 'Too many orders created, please wait.',
  },
  skip: shouldSkipRateLimit,
});

// QR scan rate limit
const qrScanRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: {
    success: false,
    message: 'Too many QR scans, please slow down.',
  },
  skip: shouldSkipRateLimit,
});

module.exports = {
  rateLimitMiddleware,
  authRateLimit,
  apiRateLimit,
  loginRateLimit,
  orderRateLimit,
  qrScanRateLimit,
};
