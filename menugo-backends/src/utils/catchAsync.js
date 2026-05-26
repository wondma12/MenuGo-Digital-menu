/**
 * Wraps an async function to catch errors and pass them to Express error handler
 * Eliminates the need for try-catch blocks in controller functions
 * 
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Instead of:
 * const getUsers = async (req, res, next) => {
 *   try {
 *     const users = await User.findAll();
 *     res.json(users);
 *   } catch (error) {
 *     next(error);
 *   }
 * };
 * 
 * // Use:
 * const getUsers = catchAsync(async (req, res) => {
 *   const users = await User.findAll();
 *   res.json(users);
 * });
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Wraps an async function and handles specific error types
 * 
 * @param {Function} fn - Async function to wrap
 * @param {Object} errorHandlers - Custom error handlers
 * @returns {Function} Express middleware function
 */
const catchAsyncWithHandlers = (fn, errorHandlers = {}) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      // Check for custom error handler
      const handler = errorHandlers[error.name] || errorHandlers[error.code];
      if (handler) {
        return handler(error, req, res, next);
      }
      next(error);
    }
  };
};

/**
 * Wraps an array of async functions to catch errors
 * 
 * @param {Array<Function>} fns - Array of async functions to wrap
 * @returns {Array<Function>} Array of Express middleware functions
 */
const catchAsyncAll = (fns) => {
  return fns.map(fn => catchAsync(fn));
};

/**
 * Wraps an async function and adds retry logic
 * 
 * @param {Function} fn - Async function to wrap
 * @param {number} retries - Number of retries (default: 3)
 * @param {number} delay - Delay between retries in ms (default: 1000)
 * @returns {Function} Express middleware function with retry logic
 */
const catchAsyncWithRetry = (fn, retries = 3, delay = 1000) => {
  return async (req, res, next) => {
    let lastError;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await fn(req, res, next);
      } catch (error) {
        lastError = error;
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }
    
    next(lastError);
  };
};

/**
 * Wraps an async function and adds timeout
 * 
 * @param {Function} fn - Async function to wrap
 * @param {number} timeoutMs - Timeout in milliseconds (default: 30000)
 * @returns {Function} Express middleware function with timeout
 */
const catchAsyncWithTimeout = (fn, timeoutMs = 30000) => {
  return async (req, res, next) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs);
    });
    
    try {
      await Promise.race([fn(req, res, next), timeoutPromise]);
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Wraps an async function and adds logging
 * 
 * @param {Function} fn - Async function to wrap
 * @param {string} name - Function name for logging
 * @returns {Function} Express middleware function with logging
 */
const catchAsyncWithLogging = (fn, name = 'anonymous') => {
  return async (req, res, next) => {
    const start = Date.now();
    
    try {
      const result = await fn(req, res, next);
      const duration = Date.now() - start;
      
      if (duration > 1000) {
        console.warn(`[Performance] ${name} took ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`[Error] ${name} failed after ${duration}ms:`, error.message);
      next(error);
    }
  };
};

module.exports = {
  catchAsync,
  catchAsyncWithHandlers,
  catchAsyncAll,
  catchAsyncWithRetry,
  catchAsyncWithTimeout,
  catchAsyncWithLogging,
};