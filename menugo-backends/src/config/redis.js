const redis = require('redis');
const { logger } = require('../utils/logger');

let redisClient = null;

const initRedis = async () => {
  try {
    // Build Redis URL - gracefully fall back if environment variables are not set
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
    });

    redisClient.on('error', (err) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    await redisClient.connect();
    logger.info('Redis client initialized successfully');
    return redisClient;
  } catch (error) {
    logger.warn('Failed to connect to Redis (this is optional for development):', error?.message || error);
    // Don't throw - Redis is optional for development
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
    logger.error('Redis cache error:', error);
    return false;
  }
};

const getCachedData = async (key) => {
  if (!redisClient) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    logger.error('Redis get error:', error);
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
    logger.error('Redis clear cache error:', error);
    return false;
  }
};

module.exports = { initRedis, getRedisClient, cacheData, getCachedData, clearCache };