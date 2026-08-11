// src/middleware/kitchenMiddleware.js
const db = require('../config/database');

const checkKitchenAccess = async (req, res, next) => {
  try {
    const { restaurantId } = req.params;
    const userId = req.user.id;
    
    // Check if user has access to this kitchen
    const [userRestaurant] = await db.execute(
      `SELECT role FROM restaurant_staff 
       WHERE user_id = ? AND restaurant_id = ?`,
      [userId, restaurantId],
    );
    
    const allowedRoles = ['kitchen', 'chef', 'restaurant_admin', 'admin'];
    
    if (userRestaurant.length === 0 && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this kitchen',
      });
    }
    
    if (userRestaurant.length > 0 && !allowedRoles.includes(userRestaurant[0].role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions for kitchen access',
      });
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const validateOrderAssignment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { stationId } = req.body;
    
    // Check if order exists and is in correct state
    const [order] = await db.execute(
      'SELECT status FROM kitchen_orders WHERE id = ?',
      [orderId],
    );
    
    if (order.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Order not found',
      });
    }
    
    if (order[0].status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Order cannot be assigned, invalid status',
      });
    }
    
    // Check if station exists
    if (stationId) {
      const [station] = await db.execute(
        'SELECT id FROM kitchen_stations WHERE id = ? AND is_active = TRUE',
        [stationId],
      );
      
      if (station.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Station not found or inactive',
        });
      }
    }
    
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const rateLimitKitchen = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: 'Too many kitchen requests, please slow down',
};

module.exports = {
  checkKitchenAccess,
  validateOrderAssignment,
  rateLimitKitchen,
};
