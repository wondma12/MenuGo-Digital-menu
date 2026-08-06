const redis = require('redis');
const { logger } = require('../utils/logger');

let redisClient = null;

const isRedisEnabled = () => {
  const explicitEnabled = process.env.REDIS_ENABLED === 'true' || process.env.REDIS_ENABLED === '1';
  const explicitDisabled = process.env.REDIS_ENABLED === 'false' || process.env.REDIS_ENABLED === '0';
  const hasRedisUrl = Boolean(process.env.REDIS_URL);
  const hasRedisHost = Boolean(process.env.REDIS_HOST);
  const hasRedisPort = Boolean(process.env.REDIS_PORT);
  const hasRedisConfig = hasRedisUrl || (hasRedisHost && hasRedisPort);

  if (explicitDisabled) return false;
  if (explicitEnabled) {
    if (!hasRedisConfig) {
      logger.warn('Redis explicitly enabled, but REDIS_URL or REDIS_HOST and REDIS_PORT are not configured. Skipping Redis initialization.');
      return false;
    }
    return true;
  }

  const bindsToLocalhost = (value) => /^(localhost|127\.0\.0\.1|\[::1\]|::1)$/i.test(String(value || '').trim());
  const redisUrlIsLocal = hasRedisUrl && /^(redis:\/\/)(:?[^@]*@)?(localhost|127\.0\.0\.1|\[::1\]|::1)(:\d+)?/i.test(process.env.REDIS_URL);

  if (hasRedisUrl && !redisUrlIsLocal) return true;
  if (hasRedisHost && hasRedisPort && !bindsToLocalhost(process.env.REDIS_HOST)) return true;

  // Only connect to localhost Redis when explicitly enabled.
  return false;
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

const cleanupRedisClient = async () => {
  if (!redisClient) return;
  const clientToClose = redisClient;
  redisClient = null;
  clientToClose.removeAllListeners();
  try {
    await clientToClose.disconnect();
  } catch (cleanupError) {
    // ignore cleanup failures, redis is already unavailable
  }
};

const initRedis = async () => {
  const redisEnabled = isRedisEnabled();

  if (!redisEnabled) {
    logger.info('Redis not configured for this environment; skipping Redis initialization');
    return null;
  }

  try {
    const useTls = ['true', '1', 'yes'].includes(String(process.env.REDIS_TLS || '').toLowerCase());
    let redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
      const host = process.env.REDIS_HOST || 'localhost';
      const port = process.env.REDIS_PORT || 6379;
      const username = process.env.REDIS_USERNAME;
      const password = process.env.REDIS_PASSWORD;
      const scheme = useTls ? 'rediss' : 'redis';
      const auth = username
        ? `${encodeURIComponent(username)}:${encodeURIComponent(password || '')}@`
        : password
          ? `:${encodeURIComponent(password)}@`
          : '';

      redisUrl = `${scheme}://${auth}${host}:${port}`;
    } else if (useTls && /^redis:\/\//i.test(redisUrl)) {
      redisUrl = redisUrl.replace(/^redis:\/\//i, 'rediss://');
    }

    logger.info(`Attempting to connect to Redis at: ${redisUrl.replace(/:[^:]+@/, ':***@')}`);

    const redisOptions = {
      url: redisUrl,
      database: process.env.REDIS_DB || 0,
      disableOfflineQueue: true,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: false,
      },
    };

    if (useTls) {
      redisOptions.socket.tls = true;
    }

    redisClient = redis.createClient(redisOptions);

    let redisErrorCount = 0;
    const maxRedisErrorLogs = 1;

    redisClient.on('error', (err) => {
      const message = formatError(err);
      if (redisErrorCount < maxRedisErrorLogs) {
        logger.warn('Redis unavailable; continuing without cache', { name: err && err.name, message, stack: err && err.stack });
      } else {
        logger.debug('Redis error after initial failure', { name: err && err.name, message });
      }
      redisErrorCount += 1;
    });

    redisClient.on('end', () => {
      logger.debug('Redis connection ended');
    });

    redisClient.on('connect', () => {
      logger.info('Redis connected successfully');
    });

    await redisClient.connect();
    logger.info('Redis client initialized successfully');
    return redisClient;
  } catch (error) {
    await cleanupRedisClient();
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