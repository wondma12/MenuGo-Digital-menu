const { WaiterCallRequest, Restaurant, Table } = require('../models');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');
const { emitToRestaurant } = require('../sockets');

// Create a call request from a customer (public endpoint)
const createCallRequest = catchAsync(async (req, res) => {
  const restaurantParam = req.params.id;
  const { table_number, call_type = 'service', customer_name = null, notes = null } = req.body;

  // Resolve restaurant by QR identifier or PK
  let restaurant = await Restaurant.findOne({ where: { qr_code_identifier: restaurantParam, is_active: true } });
  if (!restaurant) {
    restaurant = await Restaurant.findByPk(restaurantParam);
    if (restaurant && !restaurant.is_active) {restaurant = null;}
  }

  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found');
  }

  if (!table_number) {
    throw new ApiError(400, 'table_number is required');
  }

  const table = await Table.findOne({ where: { restaurant_id: restaurant.id, table_number: String(table_number) } });
  let tableRecord = table
  if (!tableRecord) {
    // Create a lightweight table entry if not found. This allows customers
    // to call from a table number even if the restaurant hasn't pre-created
    // tables in the system (common for QR-based ordering).
    // We create with minimal fields and default capacity/status.
    tableRecord = await Table.create({ restaurant_id: restaurant.id, table_number: String(table_number) })
  }

  const call = await WaiterCallRequest.create({
    restaurant_id: restaurant.id,
    table_id: tableRecord.id,
    waiter_id: null,
    call_type,
    status: 'pending',
    customer_name,
    notes,
  });

  // Emit restaurant-level event so waiters/kitchen UI refresh
  emitToRestaurant(restaurant.id, 'waiter_call', {
    id: call.id,
    table_id: tableRecord.id,
    table_number,
    call_type,
    notes,
    created_at: call.created_at,
  });

  // Also create waiter notifications so waiters see the call in their notification list
  try {
    const { Waiter } = require('../models');
    const notificationService = require('../services/notificationService');

    // If table has assigned current_waiter, notify that waiter specifically
    const assignedWaiter = await Waiter.findOne({ where: { id: tableRecord.current_waiter_id } }).catch(() => null);
    if (assignedWaiter) {
      await notificationService.sendCustomerCallNotification(assignedWaiter.id, restaurant.id, table_number, call_type, call.id);
    } else {
      // Notify all active waiters in the restaurant
      const waiters = await Waiter.findAll({ where: { restaurant_id: restaurant.id } }).catch(() => []);
      for (const w of waiters) {
        await notificationService.sendCustomerCallNotification(w.id, restaurant.id, table_number, call_type, call.id).catch(() => null);
      }
    }
  } catch (e) {
    // swallow notification errors to avoid failing the public API
    // but log for diagnostics
    const { logger } = require('../utils/logger');
    logger.warn('Failed to create waiter notifications for call request', e && e.message);
  }

  res.status(201).json(ApiResponse.success(call, 'Call request created'));
});

module.exports = {
  createCallRequest,
};
