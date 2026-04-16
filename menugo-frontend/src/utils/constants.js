// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_VERIFICATION: '/auth/resend-verification',
    CHANGE_PASSWORD: '/auth/change-password',
    UPDATE_PROFILE: '/auth/profile',
    TWO_FACTOR_SETUP: '/auth/2fa/setup',
    TWO_FACTOR_VERIFY: '/auth/2fa/verify',
    TWO_FACTOR_DISABLE: '/auth/2fa/disable',
  },
  USERS: {
    BASE: '/users',
    ROLES: '/users/roles',
    ACTIVITY: '/users/activity',
  },
  RESTAURANTS: {
    BASE: '/restaurants',
    VERIFY: '/restaurants/verify',
    DOCUMENTS: '/restaurants/documents',
    SETTINGS: '/restaurants/settings',
    STATS: '/restaurants/stats',
  },
  MENU: {
    BASE: '/menu',
    BULK: '/menu/bulk',
    IMPORT: '/menu/import',
    EXPORT: '/menu/export',
    TEMPLATE: '/menu/template',
  },
  ORDERS: {
    BASE: '/orders',
    STATUS: '/orders/status',
    VERIFY: '/orders/verify',
    REJECT: '/orders/reject',
    CANCEL: '/orders/cancel',
  },
  TABLES: {
    BASE: '/tables',
    ASSIGN: '/tables/assign',
    TRANSFER: '/tables/transfer',
    QRCODE: '/tables/qrcode',
  },
  WAITERS: {
    BASE: '/waiters',
    SCHEDULE: '/waiters/schedule',
    PERFORMANCE: '/waiters/performance',
    AVAILABILITY: '/waiters/availability',
  },
}

// Order statuses
export const ORDER_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
}

// Table statuses
export const TABLE_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  CLEANING: 'cleaning',
  MAINTENANCE: 'maintenance',
}

// User roles
export const USER_ROLES = {
  CUSTOMER: 'customer',
  WAITER: 'waiter',
  RESTAURANT_ADMIN: 'restaurant_admin',
  PLATFORM_ADMIN: 'platform_admin',
  SUPPORT_AGENT: 'support_agent',
}

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  BASIC: 'basic',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
}

// Payment methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  ONLINE: 'online',
  MOBILE_MONEY: 'mobile_money',
}

// Order types
export const ORDER_TYPES = {
  DINE_IN: 'dine_in',
  TAKEAWAY: 'takeaway',
  DELIVERY: 'delivery',
}

// Notification types
export const NOTIFICATION_TYPES = {
  NEW_ORDER: 'new_order',
  ORDER_VERIFIED: 'order_verified',
  ORDER_PREPARING: 'order_preparing',
  ORDER_READY: 'order_ready',
  ORDER_SERVED: 'order_served',
  ORDER_CANCELLED: 'order_cancelled',
  ORDER_COMPLETED: 'order_completed',
  LOW_STOCK: 'low_stock',
  NEW_REVIEW: 'new_review',
  PROMOTION: 'promotion',
  SYSTEM: 'system',
}

// Local storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  CART: 'cart',
  THEME: 'theme',
  LANGUAGE: 'language',
  NOTIFICATIONS: 'notifications',
}

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  LIMITS: [10, 25, 50, 100],
}

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy hh:mm a',
  API: 'yyyy-MM-dd',
  TIME: 'hh:mm a',
  TIME_24H: 'HH:mm',
}

// Currency
export const CURRENCY = {
  CODE: 'USD',
  SYMBOL: '$',
  LOCALE: 'en-US',
}

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  MAX_FILES: 10,
}

// WebSocket events
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  NEW_ORDER: 'new_order',
  ORDER_UPDATED: 'order_updated',
  ORDER_READY: 'order_ready',
  TABLE_STATUS: 'table_status',
  CALL_REQUEST: 'call_request',
  NOTIFICATION: 'notification',
  JOIN: 'join',
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
}

// Cache durations (in milliseconds)
export const CACHE_DURATIONS = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 60 * 60 * 1000, // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
}

// Regex patterns
export const PATTERNS = {
  EMAIL: /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/,
  PHONE: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  CREDIT_CARD: /^\d{4}-?\d{4}-?\d{4}-?\d{4}$/,
}

// Error messages
export const ERROR_MESSAGES = {
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Please login to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Something went wrong. Please try again later.',
  VALIDATION: 'Please check your input and try again.',
}

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  LOGOUT: 'Logged out successfully.',
  REGISTER: 'Registration successful! Please verify your email.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  ORDER_PLACED: 'Order placed successfully!',
  ORDER_UPDATED: 'Order status updated.',
  TABLE_ASSIGNED: 'Table assigned successfully.',
  MENU_ITEM_CREATED: 'Menu item created successfully.',
  MENU_ITEM_UPDATED: 'Menu item updated successfully.',
  COUPON_APPLIED: 'Coupon applied successfully!',
}