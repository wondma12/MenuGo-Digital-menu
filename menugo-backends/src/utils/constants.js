// User Roles
const USER_ROLES = {
  CUSTOMER: 'customer',
  WAITER: 'waiter',
  RESTAURANT_ADMIN: 'restaurant_admin',
  PLATFORM_ADMIN: 'platform_admin',
  SUPPORT_AGENT: 'support_agent',
};

// Order Status
const ORDER_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
};

// Payment Status
const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  REFUNDED: 'refunded',
  FAILED: 'failed',
  PARTIAL: 'partial',
};

// Payment Methods
const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  ONLINE: 'online',
  MOBILE_MONEY: 'mobile_money',
};

// Order Types
const ORDER_TYPES = {
  DINE_IN: 'dine_in',
  TAKEAWAY: 'takeaway',
  DELIVERY: 'delivery',
};

// Table Status
const TABLE_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  CLEANING: 'cleaning',
  MAINTENANCE: 'maintenance',
};

// Subscription Tiers
const SUBSCRIPTION_TIERS = {
  BASIC: 'basic',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
};

// Subscription Status
const SUBSCRIPTION_STATUS = {
  TRIAL: 'trial',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
};

// Notification Types
const NOTIFICATION_TYPES = {
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
};

// Waiter Notification Types
const WAITER_NOTIFICATION_TYPES = {
  NEW_ORDER: 'new_order',
  ORDER_VERIFIED: 'order_verified',
  ORDER_READY: 'order_ready',
  ORDER_SERVED: 'order_served',
  TABLE_ASSIGNED: 'table_assigned',
  TABLE_RELEASED: 'table_released',
  CUSTOMER_CALL: 'customer_call',
  SYSTEM_ALERT: 'system_alert',
};

// Discount Types
const DISCOUNT_TYPES = {
  PERCENTAGE: 'percentage',
  FIXED_AMOUNT: 'fixed_amount',
  BUY_ONE_GET_ONE: 'buy_one_get_one',
};

// Reservation Status
const RESERVATION_STATUS = {
  CONFIRMED: 'confirmed',
  SEATED: 'seated',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
  COMPLETED: 'completed',
};

// Staff Roles
const STAFF_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  WAITER: 'waiter',
  CHEF: 'chef',
  CASHIER: 'cashier',
  DELIVERY: 'delivery',
};

// Waiter Shift Status
const WAITER_SHIFT_STATUS = {
  SCHEDULED: 'scheduled',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ABSENT: 'absent',
  LATE: 'late',
  BREAK: 'break',
};

// Waiter Real-time Status
const WAITER_REALTIME_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  BUSY: 'busy',
  BREAK: 'break',
  AWAY: 'away',
};

// Call Types
const CALL_TYPES = {
  SERVICE: 'service',
  BILL: 'bill',
  HELP: 'help',
  FOOD_ISSUE: 'food_issue',
  OTHER: 'other',
};

// Inventory Transaction Types
const INVENTORY_TRANSACTION_TYPES = {
  PURCHASE: 'purchase',
  USAGE: 'usage',
  WASTE: 'waste',
  ADJUSTMENT: 'adjustment',
};

// Review Status
const REVIEW_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  REPORTED: 'reported',
};

// Order Sources
const ORDER_SOURCES = {
  QR_CODE: 'qr_code',
  WAITER: 'waiter',
  ONLINE: 'online',
  POS: 'pos',
};

// Table Shapes
const TABLE_SHAPES = {
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  SQUARE: 'square',
};

// Verification Methods
const VERIFICATION_METHODS = {
  QR_CODE: 'qr_code',
  MANUAL: 'manual',
  TABLE_CHECK: 'table_check',
};

// Priority Levels
const PRIORITY_LEVELS = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
};

// Tip Types
const TIP_TYPES = {
  CASH: 'cash',
  CARD: 'card',
  DIGITAL: 'digital',
};

// Commission Status
const COMMISSION_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  CANCELLED: 'cancelled',
};

// Cache Durations (seconds)
const CACHE_DURATIONS = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  VERY_LONG: 86400, // 24 hours
};

// Pagination Defaults
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// File Upload Limits
const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
};

// Date Formats
const DATE_FORMATS = {
  DEFAULT: 'YYYY-MM-DD HH:mm:ss',
  DATE_ONLY: 'YYYY-MM-DD',
  TIME_ONLY: 'HH:mm:ss',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
};

// Currency
const CURRENCY = {
  CODE: 'ETB',
  SYMBOL: 'Br',
  DECIMAL_PLACES: 2,
};

// API Response Messages
const RESPONSE_MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  NOT_FOUND: 'Resource not found',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Access forbidden',
  VALIDATION_ERROR: 'Validation error',
  INTERNAL_ERROR: 'Internal server error',
};

module.exports = {
  USER_ROLES,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  ORDER_TYPES,
  TABLE_STATUS,
  SUBSCRIPTION_TIERS,
  SUBSCRIPTION_STATUS,
  NOTIFICATION_TYPES,
  WAITER_NOTIFICATION_TYPES,
  DISCOUNT_TYPES,
  RESERVATION_STATUS,
  STAFF_ROLES,
  WAITER_SHIFT_STATUS,
  WAITER_REALTIME_STATUS,
  CALL_TYPES,
  INVENTORY_TRANSACTION_TYPES,
  REVIEW_STATUS,
  ORDER_SOURCES,
  TABLE_SHAPES,
  VERIFICATION_METHODS,
  PRIORITY_LEVELS,
  TIP_TYPES,
  COMMISSION_STATUS,
  CACHE_DURATIONS,
  PAGINATION,
  FILE_UPLOAD,
  DATE_FORMATS,
  CURRENCY,
  RESPONSE_MESSAGES,
};