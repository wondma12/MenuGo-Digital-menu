const { User, UserSession, Restaurant, RestaurantStaff, Waiter, WaiterCallRequest, TableStatusHistory, TableReservation, Order, InventoryTransaction, SupportTicket, TicketMessage, Notification, SystemLog, sequelize } = require('../models');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');
const { sendWelcomeEmail } = require('../config/email');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

// Get all users (platform admin only)
const getAllUsers = catchAsync(async (req, res) => {
  const { page = 1, limit = 20, role, search, status, verification } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  // Role filter - support single role or comma-separated list (e.g. "platform_admin,restaurant_admin")
  if (role && role !== 'all') {
    if (typeof role === 'string' && role.includes(',')) {
      const roles = role.split(',').map(r => r.trim()).filter(Boolean);
      if (roles.length > 0) where.role = { [Op.in]: roles };
    } else {
      where.role = role;
    }
  }

  // Status filter (maps from frontend `status` param)
  if (typeof status !== 'undefined') {
    if (status === 'active') where.is_active = true;
    else if (status === 'inactive') where.is_active = false;
  }

  // Verification filter (maps from frontend `verification` param)
  if (typeof verification !== 'undefined') {
    if (verification === 'verified') where.is_verified = true;
    else if (verification === 'pending') where.is_verified = false;
  }

  // Search across common fields (use Op.like for MySQL compatibility)
  if (search) {
    where[Op.or] = [
      { email: { [Op.like]: `%${search}%` } },
      { full_name: { [Op.like]: `%${search}%` } },
      { phone: { [Op.like]: `%${search}%` } },
    ];
  }

  // Paginated users
  const { count, rows } = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password_hash'] },
    include: [{ model: RestaurantStaff, as: 'staff_assignments', attributes: ['role'] }],
    limit: parseInt(limit),
    offset,
    order: [['created_at', 'DESC']],
  });

  const users = rows.map((user) => {
    const json = user.toJSON ? user.toJSON() : user
    const staffRole = Array.isArray(json.staff_assignments) && json.staff_assignments.length > 0
      ? json.staff_assignments[0].role
      : null

    return {
      ...json,
      displayRole: staffRole || json.role,
    }
  })

  // Compute summary stats (respecting role/search filters so UI reflects current filter set)
  const statsWhere = {};
  if (role && role !== 'all') {
    if (typeof role === 'string' && role.includes(',')) {
      const roles = role.split(',').map(r => r.trim()).filter(Boolean);
      if (roles.length > 0) statsWhere.role = { [Op.in]: roles };
    } else {
      statsWhere.role = role;
    }
  }
  if (search) {
    statsWhere[Op.or] = [
      { email: { [Op.like]: `%${search}%` } },
      { full_name: { [Op.like]: `%${search}%` } },
      { phone: { [Op.like]: `%${search}%` } },
    ];
  }

  const active = await User.count({ where: { ...statsWhere, is_active: true } });
  const pendingVerification = await User.count({ where: { ...statsWhere, is_verified: false } });
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const newThisMonth = await User.count({ where: { ...statsWhere, created_at: { [Op.gte]: startOfMonth } } });

  res.json(ApiResponse.success({
    users,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
    active,
    pendingVerification,
    newThisMonth,
  }));
});

// Get user by ID
const getUserById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id, {
    attributes: { exclude: ['password_hash'] },
    include: [
      { model: Restaurant, as: 'owned_restaurants' },
      { model: RestaurantStaff, as: 'staff_assignments', include: [{ model: Restaurant, as: 'restaurant' }] },
      { model: Waiter, as: 'waiter_profile' },
    ],
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.json(ApiResponse.success(user, 'User retrieved'));
});

// Get activity history for a user (sessions)
const getUserActivity = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Ensure user exists (returns 404 if not)
  const user = await User.findByPk(id, {
    attributes: ['id', 'full_name', 'email'],
  });
  if (!user) throw new ApiError(404, 'User not found');

  const sessions = await UserSession.findAll({
    where: { user_id: id },
    attributes: ['id', 'device_info', 'ip_address', 'created_at', 'expires_at', 'revoked_at'],
    order: [['created_at', 'DESC']],
  });

  const logs = sessions.map((session) => {
    const now = new Date();
    const expiresAt = session.expires_at ? new Date(session.expires_at) : null;
    const status = session.revoked_at
      ? 'Revoked'
      : expiresAt && expiresAt < now
        ? 'Expired'
        : 'Active';

    return {
      id: session.id,
      userId: user.id,
      userName: user.full_name,
      timestamp: session.created_at,
      status,
      ipAddress: session.ip_address,
      expiresAt: session.expires_at,
      revokedAt: session.revoked_at,
      deviceInfo: session.device_info,
    };
  });

  res.json(ApiResponse.success(logs, 'User activity retrieved'));
});

