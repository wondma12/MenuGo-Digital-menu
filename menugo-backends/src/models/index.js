const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const UserSession = require('./UserSession');
const Restaurant = require('./Restaurant');
const RestaurantSetting = require('./RestaurantSetting');
const RestaurantStaff = require('./RestaurantStaff');
const Waiter = require('./Waiter');
const WaiterShift = require('./WaiterShift');
const WaiterPerformance = require('./WaiterPerformance');
const WaiterRealtimeStatus = require('./WaiterRealtimeStatus');
const WaiterActivityLog = require('./WaiterActivityLog');
const MenuCategory = require('./MenuCategory');
const MenuItem = require('./MenuItem');
const MenuItemOptionGroup = require('./MenuItemOptionGroup');
const MenuItemOption = require('./MenuItemOption');
const MenuItemModifier = require('./MenuItemModifier');
const MenuItemModifierAssignment = require('./MenuItemModifierAssignment');
const Table = require('./Table');
const TableAssignment = require('./TableAssignment');
const TableStatusHistory = require('./TableStatusHistory');
const TableReservation = require('./TableReservation');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const OrderItemOption = require('./OrderItemOption');
const OrderItemModifier = require('./OrderItemModifier');
const OrderStatusHistory = require('./OrderStatusHistory');
const OrderVerificationAttempt = require('./OrderVerificationAttempt');
const OrderRejectionReason = require('./OrderRejectionReason');
const QRCode = require('./QRCode');
const QRCodeScan = require('./QRCodeScan');
const Review = require('./Review');
const WaiterFeedback = require('./WaiterFeedback');
const Coupon = require('./Coupon');
const CouponUsage = require('./CouponUsage');
const InventoryItem = require('./InventoryItem');
const InventoryTransaction = require('./InventoryTransaction');
const Notification = require('./Notification');
const WaiterNotification = require('./WaiterNotification');
const WaiterCallRequest = require('./WaiterCallRequest');
const WaiterTip = require('./WaiterTip');
const WaiterCommission = require('./WaiterCommission');
const PushNotificationToken = require('./PushNotificationToken');
const DailySalesSummary = require('./DailySalesSummary');
const MenuItemAnalytics = require('./MenuItemAnalytics');
const HourlyAnalytics = require('./HourlyAnalytics');
const StaffActivityLog = require('./StaffActivityLog');
const SubscriptionPlan = require('./SubscriptionPlan');
const Subscription = require('./Subscription');
const Invoice = require('./Invoice');
const SupportTicket = require('./SupportTicket');
const TicketMessage = require('./TicketMessage');
const SystemLog = require('./SystemLog');
const ContactMessage = require('./ContactMessage');
const PlatformSetting = require('./PlatformSetting');

