import { USER_ROLES } from './constants'

export const permissions = {
  // Restaurant permissions
  VIEW_RESTAURANTS: 'view_restaurants',
  CREATE_RESTAURANT: 'create_restaurant',
  EDIT_RESTAURANT: 'edit_restaurant',
  DELETE_RESTAURANT: 'delete_restaurant',
  VERIFY_RESTAURANT: 'verify_restaurant',

  // User permissions
  VIEW_USERS: 'view_users',
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',
  MANAGE_ROLES: 'manage_roles',

  // Order permissions
  VIEW_ORDERS: 'view_orders',
  CREATE_ORDER: 'create_order',
  EDIT_ORDER: 'edit_order',
  DELETE_ORDER: 'delete_order',
  VERIFY_ORDER: 'verify_order',

  // Menu permissions
  VIEW_MENU: 'view_menu',
  CREATE_MENU_ITEM: 'create_menu_item',
  EDIT_MENU_ITEM: 'edit_menu_item',
  DELETE_MENU_ITEM: 'delete_menu_item',

  // Table permissions
  VIEW_TABLES: 'view_tables',
  CREATE_TABLE: 'create_table',
  EDIT_TABLE: 'edit_table',
  DELETE_TABLE: 'delete_table',
  ASSIGN_TABLE: 'assign_table',

  // Staff permissions
  VIEW_STAFF: 'view_staff',
  CREATE_STAFF: 'create_staff',
  EDIT_STAFF: 'edit_staff',
  DELETE_STAFF: 'delete_staff',

  // Analytics permissions
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_REPORTS: 'export_reports',

  // Settings permissions
  VIEW_SETTINGS: 'view_settings',
  EDIT_SETTINGS: 'edit_settings',
}

export const rolePermissions = {
  [USER_ROLES.PLATFORM_ADMIN]: Object.values(permissions),
  
  [USER_ROLES.RESTAURANT_ADMIN]: [
    permissions.VIEW_RESTAURANTS,
    permissions.EDIT_RESTAURANT,
    permissions.VIEW_ORDERS,
    permissions.VERIFY_ORDER,
    permissions.VIEW_MENU,
    permissions.CREATE_MENU_ITEM,
    permissions.EDIT_MENU_ITEM,
    permissions.DELETE_MENU_ITEM,
    permissions.VIEW_TABLES,
    permissions.CREATE_TABLE,
    permissions.EDIT_TABLE,
    permissions.DELETE_TABLE,
    permissions.ASSIGN_TABLE,
    permissions.VIEW_STAFF,
    permissions.CREATE_STAFF,
    permissions.EDIT_STAFF,
    permissions.DELETE_STAFF,
    permissions.VIEW_ANALYTICS,
    permissions.EXPORT_REPORTS,
    permissions.VIEW_SETTINGS,
    permissions.EDIT_SETTINGS,
  ],
  
  [USER_ROLES.WAITER]: [
    permissions.VIEW_ORDERS,
    permissions.CREATE_ORDER,
    permissions.EDIT_ORDER,
    permissions.VERIFY_ORDER,
    permissions.VIEW_MENU,
    permissions.VIEW_TABLES,
  ],
  
  [USER_ROLES.CUSTOMER]: [
    permissions.VIEW_MENU,
    permissions.CREATE_ORDER,
    permissions.VIEW_ORDERS,
  ],
  
  [USER_ROLES.SUPPORT_AGENT]: [
    permissions.VIEW_USERS,
    permissions.VIEW_ORDERS,
    permissions.VIEW_RESTAURANTS,
  ],
}

export const hasPermission = (userRole, permission, userPermissions = []) => {
  if (userRole === USER_ROLES.PLATFORM_ADMIN) return true
  if (userPermissions.includes(permission)) return true
  return rolePermissions[userRole]?.includes(permission) || false
}

export const hasAnyPermission = (userRole, permissionsList, userPermissions = []) => {
  return permissionsList.some(permission => hasPermission(userRole, permission, userPermissions))
}

export const hasAllPermissions = (userRole, permissionsList, userPermissions = []) => {
  return permissionsList.every(permission => hasPermission(userRole, permission, userPermissions))
}

export const canManageRestaurant = (userRole, restaurantOwnerId, currentUserId) => {
  if (userRole === USER_ROLES.PLATFORM_ADMIN) return true
  if (userRole === USER_ROLES.RESTAURANT_ADMIN && restaurantOwnerId === currentUserId) return true
  return false
}

export const canManageUser = (userRole, targetUserRole) => {
  if (userRole === USER_ROLES.PLATFORM_ADMIN) return true
  if (userRole === USER_ROLES.RESTAURANT_ADMIN && targetUserRole !== USER_ROLES.PLATFORM_ADMIN) return true
  return false
}

export const canViewOrder = (userRole, orderRestaurantId, userRestaurantId) => {
  if (userRole === USER_ROLES.PLATFORM_ADMIN) return true
  if (userRole === USER_ROLES.RESTAURANT_ADMIN && orderRestaurantId === userRestaurantId) return true
  if (userRole === USER_ROLES.WAITER && orderRestaurantId === userRestaurantId) return true
  return false
}