// Update user
const updateUser = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { full_name, phone, avatar_url, is_active, role, preferences } = req.body;

  const user = await User.findByPk(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check permissions
  if (req.user.role !== 'platform_admin' && req.user.id !== id) {
    throw new ApiError(403, 'You do not have permission to update this user');
  }

  // Role change requires platform admin
  if (role && req.user.role !== 'platform_admin') {
    throw new ApiError(403, 'Only platform admin can change user role');
  }

  const existingPreferences = (typeof user.preferences === 'object' && user.preferences !== null)
    ? user.preferences
    : {}

  const incomingPreferences = (typeof preferences === 'object' && preferences !== null)
    ? preferences
    : {}

  await user.update({
    full_name: full_name || user.full_name,
    phone: phone || user.phone,
    avatar_url: avatar_url || user.avatar_url,
    is_active: is_active !== undefined ? is_active : user.is_active,
    role: role || user.role,
    preferences: Object.keys(incomingPreferences).length > 0
      ? { ...existingPreferences, ...incomingPreferences }
      : existingPreferences,
  });

  const updatedUser = await User.findByPk(id, { attributes: { exclude: ['password_hash'] } });
  res.json(ApiResponse.success(updatedUser, 'User updated'));
});

// Delete user (soft delete)
const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  // Helper to interpret various truthy force query values (case-insensitive)
  const isForceDelete = (r) => {
    const val = r?.query?.force;
    if (val === true || val === 1 || val === '1') return true;
    if (typeof val === 'string') return val.toLowerCase() === 'true';
    return false;
  };

  if (!id) {
    throw new ApiError(400, 'Missing user id');
  }

  const user = await User.findByPk(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Only platform admins or the user themselves can delete
  if (req.user.role !== 'platform_admin' && req.user.id !== id) {
    throw new ApiError(403, 'You do not have permission to delete this user');
  }

  // Log attempt for easier debugging
  try {
    const { logger } = require('../utils/logger');
    logger.info({ message: 'User delete attempt', targetUser: id, requester: req.user.id, requesterRole: req.user.role, forceParam: req.query.force });
  } catch (e) {}

  // If the target is a restaurant admin and the caller is a platform admin,
  // perform a best-effort soft-delete of their restaurants so the delete can proceed.
  if (user.role === 'restaurant_admin') {
    const ownedRestaurants = await Restaurant.findAll({ where: { owner_id: id, deleted_at: null }, attributes: ['id'] });
    if (ownedRestaurants.length > 0 && req.user.role !== 'platform_admin') {
      throw new ApiError(400, 'User owns one or more restaurants. Transfer ownership or remove restaurants before deleting this user.');
    }

    if (ownedRestaurants.length > 0 && req.user.role === 'platform_admin') {
      // soft-delete owned restaurants (best-effort)
      for (const r of ownedRestaurants) {
        try {
          await Restaurant.update({ deleted_at: new Date(), is_active: false }, { where: { id: r.id } });
        } catch (e) {
          console.warn('Failed to soft-delete owned restaurant during admin delete:', e && e.message ? e.message : e);
        }
      }
    }
  }

  // Prevent deleting last active platform admin only for non-admin callers
  if (user.role === 'platform_admin') {
    const activeAdmins = await User.count({ where: { role: 'platform_admin', is_active: true } });
    if (user.is_active && activeAdmins <= 1 && req.user.role !== 'platform_admin') {
      throw new ApiError(400, 'Cannot delete the last active platform admin. Assign another platform admin first.');
    }
  }

  // If force-delete requested, attempt hard delete in transaction (platform admin only)
  if (isForceDelete(req)) {
    if (req.user.role !== 'platform_admin') {
      throw new ApiError(403, 'Only platform admin can permanently delete users');
    }

    await sequelize.transaction(async (t) => {
      // Try to hard-delete owned restaurants (best-effort), fallback to soft-delete
      try {
        const ownedRestaurants = await Restaurant.findAll({ where: { owner_id: id }, attributes: ['id'], transaction: t }).catch(() => []);
        for (const r of ownedRestaurants) {
          try {
            // Soft-delete owned restaurants to avoid FK constraint failures from many dependent tables
            await Restaurant.update({ deleted_at: new Date(), is_active: false }, { where: { id: r.id }, transaction: t });
          } catch (inner) {
            console.warn('Failed to soft-delete owned restaurant during user force-delete:', inner && inner.message ? inner.message : inner);
          }
        }
      } catch (e) {
        console.warn('Error while cleaning up owned restaurants for force-delete:', e && e.message ? e.message : e);
      }

      // Best-effort cleanup of related records that reference this user
      await UserSession.destroy({ where: { user_id: id }, force: true, transaction: t }).catch(() => {});
      await RestaurantStaff.destroy({ where: { user_id: id }, force: true, transaction: t }).catch(() => {});
      await Waiter.destroy({ where: { user_id: id }, force: true, transaction: t }).catch(() => {});

      await WaiterCallRequest.update({ acknowledged_by: null }, { where: { acknowledged_by: id }, transaction: t }).catch(() => {});
      await TableStatusHistory.update({ changed_by: null }, { where: { changed_by: id }, transaction: t }).catch(() => {});
      await TableReservation.update({ created_by: null }, { where: { created_by: id }, transaction: t }).catch(() => {});
      await InventoryTransaction.update({ created_by: null }, { where: { created_by: id }, transaction: t }).catch(() => {});

      await Order.update(
        { verified_by: null, prepared_by: null, served_by: null, delivered_by: null, cancelled_by: null },
        { where: { [Op.or]: [
          { verified_by: id }, { prepared_by: id }, { served_by: id }, { delivered_by: id }, { cancelled_by: id }
        ] }, transaction: t }
      ).catch(() => {});

      await SupportTicket.update({ user_id: null }, { where: { user_id: id }, transaction: t }).catch(() => {});
      await TicketMessage.update({ user_id: null }, { where: { user_id: id }, transaction: t }).catch(() => {});
      await Notification.update({ user_id: null }, { where: { user_id: id }, transaction: t }).catch(() => {});

      // Finally hard-delete user
      await user.destroy({ force: true, transaction: t });
    });

    return res.json(ApiResponse.success(null, 'User permanently deleted'));
  }

  // Soft delete path (default)
  await user.update({ deleted_at: new Date(), is_active: false });

  // Revoke sessions
  await UserSession.update({ revoked_at: new Date() }, { where: { user_id: id } }).catch(() => {});

  return res.json(ApiResponse.success(null, 'User deleted'));
});

