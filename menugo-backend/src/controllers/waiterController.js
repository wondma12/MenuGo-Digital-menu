const { Op } = require('sequelize');
const {
  Waiter,
  WaiterShift,
  WaiterNotification,
  WaiterCallRequest,
  WaiterPerformance,
  WaiterRealtimeStatus,
  Order,
  Table,
  User,
  TableReservation,
} = require('../models');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');

const getCurrentWaiter = async (req) => {
  if (req.waiter) return req.waiter;

  const waiter = await Waiter.findOne({
    where: { user_id: req.user.id },
  });

  if (!waiter) {
    throw new ApiError(404, 'Waiter not found');
  }

  return waiter;
};

const getDashboard = catchAsync(async (req, res) => {
  const waiter = await getCurrentWaiter(req);

  const [activeOrders, pendingCalls, unreadNotifications, currentTables, latestPerformance] = await Promise.all([
    Order.count({
      where: {
        waiter_id: waiter.id,
        status: { [Op.in]: ['pending', 'verified', 'preparing', 'ready'] },
      },
    }),
    WaiterCallRequest.count({
      where: {
        [Op.or]: [{ waiter_id: waiter.id }, { waiter_id: null, restaurant_id: waiter.restaurant_id }],
        status: { [Op.in]: ['pending', 'acknowledged'] },
      },
    }),
    WaiterNotification.count({
      where: { waiter_id: waiter.id, is_read: false },
    }),
    Table.count({
      where: { current_waiter_id: waiter.id },
    }),
    WaiterPerformance.findOne({
      where: { waiter_id: waiter.id },
      order: [['date', 'DESC']],
    }),
  ]);

  res.json(
    ApiResponse.success(
      {
        active_orders: activeOrders,
        pending_calls: pendingCalls,
        unread_notifications: unreadNotifications,
        assigned_tables: currentTables,
        performance: latestPerformance,
      },
      'Waiter dashboard retrieved'
    )
  );
});

const startShift = catchAsync(async (req, res) => {
  const waiter = await getCurrentWaiter(req);
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const shiftStart = req.body.shift_start || waiter.shift_start || now.toTimeString().slice(0, 5);
  const shiftEnd = req.body.shift_end || waiter.shift_end || '23:59';

  let shift = await WaiterShift.findOne({
    where: {
      waiter_id: waiter.id,
      shift_date: { [Op.gte]: today },
    },
    order: [['created_at', 'DESC']],
  });

  if (shift && shift.status === 'active') {
    throw new ApiError(400, 'Shift is already active');
  }

  if (shift) {
    await shift.update({
      shift_start: shift.shift_start || shiftStart,
      shift_end: shift.shift_end || shiftEnd,
      actual_start: now,
      status: 'active',
      break_start: null,
      break_end: null,
    });
  } else {
    shift = await WaiterShift.create({
      waiter_id: waiter.id,
      shift_date: now,
      shift_start: shiftStart,
      shift_end: shiftEnd,
      actual_start: now,
      status: 'active',
    });
  }

  await waiter.update({
    is_on_duty: true,
    current_shift_start: now,
    current_shift_end: null,
  });

  res.json(ApiResponse.success(shift, 'Shift started successfully'));
});

const endShift = catchAsync(async (req, res) => {
  const waiter = await getCurrentWaiter(req);
  const now = new Date();

  const shift = await WaiterShift.findOne({
    where: { waiter_id: waiter.id, status: { [Op.in]: ['active', 'break'] } },
    order: [['created_at', 'DESC']],
  });

  if (!shift) {
    throw new ApiError(400, 'No active shift found');
  }

  const totalHours = shift.actual_start
    ? Number(((now.getTime() - new Date(shift.actual_start).getTime()) / 3600000).toFixed(2))
    : null;

  await shift.update({
    actual_end: now,
    status: 'completed',
    total_hours: totalHours,
    notes: req.body.notes || shift.notes,
  });

  await waiter.update({
    is_on_duty: false,
    current_shift_end: now,
  });

  res.json(ApiResponse.success(shift, 'Shift ended successfully'));
});

const takeBreak = catchAsync(async (req, res) => {
  const waiter = await getCurrentWaiter(req);
  const duration = Number(req.body.duration);
  const now = new Date();
  const breakEnd = new Date(now.getTime() + duration * 60000);

  const shift = await WaiterShift.findOne({
    where: { waiter_id: waiter.id, status: 'active' },
    order: [['created_at', 'DESC']],
  });

  if (!shift) {
    throw new ApiError(400, 'No active shift found');
  }

  await shift.update({
    status: 'break',
    break_start: now,
    break_end: breakEnd,
    break_duration: duration,
  });

  await waiter.update({ is_on_duty: false });

  res.json(ApiResponse.success(shift, 'Break started successfully'));
});

const getNotifications = catchAsync(async (req, res) => {
  const waiter = await getCurrentWaiter(req);
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 20);
  const offset = (page - 1) * limit;
  const where = { waiter_id: waiter.id };

  if (req.query.is_read !== undefined) {
    where.is_read = req.query.is_read === 'true';
  }

  const { count, rows } = await WaiterNotification.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']],
  });

  res.json(
    ApiResponse.success(
      {
        notifications: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
      },
      'Waiter notifications retrieved'
    )
  );
});

const markNotificationRead = catchAsync(async (req, res) => {
  const waiter = await getCurrentWaiter(req);
  const notification = await WaiterNotification.findOne({
    where: { id: req.params.id, waiter_id: waiter.id },
  });

  if (!notification) {
    throw new ApiError(404, 'Notification not found');
  }

  await notification.update({
    is_read: true,
    read_at: new Date(),
  });

  res.json(ApiResponse.success(notification, 'Notification marked as read'));
});

