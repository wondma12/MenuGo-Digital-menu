const { logger } = require('../utils/logger');
const { ApiError } = require('../utils/apiError');
const { ValidationError } = require('sequelize');

// Global error handler middleware
const errorMiddleware = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  // If this was a body-parser size error, include Content-Length for diagnostics
  const extra = {};
  try {
    if (err.name === 'PayloadTooLargeError' || err.type === 'entity.too.large' || err.status === 413) {
      extra.contentLength = req.headers['content-length'] || null;
      extra.contentType = req.headers['content-type'] || null;
    }
  } catch (e) {
    // ignore
  }

  logger.error({
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userId: req.userId,
    ...extra,
  });

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const message = Object.values(err.errors).map(val => val.message).join(', ');
    error = new ApiError(400, message);
  }

  // Database connection errors (e.g., auth plugin mismatch)
  if (err.name === 'SequelizeConnectionError' || (err.original && err.original.code)) {
    const code = err.original && err.original.code ? err.original.code : err.name;
    if (code === 'ER_NOT_SUPPORTED_AUTH_MODE' || code === 'ER_NOT_SUPPORTED_AUTH_MODE') {
      error = new ApiError(503, 'Database authentication error: unsupported auth plugin. Configure your MySQL user to use `mysql_native_password` or update the DB client.');
    } else {
      error = new ApiError(503, `Database connection error: ${code}`);
    }
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0].path;
    const message = `${field} already exists`;
    error = new ApiError(400, message);
  }

  // Sequelize foreign key error
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    error = new ApiError(400, 'Related record not found');
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token expired');
  }

  // Multer errors
  if (err.name === 'MulterError') {
    if (err.code === 'FILE_TOO_LARGE') {
      error = new ApiError(400, 'File too large');
    } else {
      error = new ApiError(400, err.message);
    }
  }

  // PayloadTooLargeError from raw-body / body-parser
  if (err.name === 'PayloadTooLargeError' || err.type === 'entity.too.large' || err.status === 413) {
    error = new ApiError(413, 'Payload too large. Send smaller JSON or use multipart/form-data for file uploads.');
  }

  // ValidationError from express-validator
  if (err.name === 'ValidationError') {
    error = new ApiError(400, err.message);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    errors: error.errors || null,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

// Not found middleware
const notFoundMiddleware = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
};

module.exports = {
  errorMiddleware,
  notFoundMiddleware,
};