// Upload avatar
const uploadAvatar = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const user = await User.findByPk(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  // Delete old avatar from Cloudinary
  if (user.avatar_url && user.avatar_url.includes('cloudinary')) {
    const publicId = user.avatar_url.split('/').pop().split('.')[0];
    await deleteFromCloudinary(`menugo/avatars/${publicId}`);
  }

  const uploadResult = await uploadToCloudinary(req.file.path, 'menugo/avatars');
  
  await user.update({ avatar_url: uploadResult.url });

  res.json(ApiResponse.success({ avatar_url: uploadResult.url }, 'Avatar uploaded'));
});

// Upload business license document (platform admin or during registration)
const uploadBusinessLicense = catchAsync(async (req, res) => {
  // Accepts multipart/form-data file under field `businessLicenseDocument` and `restaurant_id` or `user_id`
  const { restaurant_id, user_id } = req.body;

  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  const uploadResult = await uploadToCloudinary(req.file.path, 'menugo/business_licenses');

  // If restaurant_id provided, attach url to restaurant record
  if (restaurant_id) {
    const restaurant = await Restaurant.findByPk(restaurant_id);
    if (!restaurant) throw new ApiError(404, 'Restaurant not found');
    await restaurant.update({ business_license_url: uploadResult.url });
    return res.json(ApiResponse.success({ url: uploadResult.url }, 'Business license uploaded'));
  }

  // If user_id provided, attach to user's preferences or a dedicated column
  if (user_id) {
    const user = await User.findByPk(user_id);
    if (!user) throw new ApiError(404, 'User not found');
    // store in preferences.business_license_url for flexibility
    const prefs = user.preferences || {};
    prefs.business_license_url = uploadResult.url;
    await user.update({ preferences: prefs });
    return res.json(ApiResponse.success({ url: uploadResult.url }, 'Business license uploaded'));
  }

  // Otherwise return uploaded URL
  res.json(ApiResponse.success({ url: uploadResult.url }, 'Business license uploaded'));
});

