export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5003',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
}

export const ENDPOINTS = {
  // Auth
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
    SOCIAL_LOGIN: (provider) => `/auth/${provider}`,
  },

  // Users
  USERS: {
    BASE: '/users',
    DETAILS: (id) => `/users/${id}`,
    STATUS: (id) => `/users/${id}/status`,
    ACTIVITY: (id) => `/users/${id}/activity`,
    ROLES: '/users/roles',
    ROLE: (roleId) => `/users/roles/${roleId}`,
    RESTAURANT_USERS: (restaurantId) => `/users/restaurant/${restaurantId}`,
    INVITE: '/users/invite',
  },

  // Restaurants
  RESTAURANTS: {
    BASE: '/restaurants',
    DETAILS: (id) => `/restaurants/${id}`,
    STATUS: (id) => `/restaurants/${id}/status`,
    STATS: (id) => `/restaurants/${id}/stats`,
    VERIFY: (id) => `/restaurants/${id}/verify`,
    DOCUMENTS: (id) => `/restaurants/${id}/documents`,
    DOCUMENT: (id) => `/restaurants/documents/${id}`,
    VERIFY_DOCUMENT: (id) => `/restaurants/documents/${id}/verify`,
    SETTINGS: (id) => `/restaurants/${id}/settings`,
    HOURS: '/restaurants/settings/hours',
    DELIVERY: '/restaurants/settings/delivery',
    PAYMENT: '/restaurants/settings/payment',
    NOTIFICATIONS: '/restaurants/settings/notifications',
    TAX: '/restaurants/settings/tax',
    THEME: '/restaurants/settings/theme',
    DASHBOARD: '/restaurants/dashboard',
    PENDING_VERIFICATIONS: '/restaurants/pending-verifications',
  },

  // Menu
  MENU: {
    BASE: (restaurantId) => `/restaurants/${restaurantId}/menu`,
    PUBLIC: (restaurantId) => `/restaurants/${restaurantId}/menu/public`,
    ITEM: (id) => `/menu/${id}`,
    AVAILABILITY: (id) => `/menu/${id}/availability`,
    BULK: '/menu/bulk',
    IMPORT: '/menu/import',
    EXPORT: '/menu/export',
    TEMPLATE: '/menu/template',
  },

  // Categories
  CATEGORIES: {
    BASE: (restaurantId) => `/menu/categories/${restaurantId}`,
    DETAILS: (id) => `/menu/categories/${id}`,
    STATUS: (id) => `/menu/categories/${id}/status`,
    ORDER: '/menu/categories/order',
  },

  // Orders
  ORDERS: {
    BASE: (restaurantId) => `/restaurants/${restaurantId}/orders`,
    DETAILS: (id) => `/orders/${id}`,
    STATUS: (id) => `/orders/${id}/status`,
    VERIFY: (id) => `/orders/${id}/verify`,
    REJECT: (id) => `/orders/${id}/reject`,
    CANCEL: (id) => `/orders/${id}/cancel`,
    STATS: (restaurantId) => `/restaurants/${restaurantId}/orders/stats`,
    HISTORY: (userId) => `/users/${userId}/orders`,
    CREATE: '/orders',
  },

  // Tables
  TABLES: {
    BASE: (restaurantId) => `/restaurants/${restaurantId}/tables`,
    DETAILS: (id) => `/tables/${id}`,
    STATUS: (id) => `/tables/${id}/status`,
    ASSIGN: (id) => `/tables/${id}/assign`,
    TRANSFER: (id) => `/tables/${id}/transfer`,
    QRCODE: (id) => `/tables/${id}/qrcode`,
    REGENERATE_QR: (id) => `/tables/${id}/qrcode/regenerate`,
    AVAILABLE: '/tables/available',
  },

  // Waiters
  WAITERS: {
    BASE: (restaurantId) => `/restaurants/${restaurantId}/waiters`,
    DETAILS: (id) => `/waiters/${id}`,
    STATUS: (id) => `/waiters/${id}/status`,
    SCHEDULE: (id) => `/waiters/${id}/schedule`,
    PERFORMANCE: (id) => `/waiters/${id}/performance`,
    DASHBOARD: '/waiters/dashboard',
    ORDERS: '/waiter/orders',
    TABLES: '/waiters/tables',
    PROFILE: '/waiters/profile',
    CHANGE_PASSWORD: '/waiters/change-password',
    AVAILABILITY: '/waiters/availability',
    AVAILABLE_WAITERS: '/waiters/available',
  },

  // QR Code
  QR: {
    GENERATE: (restaurantId) => `/qr/restaurant/${restaurantId}/generate`,
    GENERATE_TABLE: (restaurantId, tableId) => `/qr/restaurant/${restaurantId}/table/${tableId}/generate`,
    LIST: (restaurantId) => `/qr/restaurant/${restaurantId}`,
    DOWNLOAD: (identifier) => `/qr/download/${identifier}`,
    ANALYTICS: (restaurantId) => `/qr/restaurant/${restaurantId}/analytics`,
    SCAN: (identifier) => `/qr/scan/${identifier}`,
  },

  // Analytics
  ANALYTICS: {
    RESTAURANT: (restaurantId) => `/restaurants/${restaurantId}/analytics`,
    SALES: (restaurantId) => `/restaurants/${restaurantId}/reports/sales`,
    ORDERS: (restaurantId) => `/restaurants/${restaurantId}/reports/orders`,
    MENU: (restaurantId) => `/restaurants/${restaurantId}/reports/menu`,
    CUSTOMERS: (restaurantId) => `/restaurants/${restaurantId}/reports/customers`,
    PLATFORM: '/platform/analytics',
    REVENUE: '/platform/analytics/revenue',
    USERS: '/platform/analytics/users',
    DASHBOARD: '/platform/dashboard',
  },

  // Subscriptions
  SUBSCRIPTIONS: {
    PLANS: '/subscriptions/plans',
    CURRENT: '/subscriptions/current',
    CREATE: '/subscriptions',
    CANCEL: '/subscriptions/cancel',
    UPDATE: '/subscriptions',
    INVOICES: '/subscriptions/invoices',
    INVOICE_DOWNLOAD: (id) => `/subscriptions/invoices/${id}/download`,
    REVENUE: '/subscriptions/revenue',
    LIST: '/subscriptions',
  },

  // Support
  SUPPORT: {
    TICKETS: '/support/tickets',
    TICKET_DETAILS: (id) => `/support/tickets/${id}`,
    TICKET_STATUS: (id) => `/support/tickets/${id}/status`,
    TICKET_MESSAGES: (id) => `/support/tickets/${id}/messages`,
    KNOWLEDGE_BASE: '/support/knowledge-base',
  },

  // System
  SYSTEM: {
    SETTINGS: '/system/settings',
    EMAIL: '/system/settings/email',
    SECURITY: '/system/settings/security',
    INTEGRATIONS: '/system/settings/integrations',
    AUDIT_LOGS: '/system/audit-logs',
    HEALTH: '/system/health',
    BACKUPS: '/system/backups',
    BACKUP_CREATE: '/system/backups/create',
    BACKUP_DOWNLOAD: (id) => `/system/backups/${id}/download`,
  },
}
