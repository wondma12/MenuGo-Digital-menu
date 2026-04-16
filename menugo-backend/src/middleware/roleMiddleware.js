const { ApiError } = require('../utils/apiError');
const { RestaurantStaff, Restaurant, Waiter, User } = require('../models');

// Restrict access to specific roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action');
    }
    next();
  };
};

// Check if user is platform admin
const isPlatformAdmin = (req, res, next) => {
  if (req.user.role !== 'platform_admin') {
    throw new ApiError(403, 'Access denied. Platform admin rights required.');
  }
  next();
};

// Check if user is restaurant admin
const isRestaurantAdmin = async (req, res, next) => {
  // Platform admin allowed
  if (req.user.role === 'platform_admin') {
    return next();
  }

  if (req.user.role !== 'restaurant_admin') {
    throw new ApiError(403, 'Access denied. Restaurant admin rights required.');
  }

  // Resolve restaurantId from various places
  let restaurantId = req.params.restaurantId || req.query?.restaurantId || req.body?.restaurant_id || req.body?.restaurantId;

  const staffIdParam = req.params.staffId || req.params.id || req.params.staff_id;
  let staff = null;
  if (!restaurantId && staffIdParam) {
    staff = await RestaurantStaff.findByPk(staffIdParam);
    if (staff) restaurantId = staff.restaurant_id;
  }

  if (!restaurantId) {
    const assign = await RestaurantStaff.findOne({ where: { user_id: req.user.id } });
    if (assign) restaurantId = assign.restaurant_id;
  }

  if (!restaurantId) {
    throw new ApiError(403, 'Restaurant context required');
  }

  const restaurant = await Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  if (restaurant.owner_id !== req.user.id) {
    const staffRecord = staff || await RestaurantStaff.findOne({
      where: { restaurant_id: restaurantId, user_id: req.user.id, role: 'admin', is_active: true },
    });

    if (!staffRecord) {
      throw new ApiError(403, 'You are not authorized for this restaurant');
    }
  }

  next();
};

// Check if user is restaurant owner
const isRestaurantOwner = async (req, res, next) => {
  // Platform admin allowed
  if (req.user.role === 'platform_admin') {
    const rid = req.params.restaurantId || req.query?.restaurantId || req.body?.restaurant_id || req.body?.restaurantId;
    if (rid) req.restaurant = await Restaurant.findByPk(rid);
    return next();
  }

  // Resolve restaurantId from params, query, body or resource ids (e.g., table id)
  let restaurantId = req.params.restaurantId || req.query?.restaurantId || req.body?.restaurant_id || req.body?.restaurantId;

  // Try inferring from common resource id param (such as table id)
  if (!restaurantId && req.params?.id) {
    const { Table } = require('../models');
    const table = await Table.findByPk(req.params.id).catch(() => null);
    if (table) restaurantId = table.restaurant_id;
    else {
      const maybeRestaurant = await Restaurant.findByPk(req.params.id).catch(() => null);
      if (maybeRestaurant) restaurantId = maybeRestaurant.id;
    }
  }

  if (!restaurantId) {
    throw new ApiError(403, 'Restaurant context required');
  }

  const restaurant = await Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  if (restaurant.owner_id !== req.user.id) {
    throw new ApiError(403, 'You are not the owner of this restaurant');
  }

  req.restaurant = restaurant;
  next();
};