// Get user sessions
const getUserSessions = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const sessions = await UserSession.findAll({
    where: { user_id: userId, revoked_at: null },
    attributes: ['id', 'device_info', 'ip_address', 'created_at', 'expires_at'],
    order: [['created_at', 'DESC']],
  });

  res.json(ApiResponse.success(sessions, 'Sessions retrieved'));
});

// Revoke session
const revokeSession = catchAsync(async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.id;

  const session = await UserSession.findOne({
    where: { id: sessionId, user_id: userId },
  });

  if (!session) {
    throw new ApiError(404, 'Session not found');
  }

  await session.update({ revoked_at: new Date() });

  res.json(ApiResponse.success(null, 'Session revoked'));
});

// Get user statistics (platform admin)
const getUserStats = catchAsync(async (req, res) => {
  const totalUsers = await User.count();
  const activeUsers = await User.count({ where: { is_active: true } });
  const newUsersToday = await User.count({ where: { created_at: { [Op.gte]: new Date().setHours(0, 0, 0, 0) } } });
  
  const usersByRole = await User.findAll({
    attributes: ['role', [sequelize.fn('COUNT', sequelize.col('role')), 'count']],
    group: ['role'],
  });

  res.json(ApiResponse.success({
    total_users: totalUsers,
    active_users: activeUsers,
    new_users_today: newUsersToday,
    users_by_role: usersByRole,
  }, 'User statistics retrieved'));
});

// Create user (admin)
const createUser = catchAsync(async (req, res) => {
  const { email, password, full_name, phone, role } = req.body;

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ApiError(400, 'User already exists with this email');
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  const user = await User.create({
    email,
    password_hash,
    full_name: full_name || null,
    phone: phone || null,
    role: role || 'customer',
    is_active: true,
    is_verified: true,
  });

  let restaurant = null;
  // If creating a restaurant admin, also create the restaurant and staff assignment
  if (role === 'restaurant_admin' && req.body.restaurant_name) {
    restaurant = await Restaurant.create({
      owner_id: user.id,
      name: req.body.restaurant_name,
      email: req.body.business_email || user.email,
      phone: req.body.restaurant_phone || phone || null,
      address: req.body.restaurant_address || null,
      city: req.body.restaurant_city || null,
      country: req.body.restaurant_country || null,
      website: req.body.restaurant_website || null,
      slogan: req.body.restaurant_slogan || null,
      sub_city: req.body.restaurant_sub_city || null,
      business_license_number: req.body.business_license_number || null,
      tin_number: req.body.tin_number || null,
      owner_name: req.body.owner_name || full_name || null,
      is_verified: true,
      subscription_status: 'trial',
      subscription_start_date: new Date(),
      subscription_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });

    await RestaurantStaff.create({
      restaurant_id: restaurant.id,
      user_id: user.id,
      role: 'admin',
      is_active: true,
    });
  }

  // Send welcome email (best-effort)
  try {
    await sendWelcomeEmail(email, full_name || '');
  } catch (e) {
    // Log and continue
    console.warn('Failed to send welcome email', e?.message || e);
  }

  const createdUser = await User.findByPk(user.id, { attributes: { exclude: ['password_hash'] } });

  res.status(201).json(ApiResponse.success({ user: createdUser, restaurant }, 'User created'));
});

