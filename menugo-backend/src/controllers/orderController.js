const { Order, OrderItem, OrderItemOption, OrderItemModifier, OrderStatusHistory, Restaurant, Table, Waiter, User, Notification, MenuItem, Coupon, CouponUsage, Review } = require('../models');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');
const { generateVerificationCode } = require('../utils/helpers');
const { emitToRestaurant, emitToUser } = require('../sockets');
const { sendOrderConfirmationEmail } = require('../config/email');
const { Op } = require('sequelize');
const KitchenService = require('../services/kitchenService');
const { logger } = require('../utils/logger');

// Create order
const createOrder = catchAsync(async (req, res) => {
  const {
    restaurant_id, table_number, customer_name, customer_phone, customer_email,
    items, special_instructions, order_type = 'dine_in',
  } = req.body;

  // Support both slug-style `qr_code_identifier` and UUID primary key values for restaurant
  let restaurant = await Restaurant.findOne({ where: { qr_code_identifier: restaurant_id, is_active: true } });
  if (!restaurant) {
    restaurant = await Restaurant.findByPk(restaurant_id);
    if (restaurant && !restaurant.is_active) restaurant = null;
  }

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

  // Delivery settings and fees
  const rSettings = restaurant.settings || {};
  const enableDelivery = typeof rSettings.enable_delivery !== 'undefined' ? rSettings.enable_delivery : (typeof rSettings.enableDelivery !== 'undefined' ? rSettings.enableDelivery : false);
  const freeDeliveryThreshold = Number(rSettings.free_delivery_threshold ?? rSettings.freeDeliveryThreshold ?? 0);
  const deliveryFeeBase = Number(restaurant.delivery_fee ?? rSettings.delivery_fee ?? 0);

  // Handle coupon application (optional)
  let discount_amount = 0;
  const couponCode = (req.body.coupon_code || req.body.couponCode || '').toString().trim();
  let appliedCoupon = null;
  if (couponCode) {
    const coupon = await Coupon.findOne({
      where: {
        restaurant_id: restaurant.id,
        code: couponCode.toUpperCase(),
        is_active: true,
        start_date: { [Op.lte]: new Date() },
        end_date: { [Op.gte]: new Date() },
      },
    });

    if (!coupon) {
      throw new ApiError(404, 'Invalid or expired coupon');
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      throw new ApiError(400, 'Coupon usage limit exceeded');
    }

    if (coupon.minimum_order_amount && subtotal < Number(coupon.minimum_order_amount)) {
      throw new ApiError(400, `Minimum order amount of $${coupon.minimum_order_amount} required`);
    }

    // Calculate discount
    if (coupon.discount_type === 'percentage') {
      discount_amount = (subtotal * coupon.discount_value) / 100;
      if (coupon.max_discount_amount) discount_amount = Math.min(discount_amount, Number(coupon.max_discount_amount));
    } else if (coupon.discount_type === 'fixed_amount') {
      discount_amount = Number(coupon.discount_value);
    }

    appliedCoupon = coupon;
  }

  // Apply delivery fee if applicable
  let delivery_fee = 0
  if (order_type === 'delivery') {
    if (!enableDelivery) {
      throw new ApiError(400, 'Delivery is not available for this restaurant')
    }

    // Enforce minimum order amount for delivery if set
    const minOrder = Number(restaurant.minimum_order_amount ?? rSettings.minimum_order_amount ?? 0)
    if (minOrder > 0 && subtotal < minOrder) {
      throw new ApiError(400, `Minimum order amount of $${minOrder} required for delivery`)
    }

    delivery_fee = deliveryFeeBase
    if (freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold) {
      delivery_fee = 0
    }
  }

  const total_amount = subtotal + tax_amount + service_charge + delivery_fee - (discount_amount || 0);

  // Generate verification code
  const verificationCode = generateVerificationCode();

  // Create order (store actual restaurant.id)
  const order = await Order.create({
    restaurant_id: restaurant.id,
    table_number,
    customer_name: customer_name || 'Guest',
    customer_phone,
    customer_email,
    subtotal,
    tax_amount,
    service_charge,
    discount_amount: discount_amount || 0,
    delivery_fee,
    delivery_address: req.body.delivery_address || null,
    delivery_latitude: req.body.delivery_latitude || null,
    delivery_longitude: req.body.delivery_longitude || null,
    total_amount,
    status: 'pending',
    order_type,
    special_instructions,
    verification_code: verificationCode,
    verification_code_expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    source: req.body.source || 'qr_code',
    coupon_code: appliedCoupon ? appliedCoupon.code : null,
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

  // If table provided, associate table record to this order so waiters see it
  if (table_number) {
    try {
      const table = await Table.findOne({ where: { restaurant_id: restaurant.id, table_number } });
      if (table) {
        await table.update({ status: 'occupied', current_order_id: order.id, current_customer_name: order.customer_name, occupied_since: new Date() });
        await order.update({ table_id: table.id });
      }
    } catch (err) {
      console.error('Failed to attach table to public order', err);
    }
  }

  // Send email confirmation
  if (customer_email) {
    await sendOrderConfirmationEmail(customer_email, customer_name, order.order_number, orderItems, total_amount);
  }

  // Emit socket event
  emitToRestaurant(restaurant.id, 'new_order', { order_id: order.id });

  // Create notification for restaurant
  await Notification.create({
    restaurant_id: restaurant.id,
    type: 'new_order',
    title: 'New Order Received',
    message: `Order #${order.order_number} ${order_type === 'delivery' ? `for delivery to ${req.body.delivery_address || 'N/A'}` : `from table ${table_number || 'N/A'}`}`,
    order_id: order.id,
  });

  // Record coupon usage if applied
  if (appliedCoupon && Number(discount_amount) > 0) {
    await CouponUsage.create({
      coupon_id: appliedCoupon.id,
      order_id: order.id,
      user_id: req.user ? req.user.id : null,
      discount_amount: discount_amount,
    });

    await appliedCoupon.increment('used_count');
  }

  res.status(201).json(ApiResponse.success({
    order_id: order.id,
    order_number: order.order_number,
    verification_code: verificationCode,
    total_amount,
  }, 'Order created successfully'));
});

// Create order (by authenticated waiter/pos)
const createOrderByWaiter = catchAsync(async (req, res) => {
  const {
    restaurant_id, table_number, customer_name, customer_phone, customer_email,
    items, special_instructions, order_type = 'dine_in',
  } = req.body;

  // Ensure waiter exists for authenticated user
  const waiterUserId = req.user && req.user.id;
  const waiter = await Waiter.findOne({ where: { user_id: waiterUserId } });
  if (!waiter) {
    throw new ApiError(404, 'Waiter not found');
  }

  // Resolve restaurant similar to public createOrder
  let restaurant = await Restaurant.findOne({ where: { qr_code_identifier: restaurant_id, is_active: true } });
  if (!restaurant) {
    restaurant = await Restaurant.findByPk(restaurant_id);
    if (restaurant && !restaurant.is_active) restaurant = null;
  }

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

  // Handle coupon application (optional)
  let discount_amount = 0;
  const couponCode = (req.body.coupon_code || req.body.couponCode || '').toString().trim();
  let appliedCoupon = null;
  if (couponCode) {
    const coupon = await Coupon.findOne({
      where: {
        restaurant_id: restaurant.id,
        code: couponCode.toUpperCase(),
        is_active: true,
        start_date: { [Op.lte]: new Date() },
        end_date: { [Op.gte]: new Date() },
      },
    });

    if (!coupon) {
      throw new ApiError(404, 'Invalid or expired coupon');
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      throw new ApiError(400, 'Coupon usage limit exceeded');
    }

    if (coupon.minimum_order_amount && subtotal < Number(coupon.minimum_order_amount)) {
      throw new ApiError(400, `Minimum order amount of $${coupon.minimum_order_amount} required`);
    }

    if (coupon.discount_type === 'percentage') {
      discount_amount = (subtotal * coupon.discount_value) / 100;
      if (coupon.max_discount_amount) discount_amount = Math.min(discount_amount, Number(coupon.max_discount_amount));
    } else if (coupon.discount_type === 'fixed_amount') {
      discount_amount = Number(coupon.discount_value);
    }

    appliedCoupon = coupon;
  }

  // Delivery settings and fees (waiter-created orders)
  const rSettings = restaurant.settings || {};
  const enableDelivery = typeof rSettings.enable_delivery !== 'undefined' ? rSettings.enable_delivery : (typeof rSettings.enableDelivery !== 'undefined' ? rSettings.enableDelivery : false);
  const freeDeliveryThreshold = Number(rSettings.free_delivery_threshold ?? rSettings.freeDeliveryThreshold ?? 0);
  const deliveryFeeBase = Number(restaurant.delivery_fee ?? rSettings.delivery_fee ?? 0);

  let delivery_fee = 0
  if (order_type === 'delivery') {
    if (!enableDelivery) {
      throw new ApiError(400, 'Delivery is not available for this restaurant')
    }

    const minOrder = Number(restaurant.minimum_order_amount ?? rSettings.minimum_order_amount ?? 0)
    if (minOrder > 0 && subtotal < minOrder) {
      throw new ApiError(400, `Minimum order amount of $${minOrder} required for delivery`)
    }

    delivery_fee = deliveryFeeBase
    if (freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold) {
      delivery_fee = 0
    }
  }

  const total_amount = subtotal + tax_amount + service_charge + delivery_fee - (discount_amount || 0);

  // Optionally generate verification code
  const verificationCode = req.body.generate_verification ? generateVerificationCode() : null;

  // Create order with waiter association
  const order = await Order.create({
    restaurant_id: restaurant.id,
    table_number,
    customer_name: customer_name || 'Guest',
    customer_phone,
    customer_email,
    subtotal,
    tax_amount,
    service_charge,
    discount_amount: discount_amount || 0,
    delivery_fee,
    delivery_address: req.body.delivery_address || null,
    delivery_latitude: req.body.delivery_latitude || null,
    delivery_longitude: req.body.delivery_longitude || null,
    total_amount,
    status: 'pending',
    order_type,
    special_instructions,
    verification_code: verificationCode,
    verification_code_expires: verificationCode ? new Date(Date.now() + 15 * 60 * 1000) : null,
    source: req.body.source || 'waiter',
    coupon_code: appliedCoupon ? appliedCoupon.code : null,
    waiter_id: waiter.id,
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
    notes: 'Order placed by waiter',
  });

  // If table provided, associate table and mark occupied
  if (table_number) {
    try {
      const table = await Table.findOne({ where: { restaurant_id: restaurant.id, table_number } });
      if (table) {
        await table.update({ status: 'occupied', current_order_id: order.id, current_waiter_id: waiter.id, current_customer_name: order.customer_name, occupied_since: new Date() });
        await order.update({ table_id: table.id });
      }
    } catch (err) {
      // non-fatal
      console.error('Failed to attach table to waiter order', err);
    }
  }

  // Send email confirmation
  if (customer_email) {
    await sendOrderConfirmationEmail(customer_email, customer_name, order.order_number, orderItems, total_amount);
  }

  // Emit socket event
  emitToRestaurant(restaurant.id, 'new_order', { order_id: order.id });

  // Create notification for restaurant
  await Notification.create({
    restaurant_id: restaurant.id,
    type: 'new_order',
    title: 'New Order Received',
    message: `Order #${order.order_number} ${order_type === 'delivery' ? `for delivery to ${req.body.delivery_address || 'N/A'}` : `from table ${table_number || 'N/A'}`}`,
    order_id: order.id,
  });

  // Record coupon usage if applied
  if (appliedCoupon && Number(discount_amount) > 0) {
    await CouponUsage.create({
      coupon_id: appliedCoupon.id,
      order_id: order.id,
      user_id: req.user ? req.user.id : null,
      discount_amount: discount_amount,
    });

    await appliedCoupon.increment('used_count');
  }

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
  const { status, page = 1, limit = 20, date_from, date_to, dateRange, search } = req.query;
  const tableNumber = req.query.table || req.query.table_number || null;
  const offset = (page - 1) * limit;

  const where = { restaurant_id: restaurantId };
  // Table filter: if a table number is provided (public/customer view), restrict to that table
  if (tableNumber) {
    where.table_number = tableNumber;
  }

  // Status handling:
  // - If `status` query param is provided:
  //    - 'all' => do not filter by status (return all statuses)
  //    - other => filter by that status
  // - If no `status` provided, default to showing verified/active orders only (exclude pending)
  if (typeof status !== 'undefined' && status !== null) {
    if (status === 'all') {
      // explicitly requested all statuses — no status filter applied
    } else {
      where.status = status;
    }
  } else {
    // No status provided — default to verified/active orders only
    if (!tableNumber) {
      where.status = { [Op.in]: ['verified', 'preparing', 'ready', 'served', 'completed'] };
    }
  }

  // Support several date filtering formats coming from frontend:
  // - explicit date_from & date_to query params
  // - `dateRange` as JSON string {start, end}
  // - `dateRange` as single ISO date (filter that day)
  // - `dateRange` as comma or dash separated pair
  let startDate = date_from || null;
  let endDate = date_to || null;
  if (!startDate && !endDate && dateRange) {
    try {
      const parsed = JSON.parse(dateRange);
      if (parsed && parsed.start && parsed.end) {
        startDate = parsed.start;
        endDate = parsed.end;
      }
    } catch (err) {
      // not JSON, try common separators or single date
      if (typeof dateRange === 'string') {
        if (dateRange.includes(',')) {
          const parts = dateRange.split(',').map(p => p.trim());
          startDate = parts[0]; endDate = parts[1] || parts[0];
        } else if (dateRange.includes(' - ')) {
          const parts = dateRange.split(' - ').map(p => p.trim());
          startDate = parts[0]; endDate = parts[1] || parts[0];
        } else {
          // single date -> filter that whole day
          startDate = dateRange;
          endDate = dateRange;
        }
      }
    }
  }

  if (startDate && endDate) {
    const s = new Date(startDate);
    s.setHours(0,0,0,0);
    const e = new Date(endDate);
    e.setHours(23,59,59,999);
    where[Op.and] = (where[Op.and] || []).concat([{ created_at: { [Op.between]: [s, e] } }]);
  }

  // Search by customer name, order number, or phone
  if (search && String(search).trim() !== '') {
    const q = `%${String(search).trim()}%`;
    where[Op.and] = (where[Op.and] || []).concat([{
      [Op.or]: [
        { customer_name: { [Op.like]: q } },
        { order_number: { [Op.like]: q } },
        { customer_phone: { [Op.like]: q } },
      ],
    }]);
  }

  // Gather simple status counts for dashboard
  let verifiedTotal = 0, pendingCount = 0, preparingCount = 0, readyCount = 0, completedCount = 0;
  try {
    verifiedTotal = await Order.count({ where: { restaurant_id: restaurantId, status: 'verified' } });
    pendingCount = await Order.count({ where: { restaurant_id: restaurantId, status: 'pending' } });
    preparingCount = await Order.count({ where: { restaurant_id: restaurantId, status: 'preparing' } });
    readyCount = await Order.count({ where: { restaurant_id: restaurantId, status: 'ready' } });
    completedCount = await Order.count({ where: { restaurant_id: restaurantId, status: 'completed' } });
  } catch (err) {
    console.error('Order status counts error:', err);
  }

  try {
    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: OrderItem,
          as: 'items',
          include: [
              { model: OrderItemOption, as: 'item_options_selected' },
              { model: OrderItemModifier, as: 'item_modifiers_selected' },
              { model: MenuItem, as: 'menu_item' },
            ],
        },
        { model: Waiter, as: 'order_waiter', include: [{ model: User, as: 'user' }] },
      ],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']],
    });

    // Normalize rows to plain objects and convert to camelCase shape expected by frontend
    const normalized = rows.map((r) => {
      const o = r.get ? r.get({ plain: true }) : r;
      const items = (o.items || []).map((it) => {
        const menu = it.menu_item || null;
        return {
          id: it.id,
          itemId: it.menu_item_id || (menu && menu.id) || null,
          name: it.item_name || (menu && menu.name) || null,
          image: (menu && (menu.image_url || menu.image || menu.thumbnail_url)) || null,
          quantity: it.quantity,
          unitPrice: parseFloat(it.unit_price || 0),
          subtotal: parseFloat(it.subtotal || 0),
          specialInstructions: it.special_instructions || null,
          options: (it.item_options_selected || []).map((opt) => ({
            id: opt.id,
            name: opt.option_name || opt.name,
            choice: opt.choice_name || opt.choice || null,
            price: parseFloat(opt.price_adjustment || 0),
          })),
          modifiers: (it.item_modifiers_selected || []).map((m) => ({
            id: m.id,
            name: m.modifier_name || m.name,
            price: parseFloat(m.price_adjustment || 0),
          })),
        };
      });

      return {
        id: o.id,
        orderNumber: o.order_number,
        customerName: o.customer_name,
        tableNumber: o.table_number,
        totalAmount: parseFloat(o.total_amount || 0),
        subtotal: parseFloat(o.subtotal || 0),
        taxAmount: parseFloat(o.tax_amount || 0),
        serviceCharge: parseFloat(o.service_charge || 0),
        status: o.status,
        orderType: o.order_type,
        createdAt: o.created_at,
        items,
        itemCount: items.length,
        raw: o, // keep original for debugging if needed
      };
    });

    return res.json(ApiResponse.success({
      orders: normalized,
      total: count,
      verified_total: verifiedTotal,
      pending: pendingCount,
      preparing: preparingCount,
      ready: readyCount,
      completed: completedCount,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
    }));
  } catch (error) {
    console.error('Error fetching restaurant orders', error);
    return res.status(500).json(ApiResponse.error('Failed to fetch orders'));
  }
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
          { model: OrderItemOption, as: 'item_options_selected' },
          { model: OrderItemModifier, as: 'item_modifiers_selected' },
          { model: MenuItem, as: 'menu_item' },
        ],
      },
      { model: OrderStatusHistory, as: 'status_history' },
      { model: Waiter, as: 'order_waiter', include: [{ model: User, as: 'user' }] },
    ],
  });

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const o = order.get ? order.get({ plain: true }) : order;
  const items = (o.items || []).map((it) => {
    const menu = it.menu_item || null;
    return {
      id: it.id,
      itemId: it.menu_item_id || (menu && menu.id) || null,
      name: it.item_name || (menu && menu.name) || null,
      image: (menu && (menu.image_url || menu.image || menu.thumbnail_url)) || null,
      quantity: it.quantity,
      unitPrice: parseFloat(it.unit_price || 0),
      subtotal: parseFloat(it.subtotal || 0),
      specialInstructions: it.special_instructions || null,
      options: (it.item_options_selected || []).map((opt) => ({
        id: opt.id,
        name: opt.option_name || opt.name,
        choice: opt.choice_name || opt.choice || null,
        price: parseFloat(opt.price_adjustment || 0),
      })),
      modifiers: (it.item_modifiers_selected || []).map((m) => ({
        id: m.id,
        name: m.modifier_name || m.name,
        price: parseFloat(m.price_adjustment || 0),
      })),
    };
  });

  const normalized = {
    id: o.id,
    orderNumber: o.order_number,
    customerName: o.customer_name,
    tableNumber: o.table_number,
    totalAmount: parseFloat(o.total_amount || 0),
    subtotal: parseFloat(o.subtotal || 0),
    taxAmount: parseFloat(o.tax_amount || 0),
    serviceCharge: parseFloat(o.service_charge || 0),
    status: o.status,
    orderType: o.order_type,
    createdAt: o.created_at,
    items,
    itemCount: items.length,
    statusHistory: o.status_history || [],
    waiter: o.order_waiter ? (o.order_waiter.user || {}) : null,
    raw: o,
  };

  // Include whether the current user has left a review for this order (used by frontend)
  try {
    const existingReview = await Review.findOne({ where: { order_id: id, user_id: req.user ? req.user.id : null } });
    normalized.hasReview = !!existingReview;
    if (existingReview) normalized.reviewId = existingReview.id;
  } catch (e) {
    normalized.hasReview = false;
  }

  res.json(ApiResponse.success(normalized, 'Order retrieved'));
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

  // Enforce role-based allowed status transitions
  const kitchenOnlyStatuses = ['preparing', 'ready', 'completed', 'served'];
  const waiterAllowedStatuses = ['verified', 'rejected', 'cancelled'];
  if (req.user && req.user.role === 'waiter') {
    // Waiters may only change a small subset of statuses (verify/reject/cancel)
    if (!waiterAllowedStatuses.includes(status)) {
      throw new ApiError(403, 'Waiters are not allowed to set this status');
    }

    // Ensure the waiter is assigned to this order (prevents modifying other waiters orders)
    const waiterRecord = await Waiter.findOne({ where: { user_id: req.user.id } });
    if (!waiterRecord || (order.waiter_id && order.waiter_id !== waiterRecord.id)) {
      throw new ApiError(403, 'You are not assigned to this order');
    }
  }
  // Prevent non-kitchen staff from setting kitchen lifecycle statuses
  if (kitchenOnlyStatuses.includes(status) && req.user && req.user.role !== 'platform_admin' && req.user.role !== 'restaurant_admin') {
    // Allow kitchen roles to handle these through kitchen endpoints only
    throw new ApiError(403, 'Only kitchen staff may set preparing/ready/completed/served statuses');
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
  // Emit socket events for frontend consumers
  // 'order_updated' is the canonical event used by frontend listeners
  emitToRestaurant(order.restaurant_id, 'order_updated', {
    order_id: order.id,
    status,
    old_status: oldStatus,
  });

  // Additionally emit a dedicated 'order_ready' event when order becomes ready
  if (status === 'ready') {
    emitToRestaurant(order.restaurant_id, 'order_ready', { order_id: order.id });
  }

  // Create notification
  // Determine safe notification type (avoid DB enum errors)
  let notificationType = `order_${status}`;
  const allowedNotificationTypes = [
    'new_order', 'order_verified', 'order_preparing', 'order_ready', 'order_served',
    'order_cancelled', 'order_completed', 'low_stock', 'new_review', 'promotion', 'system'
  ];
  if (!allowedNotificationTypes.includes(notificationType)) {
    if (status === 'rejected') notificationType = 'order_cancelled';
    else notificationType = 'system';
  }

  await Notification.create({
    restaurant_id: order.restaurant_id,
    type: notificationType,
    title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: `Order #${order.order_number} is now ${status}`,
    order_id: order.id,
  });

  res.json(ApiResponse.success({ status }, 'Order status updated'));
});

