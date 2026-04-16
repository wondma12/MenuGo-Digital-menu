const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const cookieParser = require('cookie-parser');
require('express-async-errors');

const { logger } = require('./utils/logger');
const { errorMiddleware } = require('./middleware/errorMiddleware');
const { rateLimitMiddleware } = require('./middleware/rateLimitMiddleware');
const { securityMiddleware } = require('./middleware/securityMiddleware');

// Import routes
const routes = require('./routes');

const app = express();

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

// Compression
app.use(compression());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    stream: { write: (message) => logger.info(message.trim()) }
  }));
}

// Rate limiting
if (process.env.NODE_ENV !== 'development') {
  app.use('/api/', rateLimitMiddleware);
}

// Static files
app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api', routes);

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