// Invite user to a restaurant (restaurant admin/owner or platform admin)
const inviteUser = catchAsync(async (req, res) => {
  const { email, role } = req.body;
  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  // Resolve restaurant context from request or current user's assignments/ownership
  const { Restaurant } = require('../models');
  let restaurantId = req.body.restaurant_id || req.body.restaurantId;

  if (!restaurantId) {
    // Try owned restaurant
    const owned = await Restaurant.findOne({ where: { owner_id: req.user.id } }).catch(() => null);
    if (owned) restaurantId = owned.id;
  }

  if (!restaurantId) {
    const assign = await RestaurantStaff.findOne({ where: { user_id: req.user.id } }).catch(() => null);
    if (assign) restaurantId = assign.restaurant_id;
  }

  if (!restaurantId) {
    throw new ApiError(403, 'Restaurant context required to invite a user');
  }

  // Find or create user by email
  let user = await require('../models').User.findOne({ where: { email } });

  if (!user) {
    // Create a lightweight placeholder account for invited user
    const bcrypt = require('bcryptjs');
    const rand = Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(rand, salt);

    const defaultName = email.split('@')[0].replace(/[._\-]/g, ' ') || 'Invited User';
    user = await require('../models').User.create({
      email,
      password_hash,
      full_name: defaultName,
      phone: null,
      role: 'customer',
      is_active: true,
      is_verified: false,
    });
  }

  // Ensure no duplicate staff entry
  const existingStaff = await RestaurantStaff.findOne({ where: { restaurant_id: restaurantId, user_id: user.id } });
  if (existingStaff) {
    throw new ApiError(400, 'User is already a member of this restaurant');
  }

  const staff = await RestaurantStaff.create({
    restaurant_id: restaurantId,
    user_id: user.id,
    role: role || 'manager',
    is_active: true,
  });

  // Best-effort: send welcome/invite email if configured
  try {
    const { sendWelcomeEmail } = require('../config/email');
    if (sendWelcomeEmail) {
      await sendWelcomeEmail(email, user.full_name || '');
    }
  } catch (e) {
    // ignore email failures
  }

  const resultUser = await require('../models').User.findByPk(user.id, { attributes: { exclude: ['password_hash'] } });
  res.status(201).json(ApiResponse.success({ user: resultUser, staff }, 'Invitation created'));
});

// Toggle user status
const toggleUserStatus = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (req.user.role !== 'platform_admin') {
    throw new ApiError(403, 'Only platform admin can toggle user status');
  }

  const user = await User.findByPk(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const updatedUser = await user.update({ is_active: !user.is_active });

  // If user was deactivated, revoke all their sessions to force immediate logout
  if (!updatedUser.is_active) {
    try {
      await UserSession.update(
        { revoked_at: new Date() },
        { where: { user_id: updatedUser.id } }
      );
    } catch (e) {
      // best-effort: log and continue
      console.warn('Failed to revoke sessions for deactivated user', e?.message || e);
    }
    // If the deactivated user is a restaurant owner or admin, deactivate their restaurants (best-effort)
    try {
      if (updatedUser.role === 'restaurant_admin' || updatedUser.role === 'restaurant_owner') {
        const { Restaurant } = require('../models');
        await Restaurant.update({ is_active: false }, { where: { owner_id: updatedUser.id } });
      }
      // Also mark any RestaurantStaff entries' users as inactive (already deactivated), no-op here
    } catch (e) {
      console.warn('Failed to cascade deactivate restaurants for user:', e && e.message ? e.message : e);
    }
  }

  res.json(ApiResponse.success({ is_active: updatedUser.is_active }, 'User status toggled'));
});

// Get users for a restaurant (supports inferred restaurant from auth if no param)
const getRestaurantUsers = catchAsync(async (req, res) => {
  let restaurantId = req.params.restaurantId || req.query.restaurant_id || req.body.restaurant_id;

  // If not provided, infer from authenticated user's staff assignment or ownership
  if (!restaurantId) {
    if (req.user.role === 'restaurant_admin') {
      const owned = await Restaurant.findOne({ where: { owner_id: req.user.id } }).catch(() => null);
      if (owned) restaurantId = owned.id;
    }
    if (!restaurantId) {
      const assign = await RestaurantStaff.findOne({ where: { user_id: req.user.id } }).catch(() => null);
      if (assign) restaurantId = assign.restaurant_id;
    }
  }

  if (!restaurantId) throw new ApiError(400, 'Restaurant id required');

  const staffs = await RestaurantStaff.findAll({
    where: { restaurant_id: restaurantId },
    include: [{ model: User, as: 'user', attributes: { exclude: ['password_hash'] } }],
  });

  const users = staffs.map(s => {
    const u = s.user && s.user.toJSON ? s.user.toJSON() : s.user;
    return {
      id: u.id,
      email: u.email,
      full_name: u.full_name,
      role: s.role,
      is_active: s.is_active,
      avatar_url: u.avatar_url,
    };
  });

  res.json(ApiResponse.success(users, 'Restaurant users retrieved'));
});

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  uploadAvatar,
  getUserSessions,
  revokeSession,
  getUserStats,
  createUser,
  toggleUserStatus,
  inviteUser,
  getRestaurantUsers,
  getUserActivity,
  uploadBusinessLicense,
};