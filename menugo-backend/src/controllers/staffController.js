const { RestaurantStaff, User, Waiter, WaiterShift, Restaurant } = require('../models');
const bcrypt = require('bcryptjs');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');
const { Op } = require('sequelize');
const { STAFF_ROLES } = require('../utils/constants');

// Helper: map shift name to start/end times
function shiftTimes(shift) {
  switch ((shift || '').toLowerCase()) {
    case 'morning':
      return { start: '09:00:00', end: '13:00:00' };
    case 'afternoon':
      return { start: '13:00:00', end: '17:00:00' };
    case 'evening':
      return { start: '17:00:00', end: '21:00:00' };
    case 'night':
      return { start: '21:00:00', end: '01:00:00' };
    default:
      return { start: '09:00:00', end: '17:00:00' };
  }
}

const getStaff = catchAsync(async (req, res) => {
  const { restaurantId, page = 1, limit = 50, search } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (restaurantId) where.restaurant_id = restaurantId;

  if (search) {
    where[Op.or] = [
      { '$assigned_user.full_name$': { [Op.like]: `%${search}%` } },
      { '$assigned_user.email$': { [Op.like]: `%${search}%` } },
    ];
  }

  const { count, rows } = await RestaurantStaff.findAndCountAll({
    where,
    include: [{ model: User, as: 'assigned_user', attributes: ['id', 'full_name', 'email', 'avatar_url'] }],
    limit: parseInt(limit),
    offset,
    order: [['created_at', 'DESC']],
  });

  res.json(ApiResponse.success({ staff: rows, total: count, page: parseInt(page) }, 'Staff retrieved'));
});

const createStaff = catchAsync(async (req, res) => {
  let { restaurant_id, email, full_name, phone, role = 'waiter', hourly_rate, permissions } = req.body;

  // If restaurant_id not provided, try to infer from the authenticated user's staff assignment
  if (!restaurant_id && req.user?.id) {
    const assign = await RestaurantStaff.findOne({ where: { user_id: req.user.id } })
    if (assign) restaurant_id = assign.restaurant_id
  }

  // Accept `name` from frontend as `full_name` for compatibility
  if (!full_name && req.body?.name) full_name = req.body.name

  if (!restaurant_id || !email) throw new ApiError(400, 'restaurant_id and email are required');

  let user = await User.findOne({ where: { email } });
  let plainPassword = null;
  if (!user) {
    // Accept optional password from frontend; otherwise generate temp password
    plainPassword = req.body?.password || Math.random().toString(36).slice(-8);

    // Hash the password before storing
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(plainPassword, salt);

    // Determine a valid user.role value for the User model enum
    // Map restaurant staff roles to User.role values
    let userRole = 'waiter'
    const r = (role || '').toLowerCase()
    if (r === 'admin' || r === 'manager') userRole = 'restaurant_admin'
    // other roles (chef, cashier, delivery) keep as 'waiter' for now

    // Ensure full_name is not null to satisfy DB constraints
    const finalName = full_name || (email ? email.split('@')[0] : 'Staff')

    user = await User.create({
      email,
      password_hash,
      full_name: finalName,
      phone: phone || null,
      role: userRole,
      is_active: true,
      is_verified: true,
    });
  }

  // If user already exists and we're trying to create a restaurant admin, ensure the email
  // isn't already assigned as an admin to a different restaurant.
  const r = (role || '').toLowerCase();
  const isAdminRole = r === 'admin' || r === 'manager';
  if (user && isAdminRole) {
    const otherAdmin = await RestaurantStaff.findOne({
      where: {
        user_id: user.id,
        role: 'admin',
        restaurant_id: { [Op.ne]: restaurant_id },
      },
    });

    if (otherAdmin) {
      throw new ApiError(400, 'This email is already assigned as an admin to another restaurant');
    }

    if (user.role === 'restaurant_admin') {
      const staffAtThis = await RestaurantStaff.findOne({ where: { user_id: user.id, restaurant_id } });
      if (!staffAtThis) {
        throw new ApiError(400, 'This email already belongs to a restaurant admin for another restaurant');
      }
    }
  }

  const existing = await RestaurantStaff.findOne({ where: { restaurant_id, user_id: user.id } });
  if (existing) throw new ApiError(400, 'User is already staff for this restaurant');

  const staff = await RestaurantStaff.create({
    restaurant_id,
    user_id: user.id,
    role: role || 'waiter',
    permissions: permissions || {},
    hourly_rate: hourly_rate || null,
    is_active: true,
  });

  // Optionally create waiter profile if role is waiter
  if ((role || '').toLowerCase() === 'waiter') {
    await Waiter.create({
      staff_id: staff.id,
      user_id: user.id,
      restaurant_id,
      hourly_rate: hourly_rate || null,
    }).catch(() => {});
  }

  const created = await RestaurantStaff.findByPk(staff.id, { include: [{ model: User, as: 'assigned_user', attributes: ['id', 'full_name', 'email', 'avatar_url'] }] });

  // Convert to plain object so we can safely attach the generated password in development
  const createdObj = created && typeof created.toJSON === 'function' ? created.toJSON() : created;
  if (plainPassword && process.env.NODE_ENV !== 'production') {
    createdObj.plain_password = plainPassword;
  }

  res.status(201).json(ApiResponse.success(createdObj, 'Staff member created'));
});

