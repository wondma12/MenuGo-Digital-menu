const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User, UserSession, Restaurant, RestaurantStaff } = require('../models');
const { generateToken, generateRefreshToken } = require('../services/tokenService');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../config/email');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');

// Register new user
const register = catchAsync(async (req, res) => {
  const {
    email,
    password,
    full_name,
    phone,
    role,
    restaurant_name,
    restaurant_address,
    restaurant_city,
    restaurant_country,
    restaurant_phone,
    restaurant_website,
    restaurant_slogan,
  } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    throw new ApiError(400, 'User already exists with this email');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  // Create user
  const isRestaurantAdmin = role === 'restaurant_admin';
  const user = await User.create({
    email,
    password_hash,
    full_name,
    phone,
    role: role || 'customer',
    is_verified: isRestaurantAdmin ? false : true,
    // Restaurant admins should not be active until platform admin verifies
    is_active: isRestaurantAdmin ? false : true,
  });

  // If registering as restaurant admin, create restaurant
  if (isRestaurantAdmin && restaurant_name) {
    const restaurant = await Restaurant.create({
      owner_id: user.id,
      name: restaurant_name,
      email: email || null,
      phone: restaurant_phone || phone || null,
      address: restaurant_address || null,
      city: restaurant_city || null,
      country: restaurant_country || null,
      website: restaurant_website || null,
      slogan: restaurant_slogan || null,
      is_verified: false,
      subscription_status: 'trial',
      subscription_start_date: new Date(),
      subscription_end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      is_active: true,
    });

    await RestaurantStaff.create({
      restaurant_id: restaurant.id,
      user_id: user.id,
      role: 'admin',
      is_active: true,
    });
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  await user.update({
    email_verification_token: verificationToken,
    email_verification_expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  // Send welcome email (do not fail registration if email sending errors)
  try {
    await sendWelcomeEmail(email, full_name);
  } catch (emailErr) {
    console.error('sendWelcomeEmail error (non-fatal):', emailErr && emailErr.message ? emailErr.message : emailErr);
  }

  // If registering as restaurant_admin, do not auto-login or return tokens
  if (isRestaurantAdmin) {
    return res.status(201).json(ApiResponse.success({
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
      message: 'Registration submitted. Await platform verification by the platform admin.',
    }, 'Registration submitted'));
  }

  // Generate tokens for other user roles
  const token = generateToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  // Save session
  await UserSession.create({
    user_id: user.id,
    token,
    refresh_token: refreshToken,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  res.status(201).json(ApiResponse.success({
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
    },
    token,
    refreshToken,
  }, 'Registration successful'));
});

// Login user
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email (we'll check active status after verifying password)
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Development debug logging to help diagnose login failures (safe in non-production)
  if (process.env.NODE_ENV === 'development') {
    try {
      console.log('[debug] authController.login — attempt for:', email);
      console.log('[debug] authController.login — userId:', user.id, 'is_active:', user.is_active);
      console.log('[debug] authController.login — stored password_hash length:', (user.password_hash || '').length, 'startsWith $2:', (user.password_hash || '').startsWith('$2'));
    } catch (e) {
      // don't let logging break the login flow
    }
  }

  if (!password || typeof password !== 'string') {
    throw new ApiError(400, 'Invalid password format');
  }

  // Check password
  let isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (process.env.NODE_ENV === 'development') {
    try {
      console.log('[debug] authController.login — bcrypt.compare result:', isPasswordValid);
    } catch (e) {}
  }
  // Compatibility fallback: if stored password isn't a bcrypt hash (e.g., legacy or dev plain text),
  // allow login if the provided password matches the stored value, then re-hash and save it.
  if (!isPasswordValid) {
    try {
      const stored = user.password_hash || '';
      const looksLikeBcrypt = typeof stored === 'string' && stored.startsWith('$2');
      if (process.env.NODE_ENV === 'development') {
        try {
          console.log('[debug] authController.login — fallback check, stored length:', stored.length, 'looksLikeBcrypt:', looksLikeBcrypt);
        } catch (e) {}
      }
      if (!looksLikeBcrypt && password === stored) {
        const salt = await bcrypt.genSalt(10);
        const newHash = await bcrypt.hash(password, salt);
        await user.update({ password_hash: newHash });
        isPasswordValid = true;
      }
    } catch (e) {
      // ignore and proceed to invalid credential handling below
    }
  }

  if (!isPasswordValid) {
    await user.increment('login_attempts');
    throw new ApiError(401, 'Invalid credentials');
  }

  // If account is not active (e.g., restaurant_admin awaiting platform verification), return informative error
  if (!user.is_active) {
    throw new ApiError(403, 'Account not active. Await platform verification.');
  }

  // If this user is a restaurant staff member, ensure their staff record is active
  const staffRecord = await RestaurantStaff.findOne({ where: { user_id: user.id } });
  if (staffRecord && staffRecord.is_active === false) {
    throw new ApiError(403, 'Staff account not active. Await restaurant activation.');
  }

  // Reset login attempts
  await user.update({ login_attempts: 0, last_login: new Date() });

  // Generate tokens
  const token = generateToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id);

  // Save session
  await UserSession.create({
    user_id: user.id,
    token,
    refresh_token: refreshToken,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  // Get restaurant info if admin
  let restaurant = null;
  if (user.role === 'restaurant_admin') {
    const staff = await RestaurantStaff.findOne({ where: { user_id: user.id } });
    if (staff) {
      restaurant = await Restaurant.findByPk(staff.restaurant_id);
    }
  }

  // Attach restaurant staff info (if any) so frontend can detect staff roles (chef, waiter, etc.)
  let staff = null;
  try {
    const staffRecord = await RestaurantStaff.findOne({ where: { user_id: user.id }, attributes: ['id', 'role', 'restaurant_id', 'permissions', 'is_active'] });
    if (staffRecord) staff = staffRecord && typeof staffRecord.toJSON === 'function' ? staffRecord.toJSON() : staffRecord;
  } catch (e) {
    staff = null;
  }

  res.json(ApiResponse.success({
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      avatar_url: user.avatar_url,
    },
    restaurant,
    staff,
    token,
    refreshToken,
  }, 'Login successful'));
});

// Refresh token
const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken: oldRefreshToken } = req.body;

  const session = await UserSession.findOne({
    where: { refresh_token: oldRefreshToken, revoked_at: null },
    include: [{ model: User, as: 'user_owner' }],
  });

  if (!session || session.expires_at < new Date()) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  // Revoke old session
  await session.update({ revoked_at: new Date() });

  // Generate new tokens
  const token = generateToken(session.user_owner.id, session.user_owner.role);
  const refreshToken = generateRefreshToken(session.user_owner.id);

  // Create new session
  await UserSession.create({
    user_id: session.user_owner.id,
    token,
    refresh_token: refreshToken,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  res.json(ApiResponse.success({ token, refreshToken }, 'Token refreshed'));
});

// Logout
const logout = catchAsync(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (token) {
    await UserSession.update(
      { revoked_at: new Date() },
      { where: { token } }
    );
  }

  res.json(ApiResponse.success(null, 'Logged out successfully'));
});

// Forgot password
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  await user.update({
    password_reset_token: resetToken,
    password_reset_expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
  });

  await sendPasswordResetEmail(email, user.full_name, resetToken);

  res.json(ApiResponse.success(null, 'Password reset email sent'));
});

