// Permission definitions
const PERMISSIONS = {
  // Restaurant permissions
  VIEW_RESTAURANT: 'view_restaurant',
  CREATE_RESTAURANT: 'create_restaurant',
  UPDATE_RESTAURANT: 'update_restaurant',
  DELETE_RESTAURANT: 'delete_restaurant',
  VERIFY_RESTAURANT: 'verify_restaurant',
  
  // Menu permissions
  VIEW_MENU: 'view_menu',
  CREATE_MENU_ITEM: 'create_menu_item',
  UPDATE_MENU_ITEM: 'update_menu_item',
  DELETE_MENU_ITEM: 'delete_menu_item',
  MANAGE_CATEGORIES: 'manage_categories',
  
  // Order permissions
  VIEW_ORDERS: 'view_orders',
  CREATE_ORDER: 'create_order',
  UPDATE_ORDER_STATUS: 'update_order_status',
  VERIFY_ORDER: 'verify_order',
  CANCEL_ORDER: 'cancel_order',
  
  // Table permissions
  VIEW_TABLES: 'view_tables',
  CREATE_TABLE: 'create_table',
  UPDATE_TABLE: 'update_table',
  DELETE_TABLE: 'delete_table',
  MANAGE_RESERVATIONS: 'manage_reservations',
  
  // Staff permissions
  VIEW_STAFF: 'view_staff',
  CREATE_STAFF: 'create_staff',
  UPDATE_STAFF: 'update_staff',
  DELETE_STAFF: 'delete_staff',
  MANAGE_ROLES: 'manage_roles',
  
  // Inventory permissions
  VIEW_INVENTORY: 'view_inventory',
  CREATE_INVENTORY: 'create_inventory',
  UPDATE_INVENTORY: 'update_inventory',
  DELETE_INVENTORY: 'delete_inventory',
  ADJUST_STOCK: 'adjust_stock',
  
  // Coupon permissions
  VIEW_COUPONS: 'view_coupons',
  CREATE_COUPON: 'create_coupon',
  UPDATE_COUPON: 'update_coupon',
  DELETE_COUPON: 'delete_coupon',
  
  // Analytics permissions
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_REPORTS: 'export_reports',
  
  // Settings permissions
  VIEW_SETTINGS: 'view_settings',
  UPDATE_SETTINGS: 'update_settings',
};

// Role-based permission mappings
const ROLE_PERMISSIONS = {
  platform_admin: Object.values(PERMISSIONS),
  
  restaurant_admin: [
    PERMISSIONS.VIEW_RESTAURANT,
    PERMISSIONS.UPDATE_RESTAURANT,
    PERMISSIONS.VIEW_MENU,
    PERMISSIONS.CREATE_MENU_ITEM,
    PERMISSIONS.UPDATE_MENU_ITEM,
    PERMISSIONS.DELETE_MENU_ITEM,
    PERMISSIONS.MANAGE_CATEGORIES,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.UPDATE_ORDER_STATUS,
    PERMISSIONS.CANCEL_ORDER,
    PERMISSIONS.VIEW_TABLES,
    PERMISSIONS.CREATE_TABLE,
    PERMISSIONS.UPDATE_TABLE,
    PERMISSIONS.DELETE_TABLE,
    PERMISSIONS.MANAGE_RESERVATIONS,
    PERMISSIONS.VIEW_STAFF,
    PERMISSIONS.CREATE_STAFF,
    PERMISSIONS.UPDATE_STAFF,
    PERMISSIONS.DELETE_STAFF,
    PERMISSIONS.MANAGE_ROLES,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.CREATE_INVENTORY,
    PERMISSIONS.UPDATE_INVENTORY,
    PERMISSIONS.ADJUST_STOCK,
    PERMISSIONS.VIEW_COUPONS,
    PERMISSIONS.CREATE_COUPON,
    PERMISSIONS.UPDATE_COUPON,
    PERMISSIONS.DELETE_COUPON,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.EXPORT_REPORTS,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.UPDATE_SETTINGS,
  ],
  
  manager: [
    PERMISSIONS.VIEW_RESTAURANT,
    PERMISSIONS.VIEW_MENU,
    PERMISSIONS.CREATE_MENU_ITEM,
    PERMISSIONS.UPDATE_MENU_ITEM,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.UPDATE_ORDER_STATUS,
    PERMISSIONS.VIEW_TABLES,
    PERMISSIONS.UPDATE_TABLE,
    PERMISSIONS.MANAGE_RESERVATIONS,
    PERMISSIONS.VIEW_STAFF,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.VIEW_COUPONS,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_SETTINGS,
  ],
  
  waiter: [
    PERMISSIONS.VIEW_MENU,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.CREATE_ORDER,
    PERMISSIONS.UPDATE_ORDER_STATUS,
    PERMISSIONS.VERIFY_ORDER,
    PERMISSIONS.VIEW_TABLES,
  ],
  
  chef: [
    PERMISSIONS.VIEW_MENU,
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.UPDATE_ORDER_STATUS,
    PERMISSIONS.VIEW_INVENTORY,
  ],
  
  cashier: [
    PERMISSIONS.VIEW_ORDERS,
    PERMISSIONS.UPDATE_ORDER_STATUS,
    PERMISSIONS.VIEW_COUPONS,
  ],
  
  customer: [
    PERMISSIONS.VIEW_MENU,
    PERMISSIONS.CREATE_ORDER,
    PERMISSIONS.VIEW_ORDERS,
  ],
};

// Check if user has permission
const hasPermission = (userRole, userPermissions, requiredPermission) => {
  if (userRole === 'platform_admin') return true;
  
  // Check role-based permissions
  const rolePerms = ROLE_PERMISSIONS[userRole] || [];
  if (rolePerms.includes(requiredPermission)) return true;
  
  // Check custom permissions
  if (userPermissions && userPermissions[requiredPermission]) return true;
  
  return false;
};

// Check if user has any of the permissions
const hasAnyPermission = (userRole, userPermissions, requiredPermissions) => {
  return requiredPermissions.some(perm => hasPermission(userRole, userPermissions, perm));
};

// Check if user has all permissions
const hasAllPermissions = (userRole, userPermissions, requiredPermissions) => {
  return requiredPermissions.every(perm => hasPermission(userRole, userPermissions, perm));
};

// Get permissions for role
const getPermissionsForRole = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

// Middleware to check permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const userPermissions = req.user.permissions || {};
    
    if (!hasPermission(userRole, userPermissions, permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission denied: ${permission} required`,
      });
    }
    
    next();
  };
};

// Middleware to check any of permissions
const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    const userRole = req.user.role;
    const userPermissions = req.user.permissions || {};
    
    if (!hasAnyPermission(userRole, userPermissions, permissions)) {
      return res.status(403).json({
        success: false,
        message: `Permission denied. Required one of: ${permissions.join(', ')}`,
      });
    }
    
    next();
  };
};

module.exports = {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getPermissionsForRole,
  requirePermission,
  requireAnyPermission,
};