// Check if user is restaurant staff (any role)
const isRestaurantStaff = async (req, res, next) => {
  // Platform admin can access any restaurant
  if (req.user.role === 'platform_admin') {
    return next();
  }

  // Resolve restaurantId from params, query, or body
  let restaurantId = req.params.restaurantId || req.query?.restaurantId || req.body?.restaurant_id || req.body?.restaurantId;

  // If not provided, try inferring from staff identifier in params
  const staffIdParam = req.params.staffId || req.params.id || req.params.staff_id;
  let staff = null;
  if (!restaurantId && staffIdParam) {
    staff = await RestaurantStaff.findByPk(staffIdParam);
    if (staff) restaurantId = staff.restaurant_id;
  }

  // If still not found, try inferring from the authenticated user's own staff assignment
  if (!restaurantId) {
    const assign = await RestaurantStaff.findOne({ where: { user_id: req.user.id } });
    if (assign) restaurantId = assign.restaurant_id;
  }

  // Deny if we cannot determine a restaurant context for non-platform users
  if (!restaurantId) {
    throw new ApiError(403, 'Restaurant context required');
  }

  // Validate restaurant exists
  const restaurant = await Restaurant.findByPk(restaurantId);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  // If the user is the restaurant owner allow
  if (restaurant.owner_id === req.user.id) {
    req.staffRole = 'owner';
    return next();
  }

  // If we haven't already resolved a staff record, fetch the association for the current user
  if (!staff) {
    staff = await RestaurantStaff.findOne({
      where: { restaurant_id: restaurantId, user_id: req.user.id, is_active: true },
    });
  }

  if (!staff) {
    throw new ApiError(403, 'You are not authorized for this restaurant');
  }

  req.staffRole = staff.role;
  req.staffPermissions = staff.permissions;
  next();
};

// Check if user is waiter
const isWaiter = async (req, res, next) => {
  const { restaurantId } = req.params;
  
  if (req.user.role === 'platform_admin') {
    return next();
  }
  
  if (req.user.role !== 'waiter') {
    throw new ApiError(403, 'Access denied. Waiter rights required.');
  }
  
  const waiter = await Waiter.findOne({
    where: { 
      user_id: req.user.id,
    },
    include: [{ model: RestaurantStaff, as: 'staff_details', where: { is_active: true } }],
  });

  if (!waiter) {
    throw new ApiError(403, 'You are not registered as a waiter');
  }
  
  // Check if waiter belongs to the restaurant
  if (restaurantId && waiter.restaurant_id !== restaurantId) {
    throw new ApiError(403, 'You are not assigned to this restaurant');
  }
  
  // Check if waiter is on duty
  if (!waiter.is_on_duty && req.method !== 'GET') {
    throw new ApiError(403, 'You are not on duty. Please start your shift first.');
  }

  req.waiter = waiter;
  req.waiterId = waiter.id;
  next();
};

// Check if waiter is on duty
const isWaiterOnDuty = async (req, res, next) => {
  const waiter = await Waiter.findOne({
    where: { user_id: req.user.id, is_on_duty: true },
  });

  if (!waiter && req.user.role !== 'platform_admin') {
    throw new ApiError(403, 'You must be on duty to perform this action');
  }

  req.waiter = waiter;
  req.waiterId = waiter?.id;
  next();
};

// Check permissions for specific actions
const checkPermission = (permission) => {
  return async (req, res, next) => {
    const { restaurantId } = req.params;
    
    // Platform admin has all permissions
    if (req.user.role === 'platform_admin') {
      return next();
    }
    
    // Restaurant owner has all permissions for their restaurant
    if (req.user.role === 'restaurant_admin') {
      const restaurant = await Restaurant.findByPk(restaurantId);
      if (restaurant && restaurant.owner_id === req.user.id) {
        return next();
      }
    }

    // Check staff permissions
    const staff = await RestaurantStaff.findOne({
      where: {
        restaurant_id: restaurantId,
        user_id: req.user.id,
        is_active: true,
      },
    });

    if (!staff || !staff.permissions || !staff.permissions[permission]) {
      throw new ApiError(403, `You don't have permission to ${permission.replace(/_/g, ' ')}`);
    }

    next();
  };
};

// Check multiple permissions (AND condition)
const checkPermissions = (permissions) => {
  return async (req, res, next) => {
    const { restaurantId } = req.params;
    
    if (req.user.role === 'platform_admin') {
      return next();
    }
    
    if (req.user.role === 'restaurant_admin') {
      const restaurant = await Restaurant.findByPk(restaurantId);
      if (restaurant && restaurant.owner_id === req.user.id) {
        return next();
      }
    }

    const staff = await RestaurantStaff.findOne({
      where: {
        restaurant_id: restaurantId,
        user_id: req.user.id,
        is_active: true,
      },
    });

    if (!staff) {
      throw new ApiError(403, 'You are not authorized for this restaurant');
    }

    const missingPermissions = permissions.filter(p => !staff.permissions?.[p]);
    
    if (missingPermissions.length > 0) {
      throw new ApiError(403, `Missing permissions: ${missingPermissions.join(', ')}`);
    }

    next();
  };
};