// Reset password
const resetPassword = catchAsync(async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    where: {
      password_reset_token: token,
      password_reset_expires: { [Op.gt]: new Date() },
    },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(newPassword, salt);

  await user.update({
    password_hash,
    password_reset_token: null,
    password_reset_expires: null,
  });

  res.json(ApiResponse.success(null, 'Password reset successful'));
});

// Verify email
const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.params;

  const user = await User.findOne({
    where: {
      email_verification_token: token,
      email_verification_expires: { [Op.gt]: new Date() },
    },
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired verification token');
  }

  await user.update({
    email_verified: true,
    email_verification_token: null,
    email_verification_expires: null,
  });

  res.json(ApiResponse.success(null, 'Email verified successfully'));
});

// Change password
const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  const user = await User.findByPk(userId);
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password_hash);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Current password is incorrect');
  }

  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(newPassword, salt);

  await user.update({ password_hash });

  res.json(ApiResponse.success(null, 'Password changed successfully'));
});

// Get current user (include restaurant for restaurant_admin)
const getMe = catchAsync(async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ['password_hash'] },
  });

  let restaurant = null;
  if (user && user.role === 'restaurant_admin') {
    const staff = await RestaurantStaff.findOne({ where: { user_id: user.id } });
    if (staff) {
      restaurant = await Restaurant.findByPk(staff.restaurant_id);
    }
  }

  // Include staff information for the authenticated user so the frontend can route staff-specific UIs
  let staff = null;
  try {
    const staffRecord = await RestaurantStaff.findOne({ where: { user_id: user.id }, attributes: ['id', 'role', 'restaurant_id', 'permissions', 'is_active'] });
    if (staffRecord) staff = staffRecord && typeof staffRecord.toJSON === 'function' ? staffRecord.toJSON() : staffRecord;
  } catch (e) {
    staff = null;
  }

  res.json(ApiResponse.success({ user, restaurant, staff }, 'User retrieved'));
});

// Update profile
const updateProfile = catchAsync(async (req, res) => {
  const { full_name, phone, avatar_url } = req.body;

  await req.user.update({ full_name, phone, avatar_url });

  res.json(ApiResponse.success({
    id: req.user.id,
    email: req.user.email,
    full_name: req.user.full_name,
    phone: req.user.phone,
    avatar_url: req.user.avatar_url,
    role: req.user.role,
  }, 'Profile updated'));
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  changePassword,
  getMe,
  updateProfile,
};
