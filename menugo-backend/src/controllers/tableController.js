const { Table, TableAssignment, TableStatusHistory, TableReservation, Restaurant, Order, OrderItem, Waiter, User } = require('../models');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');
const { generateQRCode } = require('../utils/generateQR');
const { uploadToCloudinary } = require('../config/cloudinary');
const { Op } = require('sequelize');

// Get all tables for a restaurant
const getTables = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;

  const tables = await Table.findAll({
    where: { restaurant_id: restaurantId },
    include: [
      { model: Order, as: 'current_order' },
      { model: Waiter, as: 'current_waiter', include: [{ model: User, as: 'user' }] },
    ],
    order: [['table_number', 'ASC']],
  });

  res.json(ApiResponse.success(tables, 'Tables retrieved'));
});

// Get table by ID
const getTableById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const table = await Table.findByPk(id, {
    include: [
      { model: Restaurant, as: 'restaurant' },
      { model: Order, as: 'current_order', include: [{ model: OrderItem, as: 'items' }] },
      { model: Waiter, as: 'current_waiter' },
      { model: TableAssignment, as: 'assignments', limit: 10, order: [['assigned_at', 'DESC']] },
    ],
  });

  if (!table) {
    throw new ApiError(404, 'Table not found');
  }

  res.json(ApiResponse.success(table, 'Table retrieved'));
});

// Create table
const createTable = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const { table_number, table_name, capacity, section, x_position, y_position, shape, width, height } = req.body;

  const existingTable = await Table.findOne({
    where: { restaurant_id: restaurantId, table_number },
  });

  if (existingTable) {
    throw new ApiError(400, 'Table number already exists');
  }

  const table = await Table.create({
    restaurant_id: restaurantId,
    table_number,
    table_name,
    capacity: capacity || 4,
    section,
    x_position,
    y_position,
    shape: shape || 'rectangle',
    width: width || 80,
    height: height || 80,
    status: 'available',
  });

  res.status(201).json(ApiResponse.success(table, 'Table created'));
});

// Update table
const updateTable = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const table = await Table.findByPk(id);
  if (!table) {
    throw new ApiError(404, 'Table not found');
  }

  await table.update(updates);

  res.json(ApiResponse.success(table, 'Table updated'));
});

// Delete table
const deleteTable = catchAsync(async (req, res) => {
  const { id } = req.params;

  const table = await Table.findByPk(id);
  if (!table) {
    throw new ApiError(404, 'Table not found');
  }

  // Check if table has active orders
  if (table.status === 'occupied') {
    throw new ApiError(400, 'Cannot delete occupied table');
  }

  await table.destroy();

  res.json(ApiResponse.success(null, 'Table deleted'));
});

// Update table status
const updateTableStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const table = await Table.findByPk(id);
  if (!table) {
    throw new ApiError(404, 'Table not found');
  }

  const oldStatus = table.status;

  // Record status history
  await TableStatusHistory.create({
    table_id: table.id,
    previous_status: oldStatus,
    new_status: status,
    changed_by: req.user.id,
    notes,
  });

  await table.update({ status, updated_at: new Date() });

  // If status changed to available, clear current order and waiter
  if (status === 'available') {
    await table.update({
      current_order_id: null,
      current_waiter_id: null,
      current_customer_name: null,
      occupied_since: null,
    });
  }

  res.json(ApiResponse.success({ status }, 'Table status updated'));
});

// Assign waiter to table
const assignWaiter = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { waiter_id, reason } = req.body;

  const table = await Table.findByPk(id);
  if (!table) {
    throw new ApiError(404, 'Table not found');
  }

  const waiter = await Waiter.findByPk(waiter_id);
  if (!waiter) {
    throw new ApiError(404, 'Waiter not found');
  }

  // Record assignment
  await TableAssignment.create({
    restaurant_id: table.restaurant_id,
    table_id: table.id,
    waiter_id,
    reason,
  });

  await table.update({ current_waiter_id: waiter_id });

  res.json(ApiResponse.success({ table_id: table.id, waiter_id }, 'Waiter assigned'));
});

// Get reservations for a table
const getReservations = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  const where = { table_id: id };
  if (date) {
    where.reservation_date = date;
  }

  const reservations = await TableReservation.findAll({
    where,
    order: [['reservation_time', 'ASC']],
  });

  res.json(ApiResponse.success(reservations, 'Reservations retrieved'));
});

// Create reservation
const createReservation = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;
  const {
    table_id, customer_name, customer_phone, customer_email,
    party_size, reservation_date, reservation_time, duration_minutes,
    special_requests,
  } = req.body;

  // Check if table is available at that time
  const existingReservation = await TableReservation.findOne({
    where: {
      table_id,
      reservation_date,
      reservation_time: {
        [Op.between]: [
          reservation_time,
          new Date(new Date(`2000-01-01 ${reservation_time}`).getTime() + (duration_minutes || 120) * 60000).toTimeString().slice(0, 8),
        ],
      },
      status: { [Op.notIn]: ['cancelled', 'completed'] },
    },
  });

  if (existingReservation) {
    throw new ApiError(400, 'Table already reserved at this time');
  }

  const reservation = await TableReservation.create({
    restaurant_id: restaurantId,
    table_id,
    customer_name,
    customer_phone,
    customer_email,
    party_size,
    reservation_date,
    reservation_time,
    duration_minutes: duration_minutes || 120,
    special_requests,
    created_by: req.user.id,
  });

  res.status(201).json(ApiResponse.success(reservation, 'Reservation created'));
});

// Update reservation status
const updateReservationStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;

  const reservation = await TableReservation.findByPk(id);
  if (!reservation) {
    throw new ApiError(404, 'Reservation not found');
  }

  await reservation.update({ status, updated_at: new Date() });

  // If seated, update table status
  if (status === 'seated') {
    await Table.update(
      { status: 'occupied', current_customer_name: reservation.customer_name },
      { where: { id: reservation.table_id } }
    );
  }

  res.json(ApiResponse.success({ status }, 'Reservation status updated'));
});

// Get table layout/map
const getTableLayout = catchAsync(async (req, res) => {
  const { restaurantId } = req.params;

  const tables = await Table.findAll({
    where: { restaurant_id: restaurantId },
    attributes: ['id', 'table_number', 'table_name', 'capacity', 'section', 'x_position', 'y_position', 'shape', 'width', 'height', 'status'],
  });

  const sections = [...new Set(tables.map(t => t.section).filter(Boolean))];

  res.json(ApiResponse.success({
    sections,
    tables,
  }, 'Table layout retrieved'));
});

module.exports = {
  getTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
  assignWaiter,
  getReservations,
  createReservation,
  updateReservationStatus,
  getTableLayout,
};