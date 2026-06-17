const winston = require('winston');
const path = require('path');

const logDir = 'logs';

// Custom format
const customFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    if (stack) {
      log += `\n${stack}`;
    }
    return log;
  })
);

// Create logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: customFormat,
  defaultMeta: { service: 'menugo-backend' },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

// Create stream for Morgan
const stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// Request logger middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info({
      type: 'request',
      method: req.method,
      url: req.sanitizedUrl || req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  });
  
  next();
};

// Error logger
const errorLogger = (err, req, res, next) => {
  // Avoid noisy stack traces for expected client errors like 401/403.
  const metadata = {
    type: 'error',
    message: err.message,
    url: req?.sanitizedUrl || req?.originalUrl,
    method: req.method,
    ip: req.ip,
  };

  if (err && err.statusCode === 401) {
    // Unauthorized errors are expected when tokens are missing/expired — log at warn level without stack.
    logger.warn({ ...metadata, statusCode: 401 })
  } else if (err && err.statusCode && err.statusCode < 500) {
    // Other client errors (4xx) — log as info to avoid treating them as server failures.
    logger.info({ ...metadata, statusCode: err.statusCode })
  } else {
    // Server errors: include stack and log at error level.
    logger.error({ ...metadata, stack: err.stack, statusCode: err.statusCode || 500 })
  }
  next(err);
};

module.exports = {
  logger,
  stream,
  requestLogger,
  errorLogger,
};