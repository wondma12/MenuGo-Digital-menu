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

  // Prevent deleting a restaurant owner without transferring ownership or removing restaurants
  if (user.role === 'restaurant_admin') {
    const ownedCount = await Restaurant.count({ where: { owner_id: id, deleted_at: null } });
    if (ownedCount > 0) {
      throw new ApiError(400, 'User owns one or more restaurants. Transfer ownership or remove restaurants before deleting this user.');
    }
  }

  // Prevent deleting the last active platform admin
  if (user.role === 'platform_admin') {
    const activeAdmins = await User.count({ where: { role: 'platform_admin', is_active: true } });
    // If this user is active and they are the only active admin, block deletion
    if (user.is_active && activeAdmins <= 1) {
      throw new ApiError(400, 'Cannot delete the last active platform admin. Assign another platform admin first.');
    }
  }

  await user.update({ deleted_at: new Date(), is_active: false });

  // Support permanent deletion when `?force=true` is provided (platform_admin only)
  if (req.query.force === 'true') {
    if (req.user.role !== 'platform_admin') {
      throw new ApiError(403, 'Only platform admin can permanently delete users');
    }

    await sequelize.transaction(async (t) => {
      // Best-effort cleanup of related records that reference this user
      await UserSession.destroy({ where: { user_id: id }, force: true, transaction: t }).catch(() => {});
      await RestaurantStaff.destroy({ where: { user_id: id }, force: true, transaction: t }).catch(() => {});
      await Waiter.destroy({ where: { user_id: id }, force: true, transaction: t }).catch(() => {});

      // Finally remove the user record (hard delete)
      await user.destroy({ force: true, transaction: t });
    });

    return res.json(ApiResponse.success(null, 'User permanently deleted'));
  }

  // Soft delete (default)
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
  uploadBusinessLicense,
};