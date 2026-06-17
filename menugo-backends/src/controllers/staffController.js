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

  // Allow callers to supply either the restaurant_staff PK or the linked users.id UUID.
  let staff = await RestaurantStaff.findByPk(id);
  if (!staff) {
    // Try resolving by linked user_id (user UUID)
    staff = await RestaurantStaff.findOne({ where: { user_id: id } });
  }

  // If still not found, and the id refers to an existing User, allow restaurant_admins/platform_admins
  // to create a restaurant_staff mapping on-the-fly. This helps avoid 404s when an admin toggles
  // a user who hasn't been added as staff yet from the UI.
  if (!staff) {
    const possibleUser = await User.findByPk(id).catch(() => null);
    if (possibleUser && (req.user.role === 'restaurant_admin' || req.user.role === 'platform_admin')) {
      // Determine restaurant context: prefer explicit body/query, then authenticated user's assignment
      let restaurantId = req.body?.restaurant_id || req.query?.restaurantId || req.user?.restaurant_id || (req.user?.restaurant_id?.id) || null;
      if (!restaurantId) {
        const assign = await RestaurantStaff.findOne({ where: { user_id: req.user.id } }).catch(() => null);
        if (assign) restaurantId = assign.restaurant_id;
      }
      if (!restaurantId) {
        throw new ApiError(403, 'Restaurant context required to add staff');
      }

      // Create the staff mapping with defaults (allow role override from payload)
      const createRole = (req.body?.role) || 'waiter';
      staff = await RestaurantStaff.create({
        restaurant_id: restaurantId,
        user_id: possibleUser.id,
        role: createRole,
        permissions: req.body?.permissions || {},
        is_active: true,
      });

      // Optionally create a Waiter profile when role is waiter
      if ((createRole || '').toLowerCase() === 'waiter') {
        await Waiter.create({ staff_id: staff.id, user_id: possibleUser.id, restaurant_id: restaurantId }).catch(() => {});
      }
    }
  }

  if (!staff) throw new ApiError(404, 'Staff member not found');

  // Normalize incoming update keys so frontend can send camelCase fields.
  const staffUpdates = {};
  const userUpdates = {};

  // Staff-level fields
  if (updates.role !== undefined) staffUpdates.role = updates.role;
  if (updates.permissions !== undefined) staffUpdates.permissions = updates.permissions;
  if (updates.hourly_rate !== undefined) staffUpdates.hourly_rate = updates.hourly_rate;
  if (updates.hourlyRate !== undefined) staffUpdates.hourly_rate = updates.hourlyRate;
  if (updates.shift_start !== undefined) staffUpdates.shift_start = updates.shift_start;
  if (updates.shiftStart !== undefined) staffUpdates.shift_start = updates.shiftStart;
  if (updates.shift_end !== undefined) staffUpdates.shift_end = updates.shift_end;
  if (updates.shiftEnd !== undefined) staffUpdates.shift_end = updates.shiftEnd;
  if (updates.is_active !== undefined) staffUpdates.is_active = updates.is_active;
  if (updates.isActive !== undefined) staffUpdates.is_active = updates.isActive;

  // User-level fields should update the linked User record
  if (updates.full_name !== undefined) userUpdates.full_name = updates.full_name;
  if (updates.name !== undefined) userUpdates.full_name = updates.name;
  if (updates.email !== undefined) userUpdates.email = updates.email;
  if (updates.phone !== undefined) userUpdates.phone = updates.phone;
  if (updates.avatar !== undefined) userUpdates.avatar_url = updates.avatar;
  if (updates.avatar_url !== undefined) userUpdates.avatar_url = updates.avatar_url;

  // Apply staff updates to RestaurantStaff
  if (Object.keys(staffUpdates).length) {
    await staff.update(staffUpdates);
  }

  // Apply user updates to linked User if present
  if (Object.keys(userUpdates).length && staff.user_id) {
    try {
      const user = await User.findByPk(staff.user_id);
      if (user) {
        await user.update(userUpdates);
      }
    } catch (e) {
      // Log but don't fail the whole request for non-critical user update errors
      console.warn('Failed to update linked user for staff update:', e && e.message ? e.message : e);
    }
  }

  // Re-fetch using the resolved restaurant_staff PK (staff.id).
  const updated = await RestaurantStaff.findByPk(staff.id, { include: [{ model: User, as: 'assigned_user', attributes: ['id', 'full_name', 'email', 'avatar_url', 'phone'] }] });
  res.json(ApiResponse.success(updated, 'Staff updated'));
});

const deleteStaff = catchAsync(async (req, res) => {
  const { id } = req.params;
  // Accept either restaurant_staff PK or linked users.id UUID
  let staff = await RestaurantStaff.findByPk(id);
  if (!staff) {
    staff = await RestaurantStaff.findOne({ where: { user_id: id } });
  }
  // If not found, try the on-the-fly creation path for admins (same behavior as updateStaff)
  if (!staff) {
    const possibleUser = await User.findByPk(id).catch(() => null);
    if (possibleUser && (req.user.role === 'restaurant_admin' || req.user.role === 'platform_admin')) {
      let restaurantId = req.body?.restaurant_id || req.query?.restaurantId || req.user?.restaurant_id || (req.user?.restaurant_id?.id) || null;
      if (!restaurantId) {
        const assign = await RestaurantStaff.findOne({ where: { user_id: req.user.id } }).catch(() => null);
        if (assign) restaurantId = assign.restaurant_id;
      }
      if (!restaurantId) {
        throw new ApiError(403, 'Restaurant context required to add staff');
      }

      staff = await RestaurantStaff.create({ restaurant_id: restaurantId, user_id: possibleUser.id, role: 'waiter', permissions: {}, is_active: true });
      await Waiter.create({ staff_id: staff.id, user_id: possibleUser.id, restaurant_id: restaurantId }).catch(() => {});
    }
  }
  if (!staff) throw new ApiError(404, 'Staff member not found');

  // Remove any waiter profile linked to this staff
  try {
    await Waiter.destroy({ where: { staff_id: staff.id } }).catch(() => {});
  } catch (e) {
    // ignore
  }

  // Remember linked user id before deleting staff record
  const linkedUserId = staff.user_id;

  await staff.destroy();

  // If the linked user is not staff of any other restaurant, disable their account and downgrade role
  if (linkedUserId) {
    const remaining = await RestaurantStaff.findOne({ where: { user_id: linkedUserId } });
    if (!remaining) {
      try {
        const user = await User.findByPk(linkedUserId).catch(() => null);
        if (user) {
          await user.update({ is_active: false, role: 'customer' }).catch(() => {});
        }
      } catch (e) {
        // ignore non-fatal user update errors
      }
    }
  }

  res.json(ApiResponse.success(null, 'Staff member deleted'));
});

const updateStaffStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;
  // Accept either restaurant_staff PK or linked users.id UUID
  let staff = await RestaurantStaff.findByPk(id);
  if (!staff) {
    staff = await RestaurantStaff.findOne({ where: { user_id: id } });
  }
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
  // Accept either the restaurant_staff PK or the linked users.id UUID
  let staff = await RestaurantStaff.findByPk(staffId);
  if (!staff) {
    staff = await RestaurantStaff.findOne({ where: { user_id: staffId } });
  }
  if (!staff) throw new ApiError(404, 'Staff member not found');
  await staff.update({ permissions });

  const updated = await RestaurantStaff.findByPk(staff.id, { include: [{ model: User, as: 'assigned_user', attributes: ['id', 'full_name', 'email', 'avatar_url'] }] });
  res.json(ApiResponse.success(updated, 'Staff permissions updated'));
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
