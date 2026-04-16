const { User, UserSession, Restaurant, RestaurantStaff, Waiter, sequelize } = require('../models');
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
    limit: parseInt(limit),
    offset,
    order: [['created_at', 'DESC']],
  });

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
    users: rows,
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

  await user.update({
    full_name: full_name || user.full_name,
    phone: phone || user.phone,
    avatar_url: avatar_url || user.avatar_url,
    is_active: is_active !== undefined ? is_active : user.is_active,
    role: role || user.role,
    preferences: { ...user.preferences, ...preferences },
  });

  const updatedUser = await User.findByPk(id, { attributes: { exclude: ['password_hash'] } });
  res.json(ApiResponse.success(updatedUser, 'User updated'));
});

// Delete user (soft delete)
const deleteUser = catchAsync(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByPk(id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (req.user.role !== 'platform_admin' && req.user.id !== id) {
    throw new ApiError(403, 'You do not have permission to delete this user');
  }

  await user.update({ deleted_at: new Date(), is_active: false });

  // Revoke all sessions
  await UserSession.update(
    { revoked_at: new Date() },
    { where: { user_id: id } }
  );

  res.json(ApiResponse.success(null, 'User deleted'));
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
      email: user.email,
      phone: phone || null,
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
  }

  res.json(ApiResponse.success({ is_active: updatedUser.is_active }, 'User status toggled'));
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
};