const updateStaff = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const staff = await RestaurantStaff.findByPk(id);
  if (!staff) throw new ApiError(404, 'Staff member not found');

  await staff.update(updates);

  const updated = await RestaurantStaff.findByPk(id, { include: [{ model: User, as: 'assigned_user', attributes: ['id', 'full_name', 'email', 'avatar_url'] }] });
  res.json(ApiResponse.success(updated, 'Staff updated'));
});

const deleteStaff = catchAsync(async (req, res) => {
  const { id } = req.params;
  const staff = await RestaurantStaff.findByPk(id);
  if (!staff) throw new ApiError(404, 'Staff member not found');

  await staff.destroy();

  res.json(ApiResponse.success(null, 'Staff member deleted'));
});

const updateStaffStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  const staff = await RestaurantStaff.findByPk(id);
  if (!staff) throw new ApiError(404, 'Staff member not found');

  await staff.update({ is_active: !!isActive });
  res.json(ApiResponse.success({ is_active: staff.is_active }, 'Staff status updated'));
});

const getStaffSchedule = catchAsync(async (req, res) => {
  // Accept date as query param or body
  const dateParam = req.query.date || req.body?.date;
  const date = dateParam ? new Date(dateParam) : new Date();
  const dateStr = date.toISOString().split('T')[0];

  const shifts = await WaiterShift.findAll({
    where: { shift_date: dateStr },
    include: [{ model: Waiter, as: 'shift_waiter', include: [{ model: RestaurantStaff, as: 'staff_details' }] }],
  });

  const result = shifts.map(s => ({
    staffId: s.shift_waiter?.staff_id || (s.shift_waiter?.staff_details?.id || null),
    shift: (() => {
      const start = s.shift_start ? s.shift_start.slice(0,5) : '';
      if (start >= '09:00' && start < '13:00') return 'Morning';
      if (start >= '13:00' && start < '17:00') return 'Afternoon';
      if (start >= '17:00' && start < '21:00') return 'Evening';
      return 'Night';
    })(),
    date: s.shift_date,
  }));

  res.json(ApiResponse.success(result, 'Schedule retrieved'));
});

const updateStaffSchedule = catchAsync(async (req, res) => {
  const { date, staffId, shift, assigned } = req.body;
  if (!date || !staffId || !shift) throw new ApiError(400, 'date, staffId and shift are required');

  const dateStr = new Date(date).toISOString().split('T')[0];

  // Try resolving staff by primary key first, then fall back to matching user_id.
  let staff = await RestaurantStaff.findByPk(staffId);
  // Debug help: log incoming identifier types in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[debug] updateStaffSchedule incoming staffId:', staffId, 'type:', typeof staffId)
  }
  if (!staff) {
    staff = await RestaurantStaff.findOne({ where: { user_id: staffId } });
  }
  // If still not found, check if staffId refers to a Waiter record
  if (!staff) {
    const waiterRecord = await Waiter.findByPk(staffId);
    if (waiterRecord) {
      staff = await RestaurantStaff.findByPk(waiterRecord.staff_id);
    }
  }
  // If still not found and staffId looks like an email, try matching assigned_user.email
  if (!staff && typeof staffId === 'string' && staffId.includes('@')) {
    staff = await RestaurantStaff.findOne({
      include: [{ model: User, as: 'assigned_user', where: { email: staffId } }]
    });
  }
  if (!staff) throw new ApiError(404, 'Staff member not found');

  // Ensure waiter profile exists
  let waiter = await Waiter.findOne({ where: { staff_id: staff.id } });
  if (!waiter) {
    waiter = await Waiter.create({
      staff_id: staff.id,
      user_id: staff.user_id,
      restaurant_id: staff.restaurant_id,
    });
  }

  const { start, end } = shiftTimes(shift);

  if (assigned) {
    await WaiterShift.findOrCreate({
      where: { waiter_id: waiter.id, shift_date: dateStr, shift_start: start },
      defaults: { waiter_id: waiter.id, shift_date: dateStr, shift_start: start, shift_end: end },
    });
    res.json(ApiResponse.success(null, 'Shift assigned'));
    return;
  }

  // unassign
  await WaiterShift.destroy({ where: { waiter_id: waiter.id, shift_date: dateStr, shift_start: start } });

  res.json(ApiResponse.success(null, 'Shift unassigned'));
});

// Roles and permissions helpers (minimal)
const getRoles = catchAsync(async (req, res) => {
  const roles = Object.values(STAFF_ROLES).map(r => ({ id: r, name: r }));
  res.json(ApiResponse.success(roles, 'Roles retrieved'));
});

const updateRolePermissions = catchAsync(async (req, res) => {
  // No persistent role store in current backend; accept payload and return success
  const { roleId } = req.params;
  const { permissions } = req.body;
  res.json(ApiResponse.success({ roleId, permissions }, 'Role permissions updated'));
});

const updateStaffPermissions = catchAsync(async (req, res) => {
  const { staffId } = req.params;
  const { permissions } = req.body;
  const staff = await RestaurantStaff.findByPk(staffId);
  if (!staff) throw new ApiError(404, 'Staff member not found');
  await staff.update({ permissions });
  res.json(ApiResponse.success(staff, 'Staff permissions updated'));
});

module.exports = {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  updateStaffStatus,
  getStaffSchedule,
  updateStaffSchedule,
  getRoles,
  updateRolePermissions,
  updateStaffPermissions,
};
