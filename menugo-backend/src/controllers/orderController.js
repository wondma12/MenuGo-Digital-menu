const { Order, OrderItem, OrderItemOption, OrderItemModifier, OrderStatusHistory, Restaurant, Table, Waiter, User, Notification } = require('../models');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');
const { generateVerificationCode } = require('../utils/helpers');
const { emitToRestaurant, emitToUser } = require('../config/socket');
const { sendOrderConfirmationEmail } = require('../config/email');
const { Op } = require('sequelize');

// Create order
const createOrder = catchAsync(async (req, res) => {
  const {
    restaurant_id, table_number, customer_name, customer_phone, customer_email,
    items, special_instructions, order_type = 'dine_in',
  } = req.body;

  const restaurant = await Restaurant.findByPk(restaurant_id);
  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  // Calculate totals
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const menuItem = await MenuItem.findByPk(item.menu_item_id);
    if (!menuItem) {
      throw new ApiError(404, `Menu item ${item.menu_item_id} not found`);
    }

    let itemPrice = menuItem.price;
    let optionsTotal = 0;

    // Calculate options price
    if (item.options) {
      for (const opt of item.options) {
        optionsTotal += opt.price_adjustment || 0;
      }
    }

    const itemTotal = (itemPrice + optionsTotal) * item.quantity;
    subtotal += itemTotal;

    orderItems.push({
      menu_item_id: item.menu_item_id,
      item_name: menuItem.name,
      quantity: item.quantity,
      unit_price: itemPrice,
      subtotal: itemTotal,
      special_instructions: item.special_instructions,
      options: item.options || [],
      modifiers: item.modifiers || [],
    });
  }

  const tax_amount = subtotal * (restaurant.tax_rate / 100);
  const service_charge = subtotal * (restaurant.service_charge / 100);
  const total_amount = subtotal + tax_amount + service_charge;

  // Generate verification code
  const verificationCode = generateVerificationCode();

  // Create order
  const order = await Order.create({
    restaurant_id,
    table_number,
    customer_name: customer_name || 'Guest',
    customer_phone,
    customer_email,
    subtotal,
    tax_amount,
    service_charge,
    total_amount,
    status: 'pending',
    order_type,
    special_instructions,
    verification_code: verificationCode,
    verification_code_expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    source: req.body.source || 'qr_code',
  });

  // Create order items
  for (const item of orderItems) {
    const orderItem = await OrderItem.create({
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      item_name: item.item_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.subtotal,
      special_instructions: item.special_instructions,
    });

    // Create options
    if (item.options.length > 0) {
      for (const opt of item.options) {
        await OrderItemOption.create({
          order_item_id: orderItem.id,
          option_name: opt.name,
          choice_name: opt.choice_name,
          price_adjustment: opt.price_adjustment || 0,
        });
      }
    }

    // Create modifiers
    if (item.modifiers && item.modifiers.length > 0) {
      for (const mod of item.modifiers) {
        await OrderItemModifier.create({
          order_item_id: orderItem.id,
          modifier_name: mod.name,
          price_adjustment: mod.price_adjustment || 0,
        });
      }
    }
  }

  // Record status history
  await OrderStatusHistory.create({
    order_id: order.id,
    status: 'pending',
    notes: 'Order placed',
  });

  // Send email confirmation
  if (customer_email) {
    await sendOrderConfirmationEmail(customer_email, customer_name, order.order_number, orderItems, total_amount);
  }

  // Emit socket event
  emitToRestaurant(restaurant_id, 'new_order', { order_id: order.id });

  // Create notification for restaurant
  await Notification.create({
    restaurant_id,
    type: 'new_order',
    title: 'New Order Received',
    message: `Order #${order.order_number} from table ${table_number}`,
    order_id: order.id,
  });

  res.status(201).json(ApiResponse.success({
    order_id: order.id,
    order_number: order.order_number,
    verification_code: verificationCode,
    total_amount,
  }, 'Order created successfully'));
});

// Get orders by restaurant
const getRestaurantOrders = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { status, page = 1, limit = 20, date_from, date_to } = req.query;
  const offset = (page - 1) * limit;

  const where = { restaurant_id: restaurantId };
  if (status) where.status = status;
  if (date_from && date_to) {
    where.created_at = {
      [Op.between]: [new Date(date_from), new Date(date_to)],
    };
  }

  const { count, rows } = await Order.findAndCountAll({
    where,
    include: [
      { model: OrderItem, as: 'items' },
      { model: Waiter, as: 'waiter', include: [{ model: User, as: 'user' }] },
    ],
    limit: parseInt(limit),
    offset,
    order: [['created_at', 'DESC']],
  });

  res.json(ApiResponse.success({
    orders: rows,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
  }));
});

