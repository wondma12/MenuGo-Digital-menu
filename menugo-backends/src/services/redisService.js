const redis = require('redis');
const { logger } = require('../utils/logger');

let redisClient = null;

const formatError = (err) => {
  if (!err) return null;
  if (typeof AggregateError !== 'undefined' && err instanceof AggregateError) {
    try {
      const inner = Array.from(err.errors || []).map(e => (e && (e.message || String(e))) || String(e));
      return inner.length ? inner.join(' | ') : (err.message || String(err));
    } catch (e) {
      return err.message || String(err);
    }
  }
  if (err && Array.isArray(err.errors)) {
    const inner = err.errors.map(e => (e && (e.message || String(e))) || String(e));
    return inner.length ? inner.join(' | ') : (err.message || String(err));
  }
  return err.message || String(err);
};

// Initialize Redis client
const initRedis = async () => {
  const hasRedisConfig = Boolean(process.env.REDIS_URL || process.env.REDIS_HOST || process.env.REDIS_PORT);
  const redisEnabled = process.env.REDIS_ENABLED === 'true' || hasRedisConfig;

  if (!redisEnabled) {
    logger.info('Redis not configured; skipping Redis initialization');
    return null;
  }

  try {
    redisClient = redis.createClient({
      url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
      password: process.env.REDIS_PASSWORD,
      database: parseInt(process.env.REDIS_DB) || 0,
      socket: {
        connectTimeout: 2000,
        reconnectStrategy: false,
      },
    });

    redisClient.on('error', (err) => {
      const message = formatError(err);
      logger.warn('Redis unavailable; continuing without cache', { name: err && err.name, message, stack: err && err.stack });
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    redisClient = null;
    const message = formatError(error);
    logger.warn('Redis unavailable; continuing without cache', { name: error && error.name, message, stack: error && error.stack });
    return null;
  }
};

// Get Redis client
const getRedisClient = () => redisClient;

// Set cache data
const setCache = async (key, data, ttl = 3600) => {
  if (!redisClient) return false;
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(data));
    return true;
  } catch (error) {
    logger.error('Redis set cache error', { error: String(error) });
    return false;
  }
};

// Get cached data
const getCache = async (key) => {
  if (!redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Redis get cache error', { error: String(error) });
    return null;
  }
};

// Delete cache
const deleteCache = async (key) => {
  if (!redisClient) return false;
  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error('Redis delete cache error', { error: String(error) });
    return false;
  }
};

// Clear cache by pattern
const clearCachePattern = async (pattern) => {
  if (!redisClient) return false;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    logger.error('Redis clear cache pattern error', { error: String(error) });
    return false;
  }
};

// Set user session
const setUserSession = async (userId, sessionData, ttl = 7 * 24 * 60 * 60) => {
  return setCache(`session:${userId}`, sessionData, ttl);
};

// Get user session
const getUserSession = async (userId) => {
  return getCache(`session:${userId}`);
};

// Delete user session
const deleteUserSession = async (userId) => {
  return deleteCache(`session:${userId}`);
};

// Set rate limit
const incrementRateLimit = async (key, windowMs = 60 * 1000) => {
  if (!redisClient) return { count: 0, ttl: 0 };
  try {
    const count = await redisClient.incr(key);
    if (count === 1) {
      await redisClient.expire(key, Math.ceil(windowMs / 1000));
    }
    const ttl = await redisClient.ttl(key);
    return { count, ttl };
  } catch (error) {
    logger.error('Redis rate limit error', { error: String(error) });
    return { count: 0, ttl: 0 };
  }
};

// Set verification code
const setVerificationCode = async (key, code, ttl = 600) => {
  return setCache(`verify:${key}`, { code, attempts: 0 }, ttl);
};

// Get verification code
const getVerificationCode = async (key) => {
  return getCache(`verify:${key}`);
};

// Delete verification code
const deleteVerificationCode = async (key) => {
  return deleteCache(`verify:${key}`);
};

module.exports = {
  initRedis,
  getRedisClient,
  setCache,
  getCache,
  deleteCache,
  clearCachePattern,
  setUserSession,
  getUserSession,
  deleteUserSession,
  incrementRateLimit,
  setVerificationCode,
  getVerificationCode,
  deleteVerificationCode,
};