const { logger } = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Request logging middleware
const loggingMiddleware = (req, res, next) => {
  const start = Date.now();
  const requestId = uuidv4();
  
  // Add request ID to request object
  req.requestId = requestId;
  
  // Log request
  logger.info({
    type: 'request',
    requestId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    userId: req.userId,
  });

  // Log response on finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'error' : 'info';
    
    logger[level]({
      type: 'response',
      requestId,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      method: req.method,
      url: req.originalUrl,
    });
  });

  next();
};

// Error logging middleware
const errorLoggingMiddleware = (err, req, res, next) => {
  logger.error({
    type: 'error',
    requestId: req.requestId,
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.userId,
  });
  
  next(err);
};

// Performance logging middleware
const performanceMiddleware = (threshold = 1000) => {
  return (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > threshold) {
        logger.warn({
          type: 'performance',
          requestId: req.requestId,
          duration: `${duration}ms`,
          method: req.method,
          url: req.originalUrl,
          threshold,
        });
      }
    });
    
    next();
  };
};

module.exports = {
  loggingMiddleware,
  errorLoggingMiddleware,
  performanceMiddleware,
};