// Get order by ID
const getOrderById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const order = await Order.findByPk(id, {
    include: [
      {
        model: OrderItem,
        as: 'items',
        include: [
          { model: OrderItemOption, as: 'options' },
          { model: OrderItemModifier, as: 'modifiers' },
        ],
      },
      { model: OrderStatusHistory, as: 'status_history' },
      { model: Waiter, as: 'waiter', include: [{ model: User, as: 'user' }] },
    ],
  });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  res.json(ApiResponse.success(order, 'Order retrieved'));
});

// Update order status
const updateOrderStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const userId = req.user.id;

  const order = await Order.findByPk(id);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const oldStatus = order.status;
  await order.update({ status, updated_at: new Date() });

  // Update specific timestamps based on status
  if (status === 'verified' && !order.verified_at) {
    await order.update({ verified_at: new Date(), verified_by: userId });
  } else if (status === 'preparing' && !order.preparation_started_at) {
    await order.update({ preparation_started_at: new Date(), prepared_by: userId });
  } else if (status === 'ready' && !order.ready_at) {
    await order.update({ ready_at: new Date() });
  } else if (status === 'served' && !order.served_at) {
    await order.update({ served_at: new Date(), served_by: userId });
  } else if (status === 'completed' && !order.served_at) {
    await order.update({ served_at: new Date(), served_by: userId });
  }

  // Record status history
  await OrderStatusHistory.create({
    order_id: order.id,
    status,
    changed_by: userId,
    notes,
  });

  // If order is completed, update table status
  if (status === 'completed') {
    await Table.update(
      { status: 'available', current_order_id: null, current_customer_name: null, occupied_since: null },
      { where: { current_order_id: order.id } }
    );
  }

  // Emit socket event
  emitToRestaurant(order.restaurant_id, 'order_status_updated', {
    order_id: order.id,
    status,
    old_status: oldStatus,
  });

  // Create notification
  await Notification.create({
    restaurant_id: order.restaurant_id,
    type: `order_${status}`,
    title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: `Order #${order.order_number} is now ${status}`,
    order_id: order.id,
  });

  res.json(ApiResponse.success({ status }, 'Order status updated'));
});

// Verify order (for waiter)
const verifyOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { verification_code } = req.body;
  const waiterId = req.user.id;

  const order = await Order.findByPk(id);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.status !== 'pending') {
    throw new ApiError(400, 'Order is already processed');
  }

  if (order.verification_code !== verification_code) {
    throw new ApiError(400, 'Invalid verification code');
  }

  if (order.verification_code_expires < new Date()) {
    throw new ApiError(400, 'Verification code has expired');
  }

  // Find waiter
  const waiter = await Waiter.findOne({ where: { user_id: waiterId } });
  if (!waiter) {
    throw new ApiError(404, 'Waiter not found');
  }

  await order.update({
    status: 'verified',
    verified_by: waiterId,
    verified_by_waiter: true,
    verified_at: new Date(),
    waiter_id: waiter.id,
  });

  await OrderStatusHistory.create({
    order_id: order.id,
    status: 'verified',
    changed_by: waiterId,
    notes: 'Order verified by waiter',
  });

  // Update table status
  await Table.update(
    { status: 'occupied', current_order_id: order.id, current_waiter_id: waiter.id },
    { where: { table_number: order.table_number, restaurant_id: order.restaurant_id } }
  );

  emitToRestaurant(order.restaurant_id, 'order_verified', { order_id: order.id });

  res.json(ApiResponse.success({ status: 'verified' }, 'Order verified successfully'));
});

// Get waiter orders
const getWaiterOrders = catchAsync(async (req, res) => {
  const waiterId = req.user.id;

  const waiter = await Waiter.findOne({ where: { user_id: waiterId } });
  if (!waiter) {
    throw new ApiError(404, 'Waiter not found');
  }

  const orders = await Order.findAll({
    where: {
      waiter_id: waiter.id,
      status: { [Op.in]: ['pending', 'verified', 'preparing', 'ready'] },
    },
    include: [
      { model: OrderItem, as: 'items' },
      { model: Table, as: 'table' },
    ],
    order: [['created_at', 'ASC']],
  });

  res.json(ApiResponse.success(orders, 'Waiter orders retrieved'));
});

// Cancel order
const cancelOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const userId = req.user.id;

  const order = await Order.findByPk(id);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (!['pending', 'verified'].includes(order.status)) {
    throw new ApiError(400, 'Order cannot be cancelled at this stage');
  }

  await order.update({
    status: 'cancelled',
    cancelled_by: userId,
    cancelled_at: new Date(),
    cancellation_reason: reason,
  });

  await OrderStatusHistory.create({
    order_id: order.id,
    status: 'cancelled',
    changed_by: userId,
    notes: reason,
  });

  res.json(ApiResponse.success(null, 'Order cancelled'));
});

module.exports = {
  createOrder,
  getRestaurantOrders,
  getOrderById,
  updateOrderStatus,
  verifyOrder,
  getWaiterOrders,
  cancelOrder,
};