// Check if user can access the requested table
const canAccessTable = async (req, res, next) => {
  const { tableId, restaurantId } = req.params;
  const { Table } = require('../models');
  
  const table = await Table.findByPk(tableId);
  if (!table) {
    throw new ApiError(404, 'Table not found');
  }
  
  // Platform admin can access any table
  if (req.user.role === 'platform_admin') {
    req.table = table;
    return next();
  }
  
  // Restaurant owner can access tables in their restaurant
  if (req.user.role === 'restaurant_admin') {
    const restaurant = await Restaurant.findByPk(table.restaurant_id);
    if (restaurant && restaurant.owner_id === req.user.id) {
      req.table = table;
      return next();
    }
  }
  
  // Waiter can only access tables assigned to them
  if (req.user.role === 'waiter') {
    const waiter = await Waiter.findOne({ where: { user_id: req.user.id } });
    if (waiter && (table.current_waiter_id === waiter.id || waiter.assigned_tables?.includes(table.id))) {
      req.table = table;
      return next();
    }
  }
  
  throw new ApiError(403, 'You do not have access to this table');
};

// Check if user can access the requested order
const canAccessOrder = async (req, res, next) => {
  const { orderId } = req.params;
  const { Order } = require('../models');
  
  const order = await Order.findByPk(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }
  
  // Platform admin can access any order
  if (req.user.role === 'platform_admin') {
    req.order = order;
    return next();
  }
  
  // Restaurant owner can access orders in their restaurant
  if (req.user.role === 'restaurant_admin') {
    const restaurant = await Restaurant.findByPk(order.restaurant_id);
    if (restaurant && restaurant.owner_id === req.user.id) {
      req.order = order;
      return next();
    }
  }
  
  // Waiter can only access orders assigned to them
  if (req.user.role === 'waiter') {
    const waiter = await Waiter.findOne({ where: { user_id: req.user.id } });
    if (waiter && order.waiter_id === waiter.id) {
      req.order = order;
      return next();
    }
  }
  
  // Customer can access their own orders
  if (req.user.role === 'customer' && order.user_id === req.user.id) {
    req.order = order;
    return next();
  }
  
  throw new ApiError(403, 'You do not have access to this order');
};

// Check if user is customer
const isCustomer = (req, res, next) => {
  if (req.user.role !== 'customer' && req.user.role !== 'platform_admin') {
    throw new ApiError(403, 'Access denied. Customer rights required.');
  }
  next();
};

// Check if user is support agent
const isSupportAgent = (req, res, next) => {
  if (req.user.role !== 'support_agent' && req.user.role !== 'platform_admin') {
    throw new ApiError(403, 'Access denied. Support agent rights required.');
  }
  next();
};

// Get user role hierarchy
const getRoleHierarchy = (role) => {
  const hierarchy = {
    platform_admin: 5,
    restaurant_admin: 4,
    manager: 3,
    waiter: 2,
    support_agent: 2,
    customer: 1,
  };
  return hierarchy[role] || 0;
};

// Check if user has higher or equal role
const hasMinRole = (minRole) => {
  return (req, res, next) => {
    const userLevel = getRoleHierarchy(req.user.role);
    const requiredLevel = getRoleHierarchy(minRole);
    
    if (userLevel < requiredLevel) {
      throw new ApiError(403, `Minimum role required: ${minRole}`);
    }
    next();
  };
};

// Combine multiple role checks
const combineMiddleware = (...middlewares) => {
  return async (req, res, next) => {
    try {
      for (const middleware of middlewares) {
        await new Promise((resolve, reject) => {
          middleware(req, res, (err) => {
            if (err) reject(err);
            resolve();
          });
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  restrictTo,
  isPlatformAdmin,
  isRestaurantAdmin,
  isRestaurantOwner,
  isRestaurantStaff,
  isWaiter,
  isWaiterOnDuty,
  checkPermission,
  checkPermissions,
  canAccessTable,
  canAccessOrder,
  isCustomer,
  isSupportAgent,
  getRoleHierarchy,
  hasMinRole,
  combineMiddleware,
};