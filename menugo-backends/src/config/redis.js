const redis = require('redis');
const { logger } = require('../utils/logger');

let redisClient = null;

const isRedisEnabled = () => {
  const explicitEnabled = process.env.REDIS_ENABLED === 'true' || process.env.REDIS_ENABLED === '1';
  const explicitDisabled = process.env.REDIS_ENABLED === 'false' || process.env.REDIS_ENABLED === '0';
  const hasRedisUrl = Boolean(process.env.REDIS_URL);
  const hasRedisHost = Boolean(process.env.REDIS_HOST);
  const hasRedisPort = Boolean(process.env.REDIS_PORT);

  if (explicitDisabled) return false;
  if (explicitEnabled) return true;

  const bindsToLocalhost = (value) => /^(localhost|127\.0\.0\.1|\[::1\]|::1)$/i.test(String(value || '').trim());
  const redisUrlIsLocal = hasRedisUrl && /^(redis:\/\/)(:?[^@]*@)?(localhost|127\.0\.0\.1|\[::1\]|::1)(:\d+)?/i.test(process.env.REDIS_URL);

  if (process.env.NODE_ENV === 'production') {
    if (redisUrlIsLocal) return false;
    if (hasRedisHost && hasRedisPort && !bindsToLocalhost(process.env.REDIS_HOST)) {
      return true;
    }
    return false;
  }

  if (hasRedisUrl) return true;
  return Boolean(hasRedisHost && hasRedisPort);
};

const formatError = (err) => {
  if (!err) return null;
  // AggregateError in Node may contain an `errors` iterable with inner errors
  if (typeof AggregateError !== 'undefined' && err instanceof AggregateError) {
    try {
      const inner = Array.from(err.errors || []).map(e => (e && (e.message || String(e))) || String(e));
      return inner.length ? inner.join(' | ') : (err.message || String(err));
    } catch (e) {
      // fallback
      return err.message || String(err);
    }
  }
  if (err && Array.isArray(err.errors)) {
    const inner = err.errors.map(e => (e && (e.message || String(e))) || String(e));
    return inner.length ? inner.join(' | ') : (err.message || String(err));
  }
  return err.message || String(err);
};

const initRedis = async () => {
  const redisEnabled = isRedisEnabled();

  if (!redisEnabled) {
    logger.info('Redis not configured for this environment; skipping Redis initialization');
    return null;
  }

  try {
    let redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      const host = process.env.REDIS_HOST || 'localhost';
      const port = process.env.REDIS_PORT || 6379;
      const password = process.env.REDIS_PASSWORD;

      if (password) {
        redisUrl = `redis://:${password}@${host}:${port}`;
      } else {
        redisUrl = `redis://${host}:${port}`;
      }
    }

    logger.info(`Attempting to connect to Redis at: ${redisUrl.replace(/:[^:]+@/, ':***@')}`);

    redisClient = redis.createClient({
      url: redisUrl,
      database: process.env.REDIS_DB || 0,
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
    logger.info('Redis client initialized successfully');
    return redisClient;
  } catch (error) {
    redisClient = null;
    const message = formatError(error);
    logger.warn('Redis unavailable; continuing without cache', { name: error && error.name, message, stack: error && error.stack });
    return null;
  }
};

const getRedisClient = () => redisClient;

const cacheData = async (key, data, ttl = 3600) => {
  if (!redisClient) return false;
  try {
    await redisClient.setEx(key, ttl, JSON.stringify(data));
    return true;
  } catch (error) {
    logger.error('Redis cache error', { error: String(error) });
    return false;
  }
};

const getCachedData = async (key) => {
  if (!redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Redis get error', { error: String(error) });
    return null;
  }
};

const clearCache = async (pattern) => {
  if (!redisClient) return false;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
    return true;
  } catch (error) {
    logger.error('Redis clear cache error', { error: String(error) });
    return false;
  }
};

module.exports = { initRedis, getRedisClient, cacheData, getCachedData, clearCache };