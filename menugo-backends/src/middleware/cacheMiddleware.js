const { getCachedData, cacheData } = require('../config/redis');

// Cache middleware for GET requests
const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create cache key from URL and user role
    const key = `cache:${req.user?.role || 'public'}:${req.originalUrl}`;
    
    try {
      const cachedData = await getCachedData(key);

      if (cachedData) {
        return res.json({
          success: true,
          data: cachedData,
          cached: true,
        });
      }

      // Store original json method
      const originalJson = res.json;
      
      // Override json method to cache response
      res.json = function(body) {
        if (body.success && body.data && !body.cached) {
          cacheData(key, body.data, duration).catch(err => {
            console.error('Cache storage error:', err);
          });
        }
        originalJson.call(this, body);
      };

      next();
    } catch (error) {
      // If Redis fails, continue without cache
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

// Clear cache for specific pattern
const clearCache = async (pattern) => {
  const { clearCache: clearRedisCache } = require('../config/redis');
  return await clearRedisCache(pattern);
};

// Invalidate restaurant cache
const invalidateRestaurantCache = async (restaurantId) => {
  await clearCache(`*restaurant_${restaurantId}*`);
  await clearCache(`*menu_${restaurantId}*`);
};

// Invalidate user cache
const invalidateUserCache = async (userId) => {
  await clearCache(`*user_${userId}*`);
};

module.exports = {
  cacheMiddleware,
  clearCache,
  invalidateRestaurantCache,
  invalidateUserCache,
};