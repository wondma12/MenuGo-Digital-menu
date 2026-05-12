export const ROUTES = {
  // Public Routes
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  VERIFY_EMAIL: '/verify-email',
  TWO_FACTOR: '/2fa',
  MENU: '/menu/:restaurantId',
  QR_SCAN: '/scan',
  ORDER_CONFIRMATION: '/order-confirmation/:orderId',
  ORDER_TRACKING: '/order-tracking/:orderId',

  // Platform Admin Routes
  PLATFORM: {
    DASHBOARD: '/platform/dashboard',
    RESTAURANTS: '/platform/restaurants',
    RESTAURANT_DETAILS: '/platform/restaurants/:id',
    RESTAURANT_EDIT: '/platform/restaurants/:id/edit',
    RESTAURANT_NEW: '/platform/restaurants/new',
    USERS: '/platform/users',
    USER_DETAILS: '/platform/users/:id',
    USER_EDIT: '/platform/users/:id/edit',
    USER_NEW: '/platform/users/new',
    SUBSCRIPTIONS: '/platform/subscriptions',
    SUBSCRIPTION_PLANS: '/platform/subscriptions/plans',
    ANALYTICS: '/platform/analytics',
    SUPPORT: '/platform/support',
    TICKET_DETAILS: '/platform/support/:id',
    SYSTEM: '/platform/system',
    SYSTEM_SETTINGS: '/platform/system/settings',
    SYSTEM_HEALTH: '/platform/system/health',
    AUDIT_LOGS: '/platform/system/audit-logs',
    BACKUPS: '/platform/system/backups',
  },

  // Restaurant Admin Routes
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    MENU: '/admin/menu',
    MENU_ITEM_NEW: '/admin/menu/new',
    MENU_ITEM_EDIT: '/admin/menu/:id/edit',
    CATEGORIES: '/admin/categories',
    ORDERS: '/admin/orders',
    ORDER_DETAILS: '/admin/orders/:id',
    TABLES: '/admin/tables',
    TABLE_QR: '/admin/tables/qr',
    STAFF: '/admin/staff',
    STAFF_NEW: '/admin/staff/new',
    STAFF_EDIT: '/admin/staff/:id/edit',
    INVENTORY: '/admin/inventory',
    PROMOTIONS: '/admin/promotions',
    ANALYTICS: '/admin/analytics',
    REVIEWS: '/admin/reviews',
    SETTINGS: '/admin/settings',
    PROFILE: '/admin/profile',
  },

  // Waiter Routes
  WAITER: {
    DASHBOARD: '/waiter/dashboard',
    ORDERS: '/waiter/orders',
    ORDER_DETAILS: '/waiter/orders/:id',
    TABLES: '/waiter/tables',
    RESERVATIONS: '/waiter/reservations',
    CALLS: '/waiter/calls',
    PROFILE: '/waiter/profile',
    NOTIFICATIONS: '/waiter/notifications',
  },

  // Customer Routes
  CUSTOMER: {
    MENU: '/menu/:restaurantId',
    CART: '/menu/:restaurantId/cart',
    ORDER_HISTORY: '/orders',
    ORDER_DETAILS: '/orders/:id',
    PROFILE: '/profile',
    SETTINGS: '/settings',
  },
}

import { BarChart2, Store, Users, CreditCard, TrendingUp, HelpCircle, Settings, Clipboard, ShoppingCart, Table, Calendar, Phone, User, Tag, Box, Star } from 'lucide-react'

export const NAVIGATION = {
  PLATFORM_ADMIN: [
    { path: ROUTES.PLATFORM.DASHBOARD, label: 'Dashboard', icon: <BarChart2 className="w-5 h-5" /> },
    { path: ROUTES.PLATFORM.RESTAURANTS, label: 'Restaurants', icon: <Store className="w-5 h-5" /> },
    { path: ROUTES.PLATFORM.USERS, label: 'Users', icon: <Users className="w-5 h-5" /> },
    { path: ROUTES.PLATFORM.SUBSCRIPTIONS, label: 'Subscriptions', icon: <CreditCard className="w-5 h-5" /> },
    { path: ROUTES.PLATFORM.ANALYTICS, label: 'Analytics', icon: <TrendingUp className="w-5 h-5" /> },
    { path: ROUTES.PLATFORM.SUPPORT, label: 'Support', icon: <HelpCircle className="w-5 h-5" /> },
    { path: ROUTES.PLATFORM.SYSTEM, label: 'System', icon: <Settings className="w-5 h-5" /> },
  ],
  RESTAURANT_ADMIN: [
    { path: ROUTES.ADMIN.DASHBOARD, label: 'Dashboard', icon: <BarChart2 className="w-5 h-5" /> },
    { path: ROUTES.ADMIN.MENU, label: 'Menu', icon: <Clipboard className="w-5 h-5" /> },
    { path: ROUTES.ADMIN.CATEGORIES, label: 'Categories', icon: <Tag className="w-5 h-5" /> },
    { path: ROUTES.ADMIN.ORDERS, label: 'Orders', icon: <ShoppingCart className="w-5 h-5" /> },
    { path: ROUTES.ADMIN.TABLES, label: 'Tables', icon: <Table className="w-5 h-5" /> },
    { path: ROUTES.ADMIN.STAFF, label: 'Staff', icon: <Users className="w-5 h-5" /> },
    { path: ROUTES.ADMIN.INVENTORY, label: 'Inventory', icon: <Box className="w-5 h-5" /> },
    { path: ROUTES.ADMIN.PROMOTIONS, label: 'Promotions', icon: <Tag className="w-5 h-5" /> },
    { path: ROUTES.ADMIN.ANALYTICS, label: 'Analytics', icon: <TrendingUp className="w-5 h-5" /> },
    { path: ROUTES.ADMIN.REVIEWS, label: 'Reviews', icon: <Star className="w-5 h-5" /> },
    { path: ROUTES.ADMIN.SETTINGS, label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ],
  WAITER: [
    { path: ROUTES.WAITER.DASHBOARD, label: 'Dashboard', icon: <BarChart2 className="w-5 h-5" /> },
    { path: ROUTES.WAITER.ORDERS, label: 'Orders', icon: <ShoppingCart className="w-5 h-5" /> },
    { path: ROUTES.WAITER.TABLES, label: 'Tables', icon: <Table className="w-5 h-5" /> },
    { path: ROUTES.WAITER.RESERVATIONS, label: 'Reservations', icon: <Calendar className="w-5 h-5" /> },
    { path: ROUTES.WAITER.CALLS, label: 'Calls', icon: <Phone className="w-5 h-5" /> },
    { path: ROUTES.WAITER.PROFILE, label: 'Profile', icon: <User className="w-5 h-5" /> },
  ],
}