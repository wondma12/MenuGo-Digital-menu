const { getCache, setCache, deleteCache, clearCachePattern } = require('./redisService');
const { logger } = require('../utils/logger');

// Cache keys
const CACHE_KEYS = {
  RESTAURANT: (id) => `restaurant:${id}`,
  MENU: (restaurantId) => `menu:${restaurantId}`,
  ORDER: (id) => `order:${id}`,
  USER: (id) => `user:${id}`,
  DASHBOARD: (restaurantId) => `dashboard:${restaurantId}`,
  ANALYTICS: (restaurantId, type) => `analytics:${restaurantId}:${type}`,
};

// Cache middleware for Express
const cacheMiddleware = (duration = 300, keyGenerator = null) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = keyGenerator ? keyGenerator(req) : `route:${req.originalUrl}`;
    
    try {
      const cachedData = await getCache(key);
      if (cachedData) {
        return res.json({
          success: true,
          data: cachedData,
          cached: true,
        });
      }

      // Store original json method
      const originalJson = res.json;
      
      // Override json method
      res.json = function (body) {
        if (body.success && body.data && !body.cached) {
          setCache(key, body.data, duration).catch(err => {
            logger.error('Cache storage error:', err);
          });
        }
        originalJson.call(this, body);
      };

      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

// Cache restaurant data
const cacheRestaurant = async (restaurantId, data) => {
  return setCache(CACHE_KEYS.RESTAURANT(restaurantId), data, 3600);
};

// Get cached restaurant
const getCachedRestaurant = async (restaurantId) => {
  return getCache(CACHE_KEYS.RESTAURANT(restaurantId));
};

// Clear restaurant cache
const clearRestaurantCache = async (restaurantId) => {
  await deleteCache(CACHE_KEYS.RESTAURANT(restaurantId));
  await clearCachePattern(`menu:${restaurantId}*`);
  await clearCachePattern(`dashboard:${restaurantId}*`);
  await clearCachePattern(`analytics:${restaurantId}*`);
};

// Cache menu data
const cacheMenu = async (restaurantId, data) => {
  return setCache(CACHE_KEYS.MENU(restaurantId), data, 1800);
};

// Get cached menu
const getCachedMenu = async (restaurantId) => {
  return getCache(CACHE_KEYS.MENU(restaurantId));
};

// Clear menu cache
const clearMenuCache = async (restaurantId) => {
  await deleteCache(CACHE_KEYS.MENU(restaurantId));
};

// Cache user data
const cacheUser = async (userId, data) => {
  return setCache(CACHE_KEYS.USER(userId), data, 3600);
};

// Get cached user
const getCachedUser = async (userId) => {
  return getCache(CACHE_KEYS.USER(userId));
};

// Clear user cache
const clearUserCache = async (userId) => {
  await deleteCache(CACHE_KEYS.USER(userId));
};

module.exports = {
  CACHE_KEYS,
  cacheMiddleware,
  cacheRestaurant,
  getCachedRestaurant,
  clearRestaurantCache,
  cacheMenu,
  getCachedMenu,
  clearMenuCache,
  cacheUser,
  getCachedUser,
  clearUserCache,
};
