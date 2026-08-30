const { WaiterCallRequest, Restaurant, Table } = require('../models');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');
const { emitToRestaurant } = require('../sockets');

// Create a call request from a customer (public endpoint)
const createCallRequest = catchAsync(async (req, res) => {
  const restaurantParam = req.params.id;
  const { table_number, call_type = 'service', customer_name = null, notes = null } = req.body;

  const normalizeIdentifier = (value) => {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
  }

  // Resolve restaurant by QR identifier or primary key.
  // Allow forgiving slug/name resolution for customer-facing identifiers.
  let restaurant = await Restaurant.findOne({ where: { qr_code_identifier: restaurantParam, deleted_at: null, is_active: true } });
  if (!restaurant) {
    restaurant = await Restaurant.findOne({ where: { id: restaurantParam, deleted_at: null, is_active: true } }).catch(() => null);
  }

  if (!restaurant) {
    const normalizedParam = normalizeIdentifier(restaurantParam)
    const candidates = await Restaurant.findAll({ where: { deleted_at: null, is_active: true } })
    restaurant = candidates.find((r) => {
      try {
        const slug = normalizeIdentifier(r.qr_code_identifier) || normalizeIdentifier(r.name)
        return slug === normalizedParam || normalizeIdentifier(r.name) === normalizedParam
      } catch (e) {
        return false
      }
    }) || null
  }

  if (!restaurant) {
    throw new ApiError(404, 'Restaurant not found')
  }

  if (!table_number) {
    throw new ApiError(400, 'table_number is required');
  }

  const normalizedTableNumber = String(table_number).trim();
  const table = await Table.findOne({ where: { restaurant_id: restaurant.id, table_number: normalizedTableNumber } });

  if (!table) {
    throw new ApiError(400, 'Invalid table number. Please use a valid table number from this restaurant.');
  }

  const tableRecord = table;

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