// Define associations with unique aliases
const defineAssociations = () => {
  // ==================== USER ASSOCIATIONS ====================
  User.hasMany(UserSession, { foreignKey: 'user_id', as: 'user_sessions' });
  UserSession.belongsTo(User, { foreignKey: 'user_id', as: 'user_owner' });

  User.hasMany(Restaurant, { foreignKey: 'owner_id', as: 'owned_restaurants' });
  Restaurant.belongsTo(User, { foreignKey: 'owner_id', as: 'restaurant_owner' });

  User.hasMany(RestaurantStaff, { foreignKey: 'user_id', as: 'staff_assignments' });
  RestaurantStaff.belongsTo(User, { foreignKey: 'user_id', as: 'assigned_user' });

  User.hasOne(Waiter, { foreignKey: 'user_id', as: 'waiter_profile' });
  Waiter.belongsTo(User, { foreignKey: 'user_id', as: 'waiter_user' });
  
  User.hasMany(Review, { foreignKey: 'user_id', as: 'user_reviews' });
  Review.belongsTo(User, { foreignKey: 'user_id', as: 'review_author' });
  
  User.hasMany(Notification, { foreignKey: 'user_id', as: 'user_notifications' });
  Notification.belongsTo(User, { foreignKey: 'user_id', as: 'notification_user' });
  
  User.hasMany(SupportTicket, { foreignKey: 'user_id', as: 'user_tickets' });
  SupportTicket.belongsTo(User, { foreignKey: 'user_id', as: 'ticket_creator' });
  
  User.hasMany(TicketMessage, { foreignKey: 'user_id', as: 'user_messages' });
  TicketMessage.belongsTo(User, { foreignKey: 'user_id', as: 'message_author' });
  
  User.hasMany(SystemLog, { foreignKey: 'user_id', as: 'user_logs' });
  SystemLog.belongsTo(User, { foreignKey: 'user_id', as: 'log_user' });
  
  User.hasMany(PushNotificationToken, { foreignKey: 'user_id', as: 'push_tokens' });
  PushNotificationToken.belongsTo(User, { foreignKey: 'user_id', as: 'token_owner' });
  
  User.hasMany(CouponUsage, { foreignKey: 'user_id', as: 'user_coupon_usages' });
  CouponUsage.belongsTo(User, { foreignKey: 'user_id', as: 'coupon_user' });
  
  User.hasMany(InventoryTransaction, { foreignKey: 'created_by', as: 'user_inventory_transactions' });
  InventoryTransaction.belongsTo(User, { foreignKey: 'created_by', as: 'transaction_creator' });

  // ==================== RESTAURANT ASSOCIATIONS ====================
  Restaurant.hasMany(RestaurantSetting, { foreignKey: 'restaurant_id', as: 'restaurant_settings' });
  RestaurantSetting.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'setting_restaurant' });

  Restaurant.hasMany(RestaurantStaff, { foreignKey: 'restaurant_id', as: 'restaurant_staff_members' });
  RestaurantStaff.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'staff_restaurant' });

  Restaurant.hasMany(MenuCategory, { foreignKey: 'restaurant_id', as: 'menu_categories' });
  MenuCategory.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'category_restaurant' });

  Restaurant.hasMany(MenuItem, { foreignKey: 'restaurant_id', as: 'restaurant_menu_items' });
  MenuItem.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'item_restaurant' });

  Restaurant.hasMany(Table, { foreignKey: 'restaurant_id', as: 'restaurant_tables' });
  Table.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'table_restaurant' });

  Restaurant.hasMany(Order, { foreignKey: 'restaurant_id', as: 'restaurant_orders' });
  Order.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'order_restaurant' });

  Restaurant.hasMany(QRCode, { foreignKey: 'restaurant_id', as: 'restaurant_qrcodes' });
  QRCode.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'qrcode_restaurant' });
  
  Restaurant.hasMany(Review, { foreignKey: 'restaurant_id', as: 'restaurant_reviews' });
  Review.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'review_restaurant' });
  
  Restaurant.hasMany(Coupon, { foreignKey: 'restaurant_id', as: 'restaurant_coupons' });
  Coupon.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'coupon_restaurant' });
  
  Restaurant.hasMany(InventoryItem, { foreignKey: 'restaurant_id', as: 'restaurant_inventory' });
  InventoryItem.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'inventory_restaurant' });
  
  Restaurant.hasMany(DailySalesSummary, { foreignKey: 'restaurant_id', as: 'daily_sales_summaries' });
  DailySalesSummary.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'sales_restaurant' });
  
  Restaurant.hasMany(MenuItemAnalytics, { foreignKey: 'restaurant_id', as: 'restaurant_menu_analytics' });
  MenuItemAnalytics.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'analytics_restaurant' });
  
  Restaurant.hasMany(HourlyAnalytics, { foreignKey: 'restaurant_id', as: 'restaurant_hourly_analytics' });
  HourlyAnalytics.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'hourly_restaurant' });
  
  Restaurant.hasMany(Subscription, { foreignKey: 'restaurant_id', as: 'restaurant_subscriptions' });
  Subscription.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'subscription_restaurant' });
  
  Restaurant.hasMany(SupportTicket, { foreignKey: 'restaurant_id', as: 'restaurant_support_tickets' });
  SupportTicket.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'ticket_restaurant' });
  
  Restaurant.hasMany(Invoice, { foreignKey: 'restaurant_id', as: 'restaurant_invoices' });
  Invoice.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'invoice_restaurant' });

  // ==================== RESTAURANT STAFF ASSOCIATIONS ====================
  RestaurantStaff.hasOne(Waiter, { foreignKey: 'staff_id', as: 'waiter_details' });
  Waiter.belongsTo(RestaurantStaff, { foreignKey: 'staff_id', as: 'staff_details' });
  
  RestaurantStaff.hasMany(StaffActivityLog, { foreignKey: 'staff_id', as: 'staff_activities' });
  StaffActivityLog.belongsTo(RestaurantStaff, { foreignKey: 'staff_id', as: 'activity_staff' });

  // ==================== WAITER ASSOCIATIONS ====================
  Waiter.hasMany(WaiterShift, { foreignKey: 'waiter_id', as: 'waiter_shifts' });
  WaiterShift.belongsTo(Waiter, { foreignKey: 'waiter_id', as: 'shift_waiter' });

  Waiter.hasMany(WaiterPerformance, { foreignKey: 'waiter_id', as: 'performance_records' });
  WaiterPerformance.belongsTo(Waiter, { foreignKey: 'waiter_id', as: 'performance_waiter' });

  Waiter.hasOne(WaiterRealtimeStatus, { foreignKey: 'waiter_id', as: 'realtime_status' });
  WaiterRealtimeStatus.belongsTo(Waiter, { foreignKey: 'waiter_id', as: 'status_waiter' });

  Waiter.hasMany(WaiterActivityLog, { foreignKey: 'waiter_id', as: 'waiter_activities' });
  WaiterActivityLog.belongsTo(Waiter, { foreignKey: 'waiter_id', as: 'activity_waiter' });

  // REMOVED: Waiter.hasMany(Table, { foreignKey: 'current_waiter_id', as: 'assigned_tables' });
  // This was causing the naming collision with the 'assigned_tables' column in Waiter model
  
  Waiter.hasMany(Order, { foreignKey: 'waiter_id', as: 'waiter_orders' });
  Order.belongsTo(Waiter, { foreignKey: 'waiter_id', as: 'order_waiter' });
  
  Waiter.hasMany(WaiterFeedback, { foreignKey: 'waiter_id', as: 'waiter_feedback' });
  WaiterFeedback.belongsTo(Waiter, { foreignKey: 'waiter_id', as: 'feedback_waiter' });
  
  Waiter.hasMany(WaiterNotification, { foreignKey: 'waiter_id', as: 'waiter_notifications' });
  WaiterNotification.belongsTo(Waiter, { foreignKey: 'waiter_id', as: 'notification_waiter' });
  
  Waiter.hasMany(WaiterCallRequest, { foreignKey: 'waiter_id', as: 'waiter_calls' });
  WaiterCallRequest.belongsTo(Waiter, { foreignKey: 'waiter_id', as: 'call_waiter' });
  // Associate call requests with tables for convenience
  WaiterCallRequest.belongsTo(Table, { foreignKey: 'table_id', as: 'table' });
  
  Waiter.hasMany(WaiterTip, { foreignKey: 'waiter_id', as: 'waiter_tips' });
  WaiterTip.belongsTo(Waiter, { foreignKey: 'waiter_id', as: 'tip_waiter' });
  
  Waiter.hasMany(WaiterCommission, { foreignKey: 'waiter_id', as: 'waiter_commissions' });
  WaiterCommission.belongsTo(Waiter, { foreignKey: 'waiter_id', as: 'commission_waiter' });
  
  Waiter.hasMany(TableAssignment, { foreignKey: 'waiter_id', as: 'waiter_table_assignments' });
  TableAssignment.belongsTo(Waiter, { foreignKey: 'waiter_id', as: 'assignment_waiter' });

  // ==================== TABLE ASSOCIATIONS ====================
  Table.belongsTo(Waiter, { foreignKey: 'current_waiter_id', as: 'current_waiter' });
  Waiter.hasMany(Table, { foreignKey: 'current_waiter_id', as: 'current_tables' });

  Table.hasMany(TableAssignment, { foreignKey: 'table_id', as: 'table_assignments' });
  TableAssignment.belongsTo(Table, { foreignKey: 'table_id', as: 'assignment_table' });

  Table.hasMany(TableStatusHistory, { foreignKey: 'table_id', as: 'status_history' });
  TableStatusHistory.belongsTo(Table, { foreignKey: 'table_id', as: 'history_table' });

  Table.hasMany(TableReservation, { foreignKey: 'table_id', as: 'table_reservations' });
  TableReservation.belongsTo(Table, { foreignKey: 'table_id', as: 'reservation_table' });

  Table.hasOne(Order, { foreignKey: 'table_id', as: 'current_order' });
  Order.belongsTo(Table, { foreignKey: 'table_id', as: 'order_table' });
  
  Table.hasMany(QRCode, { foreignKey: 'table_id', as: 'table_qrcodes' });
  QRCode.belongsTo(Table, { foreignKey: 'table_id', as: 'qrcode_table' });

  // ==================== MENU ASSOCIATIONS ====================
  MenuCategory.hasMany(MenuItem, { foreignKey: 'category_id', as: 'category_items' });
  MenuItem.belongsTo(MenuCategory, { foreignKey: 'category_id', as: 'item_category' });

  MenuItem.hasMany(MenuItemOption, { foreignKey: 'menu_item_id', as: 'item_options' });
  MenuItemOption.belongsTo(MenuItem, { foreignKey: 'menu_item_id', as: 'option_item' });

  MenuItemOptionGroup.hasMany(MenuItemOption, { foreignKey: 'option_group_id', as: 'group_options' });
  MenuItemOption.belongsTo(MenuItemOptionGroup, { foreignKey: 'option_group_id', as: 'option_group' });

  MenuItem.belongsToMany(MenuItemModifier, { 
    through: MenuItemModifierAssignment, 
    foreignKey: 'menu_item_id', 
    otherKey: 'modifier_id',
    as: 'item_modifiers' 
  });
  MenuItemModifier.belongsToMany(MenuItem, { 
    through: MenuItemModifierAssignment, 
    foreignKey: 'modifier_id', 
    otherKey: 'menu_item_id',
    as: 'modifier_items' 
  });
  
  MenuItem.hasMany(MenuItemAnalytics, { foreignKey: 'menu_item_id', as: 'item_analytics' });
  MenuItemAnalytics.belongsTo(MenuItem, { foreignKey: 'menu_item_id', as: 'analytics_item' });
  
  MenuItem.hasMany(OrderItem, { foreignKey: 'menu_item_id', as: 'menu_order_items' });
  OrderItem.belongsTo(MenuItem, { foreignKey: 'menu_item_id', as: 'order_menu_item' });

  // ==================== ORDER ASSOCIATIONS ====================
  Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'order_items' });
  OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'item_order' });

  OrderItem.hasMany(OrderItemOption, { foreignKey: 'order_item_id', as: 'item_options_selected' });
  OrderItemOption.belongsTo(OrderItem, { foreignKey: 'order_item_id', as: 'option_order_item' });

  OrderItem.hasMany(OrderItemModifier, { foreignKey: 'order_item_id', as: 'item_modifiers_selected' });
  OrderItemModifier.belongsTo(OrderItem, { foreignKey: 'order_item_id', as: 'modifier_order_item' });

  Order.hasMany(OrderStatusHistory, { foreignKey: 'order_id', as: 'order_status_history' });
  OrderStatusHistory.belongsTo(Order, { foreignKey: 'order_id', as: 'status_order' });

  Order.hasMany(OrderVerificationAttempt, { foreignKey: 'order_id', as: 'verification_attempts' });
  OrderVerificationAttempt.belongsTo(Order, { foreignKey: 'order_id', as: 'attempt_order' });
  
  Order.hasMany(Review, { foreignKey: 'order_id', as: 'order_reviews' });
  Review.belongsTo(Order, { foreignKey: 'order_id', as: 'review_order' });
  
  Order.hasMany(WaiterFeedback, { foreignKey: 'order_id', as: 'order_feedback' });
  WaiterFeedback.belongsTo(Order, { foreignKey: 'order_id', as: 'feedback_order' });
  
  Order.hasMany(CouponUsage, { foreignKey: 'order_id', as: 'order_coupon_usages' });
  CouponUsage.belongsTo(Order, { foreignKey: 'order_id', as: 'coupon_order' });
  
  Order.hasMany(WaiterTip, { foreignKey: 'order_id', as: 'order_tips' });
  WaiterTip.belongsTo(Order, { foreignKey: 'order_id', as: 'tip_order' });
  
  Order.hasMany(WaiterCommission, { foreignKey: 'order_id', as: 'order_commissions' });
  WaiterCommission.belongsTo(Order, { foreignKey: 'order_id', as: 'commission_order' });
  
  Order.hasMany(Notification, { foreignKey: 'order_id', as: 'order_notifications' });
  Notification.belongsTo(Order, { foreignKey: 'order_id', as: 'notification_order' });
  
  Order.hasMany(WaiterNotification, { foreignKey: 'order_id', as: 'order_waiter_notifications' });
  WaiterNotification.belongsTo(Order, { foreignKey: 'order_id', as: 'waiter_notification_order' });

  // ==================== QR CODE ASSOCIATIONS ====================
  QRCode.hasMany(QRCodeScan, { foreignKey: 'qr_code_id', as: 'qr_code_scans' });
  QRCodeScan.belongsTo(QRCode, { foreignKey: 'qr_code_id', as: 'scan_qr_code' });

  // ==================== COUPON ASSOCIATIONS ====================
  Coupon.hasMany(CouponUsage, { foreignKey: 'coupon_id', as: 'coupon_usages' });
  CouponUsage.belongsTo(Coupon, { foreignKey: 'coupon_id', as: 'usage_coupon' });

  // ==================== INVENTORY ASSOCIATIONS ====================
  InventoryItem.hasMany(InventoryTransaction, { foreignKey: 'inventory_item_id', as: 'inventory_transactions' });
  InventoryTransaction.belongsTo(InventoryItem, { foreignKey: 'inventory_item_id', as: 'transaction_item' });

  // ==================== SUBSCRIPTION ASSOCIATIONS ====================
  Subscription.belongsTo(SubscriptionPlan, { foreignKey: 'plan_id', as: 'subscription_plan' });
  SubscriptionPlan.hasMany(Subscription, { foreignKey: 'plan_id', as: 'plan_subscriptions' });
  
  Subscription.hasMany(Invoice, { foreignKey: 'subscription_id', as: 'subscription_invoices' });
  Invoice.belongsTo(Subscription, { foreignKey: 'subscription_id', as: 'invoice_subscription' });

  // ==================== SUPPORT TICKET ASSOCIATIONS ====================
  SupportTicket.hasMany(TicketMessage, { foreignKey: 'ticket_id', as: 'ticket_messages' });
  TicketMessage.belongsTo(SupportTicket, { foreignKey: 'ticket_id', as: 'message_ticket' });
  
  // Contact messages (public contact form)
  // No associations required — stored for platform admin review
  
};

