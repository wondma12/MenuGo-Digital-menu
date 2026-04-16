const { Notification, WaiterNotification, PushNotificationToken } = require('../models');
const { emitToUser, emitToWaiter, emitToRestaurant } = require('./socketService');
const { sendSMS } = require('./smsService');
const { sendEmail } = require('./emailService');
const { logger } = require('../utils/logger');

// Create notification for user
const createUserNotification = async (userId, restaurantId, type, title, message, data = null, orderId = null) => {
  try {
    const notification = await Notification.create({
      user_id: userId,
      restaurant_id: restaurantId,
      order_id: orderId,
      type,
      title,
      message,
      data,
    });

    // Emit socket event
    emitToUser(userId, 'new_notification', notification);

    return notification;
  } catch (error) {
    logger.error('Create user notification error:', error);
    return null;
  }
};

// Create notification for waiter
const createWaiterNotification = async (waiterId, restaurantId, type, title, message, priority = 'normal', actionUrl = null, actionRequired = false) => {
  try {
    const notification = await WaiterNotification.create({
      waiter_id: waiterId,
      restaurant_id: restaurantId,
      notification_type: type,
      title,
      message,
      priority,
      action_url: actionUrl,
      action_required: actionRequired,
    });

    // Emit socket event
    emitToWaiter(waiterId, 'new_waiter_notification', notification);

    return notification;
  } catch (error) {
    logger.error('Create waiter notification error:', error);
    return null;
  }
};

// Send push notification
const sendPushNotification = async (userId, title, body, data = null) => {
  try {
    const tokens = await PushNotificationToken.findAll({
      where: { user_id: userId, is_active: true },
    });

    // Here you would integrate with FCM/APNS
    // For now, just log
    logger.info(`Push notification to user ${userId}: ${title} - ${body}`);
    
    return { success: true, tokens_count: tokens.length };
  } catch (error) {
    logger.error('Send push notification error:', error);
    return { success: false, error: error.message };
  }
};

// Send new order notification
const sendNewOrderNotification = async (restaurantId, orderId, orderNumber, tableNumber) => {
  // Notify restaurant
  // eslint-disable-next-line no-undef
  const staff = await RestaurantStaff.findAll({
    where: { restaurant_id: restaurantId, is_active: true },
    // eslint-disable-next-line no-undef
    include: [{ model: User, as: 'user' }],
  });

  for (const staffMember of staff) {
    await createUserNotification(
      staffMember.user_id,
      restaurantId,
      'new_order',
      'New Order Received',
      `Order #${orderNumber} from table ${tableNumber}`,
      { orderId, orderNumber, tableNumber },
      orderId,
    );
  }

  // Emit to restaurant room
  emitToRestaurant(restaurantId, 'new_order', { orderId, orderNumber, tableNumber });
};

// Send order status update notification
const sendOrderStatusNotification = async (order, status, notes = null) => {
  const { restaurant_id, user_id, order_number, waiter_id } = order;

  // Notify customer
  if (user_id) {
    await createUserNotification(
      user_id,
      restaurant_id,
      `order_${status}`,
      `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      `Your order #${order_number} is now ${status}`,
      { orderId: order.id, orderNumber: order_number, status, notes },
      order.id,
    );
  }

  // Notify waiter
  if (waiter_id && (status === 'ready' || status === 'served')) {
    await createWaiterNotification(
      waiter_id,
      restaurant_id,
      `order_${status}`,
      `Order ${status}`,
      `Order #${order_number} is ${status}`,
      status === 'ready' ? 'high' : 'normal',
      `/waiter/orders/${order.id}`,
    );
  }
};

// Send low stock alert
const sendLowStockAlert = async (restaurantId, inventoryItemId, itemName, currentStock, reorderLevel) => {
  // eslint-disable-next-line no-undef
  const staff = await RestaurantStaff.findAll({
    where: { restaurant_id: restaurantId, role: ['admin', 'manager'], is_active: true },
  });

  for (const staffMember of staff) {
    await createUserNotification(
      staffMember.user_id,
      restaurantId,
      'low_stock',
      'Low Stock Alert',
      `${itemName} is running low. Current stock: ${currentStock}. Reorder level: ${reorderLevel}`,
      { inventoryItemId, itemName, currentStock, reorderLevel },
    );
  }
};

// Send customer call notification
const sendCustomerCallNotification = async (waiterId, restaurantId, tableNumber, callType, callId) => {
  await createWaiterNotification(
    waiterId,
    restaurantId,
    'customer_call',
    'Customer Assistance Request',
    `Customer at table ${tableNumber} needs assistance (${callType})`,
    'high',
    `/waiter/calls/${callId}`,
    true,
  );
};

// Send SMS notification
const sendSMSNotification = async (phone, type, data) => {
  let message = '';
  
  switch (type) {
    case 'order_confirmation':
      message = `MenuGo: Your order #${data.orderNumber} for $${data.total} has been confirmed. Thank you!`;
      break;
    case 'order_ready':
      message = `MenuGo: Your order #${data.orderNumber} is ready for pickup!`;
      break;
    case 'verification_code':
      message = `MenuGo: Your verification code is: ${data.code}. Valid for 10 minutes.`;
      break;
    default:
      message = data.message;
  }
  
  return sendSMS(phone, message);
};

// Send email notification
const sendEmailNotification = async (email, type, data) => {
  switch (type) {
    case 'welcome':
      // eslint-disable-next-line no-undef
      return sendWelcomeEmail(email, data.name);
    case 'password_reset':
      // eslint-disable-next-line no-undef
      return sendPasswordResetEmail(email, data.name, data.token);
    case 'order_confirmation':
      // eslint-disable-next-line no-undef
      return sendOrderConfirmationEmail(email, data.name, data.orderNumber, data.items, data.total);
    default:
      return sendEmail(email, data.subject, type, data);
  }
};

module.exports = {
  createUserNotification,
  createWaiterNotification,
  sendPushNotification,
  sendNewOrderNotification,
  sendOrderStatusNotification,
  sendLowStockAlert,
  sendCustomerCallNotification,
  sendSMSNotification,
  sendEmailNotification,
};
