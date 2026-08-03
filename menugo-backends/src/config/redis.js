const redis = require('redis');
const { logger } = require('../utils/logger');

let redisClient = null;

const initRedis = async () => {
  const hasRedisConfig = Boolean(process.env.REDIS_URL || process.env.REDIS_HOST || process.env.REDIS_PORT);
  const redisEnabled = process.env.REDIS_ENABLED === 'true' || hasRedisConfig;

  if (!redisEnabled) {
    logger.info('Redis not configured; skipping Redis initialization');
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
      const message = err?.message || String(err);
      logger.warn('Redis unavailable; continuing without cache', { message });
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    await redisClient.connect();
    logger.info('Redis client initialized successfully');
    return redisClient;
  } catch (error) {
    redisClient = null;
    const message = error?.message || String(error);
    logger.warn('Redis unavailable; continuing without cache', { message });
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