// Call the function to define associations
defineAssociations();

// Add common alias synonyms to match existing controller includes
// (These duplicate associations provide backward-compatible alias names used across the codebase)
const defineAliasSynonyms = () => {
  // Restaurant <-> User (owner alias)
  Restaurant.belongsTo(User, { foreignKey: 'owner_id', as: 'owner' });

  // RestaurantStaff convenience aliases
  Restaurant.hasMany(RestaurantStaff, { foreignKey: 'restaurant_id', as: 'staff' });
  RestaurantStaff.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });
  RestaurantStaff.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Waiter -> User alias used in controllers
  Waiter.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Support ticket/user aliases
  SupportTicket.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  TicketMessage.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Backward-compatible aliases for SupportTicket <-> Restaurant and ticket messages
  // Some controllers expect `restaurant` and `messages` aliases instead of the canonical ones.
  SupportTicket.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });
  Restaurant.hasMany(SupportTicket, { foreignKey: 'restaurant_id', as: 'support_tickets' });
  SupportTicket.hasMany(TicketMessage, { foreignKey: 'ticket_id', as: 'messages' });
  TicketMessage.belongsTo(SupportTicket, { foreignKey: 'ticket_id', as: 'ticket' });

  // Review author alias
  Review.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

  // Order / OrderItem common aliases
  Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
  OrderItem.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });
  OrderItem.belongsTo(MenuItem, { foreignKey: 'menu_item_id', as: 'menu_item' });

  // Menu item / category aliases expected by controllers
  MenuItem.belongsTo(MenuCategory, { foreignKey: 'category_id', as: 'category' });

  // Menu option groups / options aliases
  MenuItemOptionGroup.hasMany(MenuItemOption, { foreignKey: 'option_group_id', as: 'option_groups' });
  MenuItemOption.belongsTo(MenuItemOptionGroup, { foreignKey: 'option_group_id', as: 'options' });

  // MenuItemAnalytics convenience alias
  MenuItemAnalytics.belongsTo(MenuItem, { foreignKey: 'menu_item_id', as: 'menu_item' });

  // Inventory item -> restaurant alias
  InventoryItem.belongsTo(Restaurant, { foreignKey: 'restaurant_id', as: 'restaurant' });
};