const getCallRequests = catchAsync(async (req, res) => {
  const waiter = await getCurrentWaiter(req);

  const calls = await WaiterCallRequest.findAll({
    where: {
      restaurant_id: waiter.restaurant_id,
      [Op.or]: [{ waiter_id: null }, { waiter_id: waiter.id }],
    },
    order: [['created_at', 'DESC']],
  });

  res.json(ApiResponse.success(calls, 'Call requests retrieved'));
});

const getTodayReservations = catchAsync(async (req, res) => {
  const waiter = await getCurrentWaiter(req);

  const today = new Date();
  const dateStr = today.toISOString().split('T')[0]; // YYYY-MM-DD for DATEONLY comparison

  const reservations = await TableReservation.findAll({
    where: {
      restaurant_id: waiter.restaurant_id,
      reservation_date: dateStr,
    },
    order: [['reservation_time', 'ASC']],
  });

  res.json(ApiResponse.success(reservations, 'Today reservations retrieved'));
});

const acknowledgeCall = catchAsync(async (req, res) => {
  const waiter = await getCurrentWaiter(req);
  const call = await WaiterCallRequest.findOne({
    where: { id: req.params.id, restaurant_id: waiter.restaurant_id },
  });

  if (!call) {
    throw new ApiError(404, 'Call request not found');
  }

  await call.update({
    waiter_id: waiter.id,
    status: 'acknowledged',
    acknowledged_by: req.user.id,
    acknowledged_at: new Date(),
  });

  res.json(ApiResponse.success(call, 'Call request acknowledged'));
});

const resolveCall = catchAsync(async (req, res) => {
  const waiter = await getCurrentWaiter(req);
  const call = await WaiterCallRequest.findOne({
    where: { id: req.params.id, restaurant_id: waiter.restaurant_id },
  });

  if (!call) {
    throw new ApiError(404, 'Call request not found');
  }

  await call.update({
    waiter_id: waiter.id,
    status: 'resolved',
    resolved_at: new Date(),
    notes: req.body.resolution_notes || call.notes,
  });

  res.json(ApiResponse.success(call, 'Call request resolved'));
});

const getPerformance = catchAsync(async (req, res) => {
  const waiter = await getCurrentWaiter(req);

  const performance = await WaiterPerformance.findAll({
    where: { waiter_id: waiter.id },
    order: [['date', 'DESC']],
    limit: 30,
  });

  res.json(ApiResponse.success(performance, 'Waiter performance retrieved'));
});

const updateRealtimeStatus = catchAsync(async (req, res) => {
  const waiter = await getCurrentWaiter(req);

  const [status] = await WaiterRealtimeStatus.findOrCreate({
    where: { waiter_id: waiter.id },
    defaults: {
      waiter_id: waiter.id,
      status: req.body.status,
      current_location: req.body.current_location || null,
      current_table_id: req.body.current_table_id || null,
      battery_level: req.body.battery_level,
      device_info: req.body.device_info || null,
      app_version: req.body.app_version || null,
      last_activity: new Date(),
    },
  });

  await status.update({
    status: req.body.status,
    current_location: req.body.current_location ?? status.current_location,
    current_table_id: req.body.current_table_id ?? status.current_table_id,
    battery_level: req.body.battery_level ?? status.battery_level,
    device_info: req.body.device_info ?? status.device_info,
    app_version: req.body.app_version ?? status.app_version,
    last_activity: new Date(),
  });

  res.json(ApiResponse.success(status, 'Realtime status updated'));
});

const getProfile = catchAsync(async (req, res) => {
  const waiter = await Waiter.findOne({
    where: { user_id: req.user.id },
    include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'phone', 'avatar_url'] }],
  });

  if (!waiter) {
    throw new ApiError(404, 'Waiter profile not found');
  }

  res.json(ApiResponse.success(waiter, 'Waiter profile retrieved'));
});

const updateProfile = catchAsync(async (req, res) => {
  const waiter = await Waiter.findOne({
    where: { user_id: req.user.id },
    include: [{ model: User, as: 'user' }],
  });

  if (!waiter) {
    throw new ApiError(404, 'Waiter profile not found');
  }

  const waiterFields = [
    'preferred_language',
    'notification_preferences',
    'assigned_sections',
    'assigned_tables',
    'max_tables',
    'shift_start',
    'shift_end',
  ];

  const userFields = ['full_name', 'phone', 'avatar_url'];
  const waiterUpdates = {};
  const userUpdates = {};

  waiterFields.forEach((field) => {
    if (req.body[field] !== undefined) waiterUpdates[field] = req.body[field];
  });

  userFields.forEach((field) => {
    if (req.body[field] !== undefined) userUpdates[field] = req.body[field];
  });

  if (Object.keys(waiterUpdates).length) {
    await waiter.update(waiterUpdates);
  }

  if (waiter.user && Object.keys(userUpdates).length) {
    await waiter.user.update(userUpdates);
  }

  const updatedWaiter = await Waiter.findOne({
    where: { id: waiter.id },
    include: [{ model: User, as: 'user', attributes: ['id', 'full_name', 'email', 'phone', 'avatar_url'] }],
  });

  res.json(ApiResponse.success(updatedWaiter, 'Waiter profile updated'));
});

module.exports = {
  getDashboard,
  startShift,
  endShift,
  takeBreak,
  getNotifications,
  markNotificationRead,
  getCallRequests,
  getTodayReservations,
  acknowledgeCall,
  resolveCall,
  getPerformance,
  updateRealtimeStatus,
  getProfile,
  updateProfile,
};