// Verify order (for waiter)
const verifyOrder = catchAsync(async (req, res) => {
  const { id } = req.params;
    const { verification_code, method } = req.body;
  const waiterId = req.user.id;

  const order = await Order.findByPk(id);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  if (order.status !== 'pending') {
    throw new ApiError(400, 'Order is already processed');
  }

  // Support manual verification by waiters (method='manual')
  if (!method || method !== 'manual') {
    if (order.verification_code !== verification_code) {
      throw new ApiError(400, 'Invalid verification code');
    }

    if (order.verification_code_expires < new Date()) {
      throw new ApiError(400, 'Verification code has expired');
    }
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

  // Notify frontend listeners about the update as well
  emitToRestaurant(order.restaurant_id, 'order_updated', { order_id: order.id, status: 'verified', old_status: 'pending' });

  // Notify restaurant / kitchen that order has been verified by waiter
  await Notification.create({
    restaurant_id: order.restaurant_id,
    type: 'order_verified',
    title: 'Order Verified',
    message: `Order #${order.order_number} verified by waiter`,
    order_id: order.id,
  });

  // Create a kitchen order so the kitchen UI receives it and chef can manage lifecycle
  try {
    // Load order items with modifiers/options
    const fullOrder = await Order.findByPk(order.id, {
        include: [
        { model: OrderItem, as: 'items', include: [
          { model: OrderItemOption, as: 'item_options_selected' },
          { model: OrderItemModifier, as: 'item_modifiers_selected' },
          { model: MenuItem, as: 'menu_item' }
        ] },
      ],
    });

    const itemsForKitchen = (fullOrder.items || []).map(it => ({
      item_id: it.menu_item_id,
      item_name: it.item_name || (it.menu_item && it.menu_item.name) || null,
      quantity: it.quantity,
      preparation_time: (it.menu_item && it.menu_item.preparation_time) || it.preparation_time || null,
      special_instructions: it.special_instructions,
      modifiers: (it.item_modifiers_selected || []).map(m => ({ name: m.modifier_name || m.name, price: m.price_adjustment || 0 })),
      category: it.menu_item ? (it.menu_item.category_id || it.menu_item.category) : null,
      image: it.menu_item ? (it.menu_item.image_url || it.menu_item.image) : null,
    }));

    const kitchenPayload = {
      order_id: order.id,
      restaurant_id: order.restaurant_id,
      // Ensure order_number is not null (DB requires it). Fall back to order id when missing.
      order_number: order.order_number || String(order.id),
      table_number: order.table_number,
      customer_name: order.customer_name,
      // Kitchen `waiter_id` FK references `users.id`. Use waiter.user_id (the user PK) if available.
      waiter_id: waiter.user_id || waiterId,
      waiter_name: req.user?.name || null,
      items: itemsForKitchen,
      notes: order.special_instructions,
    };

    const kitchenOrder = await KitchenService.createKitchenOrder(kitchenPayload);

    // Notify kitchen/restaurant clients to refresh
    emitToRestaurant(order.restaurant_id, 'kitchen_updated', { order: kitchenOrder });
    // Also emit a general new-order event so admin/other restaurant clients receive it
    emitToRestaurant(order.restaurant_id, 'new-order', { order: kitchenOrder });
  } catch (err) {
    logger.error('Failed to create kitchen order after verification', err);
  }

  res.json(ApiResponse.success({ status: 'verified' }, 'Order verified successfully'));
});

// Get waiter orders (include customer orders at tables assigned to waiter)
const getWaiterOrders = catchAsync(async (req, res) => {
  const waiterId = req.user.id;

  const waiter = await Waiter.findOne({ where: { user_id: waiterId } });
  if (!waiter) {
    throw new ApiError(404, 'Waiter not found');
  }

  const { status, search } = req.query;
  const { range } = req.query; // optional: today|week|month|year|all

  // Find tables currently assigned to this waiter
  const assignedTables = await Table.findAll({ where: { current_waiter_id: waiter.id }, attributes: ['id'] });
  const tableIds = assignedTables.map(t => t.id).filter(Boolean);

  // Build base status filter
  const defaultStatuses = ['pending', 'verified', 'preparing', 'ready'];
  const statusFilter = status && status !== 'all' ? status : { [Op.in]: defaultStatuses };

  // Build OR clauses for orders visible to this waiter:
  // - orders explicitly assigned to waiter
  // - orders on tables currently assigned to waiter
  // - (important) pending orders for the restaurant (visible to all waiters)
  const orClauses = [{ waiter_id: waiter.id }];
  if (tableIds.length) orClauses.push({ table_id: { [Op.in]: tableIds } });

  // Determine if the requested status set includes 'pending'
  let statusIncludesPending = false;
  if (!status || status === 'all' || status === 'pending') {
    statusIncludesPending = true;
  } else if (typeof statusFilter === 'object' && statusFilter[Op.in] && Array.isArray(statusFilter[Op.in]) && statusFilter[Op.in].includes('pending')) {
    statusIncludesPending = true;
  }

  if (statusIncludesPending) {
    // include any pending orders for this restaurant so waiters can see new QR orders
    orClauses.push({ [Op.and]: [{ status: 'pending' }, { restaurant_id: waiter.restaurant_id }] });
  }

  // Compose final where clause: statusFilter AND (any of the orClauses)
  const where = {
    status: statusFilter,
    [Op.or]: orClauses,
  };

  // Apply date range filter if requested
  if (range && range !== 'all') {
    const now = new Date();
    let startDate = null;
    switch (range) {
      case 'today':
        startDate = new Date(); startDate.setHours(0,0,0,0); break;
      case 'week':
        startDate = new Date(); startDate.setDate(startDate.getDate() - 7); startDate.setHours(0,0,0,0); break;
      case 'month':
        startDate = new Date(); startDate.setMonth(startDate.getMonth() - 1); startDate.setHours(0,0,0,0); break;
      case 'year':
        startDate = new Date(); startDate.setFullYear(startDate.getFullYear() - 1); startDate.setHours(0,0,0,0); break;
      default:
        startDate = null;
    }

    if (startDate) {
      const endDate = new Date(); endDate.setHours(23,59,59,999);
      // If there are existing Op.and clauses, append created_at condition
      if (!where[Op.and]) where[Op.and] = [];
      where[Op.and].push({ created_at: { [Op.between]: [startDate, endDate] } });
    }
  }

  if (search) {
    // apply search filter across order_number and customer_name
    where[Op.and] = [
      { [Op.or]: orClauses },
      {
        [Op.or]: [
          { order_number: { [Op.like]: `%${search}%` } },
          { customer_name: { [Op.like]: `%${search}%` } },
        ],
      },
    ];
    // ensure status still applied
    where.status = statusFilter;
  }

  const orders = await Order.findAll({
    where,
    include: [
      {
        model: OrderItem,
        as: 'items',
        include: [
          { model: OrderItemOption, as: 'item_options_selected' },
          { model: OrderItemModifier, as: 'item_modifiers_selected' },
          { model: MenuItem, as: 'menu_item' },
        ],
      },
      { model: Table, as: 'order_table' },
    ],
    order: [['created_at', 'ASC']],
  });

  // Normalize orders into front-end friendly shape (include item name and image)
  const normalized = orders.map((r) => {
    const o = r.get ? r.get({ plain: true }) : r;
    const items = (o.items || []).map((it) => {
      const menu = it.menu_item || null;
      return {
        id: it.id,
        itemId: it.menu_item_id || (menu && menu.id) || null,
        name: it.item_name || (menu && menu.name) || null,
        image: (menu && (menu.image_url || menu.image || menu.thumbnail_url)) || null,
        quantity: it.quantity,
        unitPrice: parseFloat(it.unit_price || 0),
        subtotal: parseFloat(it.subtotal || 0),
        specialInstructions: it.special_instructions || null,
        options: (it.item_options_selected || []).map((opt) => ({
          id: opt.id,
          name: opt.option_name || opt.name,
          choice: opt.choice_name || opt.choice || null,
          price: parseFloat(opt.price_adjustment || 0),
        })),
        modifiers: (it.item_modifiers_selected || []).map((m) => ({
          id: m.id,
          name: m.modifier_name || m.name,
          price: parseFloat(m.price_adjustment || 0),
        })),
      };
    });

    return {
      id: o.id,
      orderNumber: o.order_number,
      customerName: o.customer_name,
      tableNumber: o.table_number,
      totalAmount: parseFloat(o.total_amount || 0),
      subtotal: parseFloat(o.subtotal || 0),
      taxAmount: parseFloat(o.tax_amount || 0),
      serviceCharge: parseFloat(o.service_charge || 0),
      status: o.status,
      orderType: o.order_type,
      createdAt: o.created_at,
      items,
      itemCount: items.length,
      raw: o,
    };
  });

  res.json(ApiResponse.success(normalized, 'Waiter orders retrieved'));
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
  createOrderByWaiter,
  getRestaurantOrders,
  getOrderById,
  updateOrderStatus,
  verifyOrder,
  getWaiterOrders,
  cancelOrder,
};