defineAliasSynonyms();

// Export all models
const db = {
  sequelize,
  Sequelize,
  User,
  UserSession,
  Restaurant,
  RestaurantSetting,
  RestaurantStaff,
  Waiter,
  WaiterShift,
  WaiterPerformance,
  WaiterRealtimeStatus,
  WaiterActivityLog,
  MenuCategory,
  MenuItem,
  MenuItemOptionGroup,
  MenuItemOption,
  MenuItemModifier,
  MenuItemModifierAssignment,
  Table,
  TableAssignment,
  TableStatusHistory,
  TableReservation,
  Order,
  OrderItem,
  OrderItemOption,
  OrderItemModifier,
  OrderStatusHistory,
  OrderVerificationAttempt,
  OrderRejectionReason,
  QRCode,
  QRCodeScan,
  Review,
  WaiterFeedback,
  Coupon,
  CouponUsage,
  InventoryItem,
  InventoryTransaction,
  Notification,
  WaiterNotification,
  WaiterCallRequest,
  WaiterTip,
  WaiterCommission,
  PushNotificationToken,
  DailySalesSummary,
  MenuItemAnalytics,
  HourlyAnalytics,
  StaffActivityLog,
  SubscriptionPlan,
  Subscription,
  Invoice,
  SupportTicket,
  TicketMessage,
  SystemLog,
  ContactMessage,
  PlatformSetting,
};

// Compatibility shims for older Sequelize versions that use `findById`
// Newer code expects `findByPk`. If running an older Sequelize where
// `findByPk` is missing but `findById` exists, add an alias so the
// rest of the codebase works without upgrading Sequelize immediately.
Object.keys(db).forEach((key) => {
  const candidate = db[key];
  if (candidate && typeof candidate === 'object') {
    if (typeof candidate.findByPk !== 'function' && typeof candidate.findById === 'function') {
      candidate.findByPk = candidate.findById.bind(candidate);
    }
    // Also ensure `findByPk` on the prototype for instance where models are functions
    if (typeof candidate.prototype === 'object' && typeof candidate.prototype.findByPk !== 'function' && typeof candidate.prototype.findById === 'function') {
      candidate.prototype.findByPk = candidate.prototype.findById;
    }
  }
});

module.exports = db;