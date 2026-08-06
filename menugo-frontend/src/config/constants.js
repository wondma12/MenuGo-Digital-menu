// App Configuration
export const APP_CONFIG = {
  name: 'MenuGo',
  version: '1.0.0',
  description: 'Digital Menu SaaS Platform',
  company: 'MenuGo Inc.',
  website: 'https://menugo.com',
  supportEmail: 'support@menugo.com',
  supportPhone: '+1-800-MENU-GO',
}

// Feature Flags
export const FEATURES = {
  enableDelivery: true,
  enableTakeaway: true,
  enableReservations: true,
  enableLoyalty: false,
  enableGiftCards: false,
  enableMultiLanguage: true,
  enableDarkMode: true,
  enablePushNotifications: true,
  enableEmailNotifications: true,
  enableSMSNotifications: false,
  enableSocialLogin: true,
  enableTwoFactorAuth: true,
  enableQRCodeScanning: true,
  enableAnalytics: true,
  enableExportReports: true,
  enableBulkActions: true,
  enableDragDrop: true,
  enableRealTimeUpdates: true,
}

// Default Values
export const DEFAULTS = {
  pagination: {
    page: 1,
    limit: 10,
  },
  dateRange: {
    start: () => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: () => new Date(),
  },
  taxRate: 10,
  serviceCharge: 0,
  deliveryFee: 3.99,
  freeDeliveryThreshold: 30,
  minimumOrderAmount: 10,
  preparationTime: 15,
  tableCapacity: 4,
  ratingScale: 5,
  currency: 'ETB',
  language: 'en',
  timezone: 'UTC',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: 'HH:mm',
  datetimeFormat: 'YYYY-MM-DD HH:mm:ss',
}

// Limits
export const LIMITS = {
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxImageSize: 2 * 1024 * 1024, // 2MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  maxMenuItems: 1000,
  maxCategories: 50,
  maxOptionsPerItem: 10,
  maxModifiersPerItem: 10,
  maxTables: 100,
  maxStaff: 50,
  maxReservationsPerDay: 200,
  maxOrdersPerDay: 500,
  maxCoupons: 100,
  maxInventoryItems: 500,
  maxReviews: 1000,
  maxNotifications: 100,
  searchDebounceDelay: 300,
  autoSaveDelay: 1000,
  refreshInterval: 30000,
  websocketReconnectDelay: 3000,
}

// Regular Expressions
export const REGEX = {
  email: /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/,
  phone: /^[+]?\(?[0-9]{3}\)?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
  password: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
  zipCode: /^\d{5}(-\d{4})?$/,
  creditCard: /^\d{4}-?\d{4}-?\d{4}-?\d{4}$/,
  url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z]{2,6})([/\w .-]*)*\/?$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
}

// Error Codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  RATE_LIMIT: 'RATE_LIMIT',
  CONFLICT: 'CONFLICT',
  BAD_REQUEST: 'BAD_REQUEST',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
}

// Event Names
export const EVENTS = {
  // WebSocket Events
  WS: {
    CONNECT: 'connect',
    DISCONNECT: 'disconnect',
    CONNECT_ERROR: 'connect_error',
    NEW_ORDER: 'new_order',
    ORDER_UPDATED: 'order_updated',
    ORDER_READY: 'order_ready',
    TABLE_STATUS: 'table_status',
    CALL_REQUEST: 'call_request',
    NOTIFICATION: 'notification',
    JOIN_ROOM: 'join_room',
    LEAVE_ROOM: 'leave_room',
  },
  
  // Analytics Events
  ANALYTICS: {
    PAGE_VIEW: 'page_view',
    BUTTON_CLICK: 'button_click',
    FORM_SUBMIT: 'form_submit',
    SEARCH: 'search',
    FILTER: 'filter',
    SORT: 'sort',
    EXPORT: 'export',
    LOGIN: 'login',
    LOGOUT: 'logout',
    REGISTER: 'register',
    ORDER_PLACED: 'order_placed',
    ORDER_COMPLETED: 'order_completed',
    REVIEW_SUBMITTED: 'review_submitted',
    COUPON_APPLIED: 'coupon_applied',
  },
}

// Cookie Names
export const COOKIES = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  SESSION_ID: 'session_id',
  PREFERENCES: 'preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
}

// Query Keys for React Query
export const QUERY_KEYS = {
  USER: 'user',
  USERS: 'users',
  RESTAURANT: 'restaurant',
  RESTAURANTS: 'restaurants',
  MENU: 'menu',
  MENU_ITEM: 'menu_item',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  ORDER: 'order',
  TABLES: 'tables',
  TABLE: 'table',
  WAITERS: 'waiters',
  WAITER: 'waiter',
  RESERVATIONS: 'reservations',
  INVENTORY: 'inventory',
  COUPONS: 'coupons',
  REVIEWS: 'reviews',
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics',
  REPORTS: 'reports',
  SUBSCRIPTIONS: 'subscriptions',
  INVOICES: 'invoices',
  SUPPORT_TICKETS: 'support_tickets',
  AUDIT_LOGS: 'audit_logs',
  SYSTEM_HEALTH: 'system_health',
  BACKUPS: 'backups',
}