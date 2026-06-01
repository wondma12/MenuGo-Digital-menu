const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { User, UserSession, Restaurant, RestaurantStaff } = require('../models');
const { uploadToCloudinary } = require('../config/cloudinary');
const { generateToken, generateRefreshToken } = require('../services/tokenService');
const { sendWelcomeEmail, sendPasswordResetEmail } = require('../config/email');
const { ApiResponse } = require('../utils/apiResponse');
const { ApiError } = require('../utils/apiError');
const { catchAsync } = require('../utils/catchAsync');

const normalizeEmailInput = (email) => String(email || '').trim().toLowerCase();
const isAuthLoginDebugEnabled = String(process.env.AUTH_LOGIN_DEBUG || '').toLowerCase() === 'true';

const getClientUrl = () => String(process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');

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
  const normalizedEmail = normalizeEmailInput(email);

  // Check if user exists
  const existingUser = await User.findOne({ where: { email: normalizedEmail } });
  if (existingUser) {
    throw new ApiError(400, 'User already exists with this email');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  // Create user
  const isRestaurantAdmin = role === 'restaurant_admin';
  const user = await User.create({
    email: normalizedEmail,
    password_hash,
    full_name,
    phone,
    role: role || 'customer',
    is_verified: true,
    is_active: true,
  });

  // If registering as restaurant admin, create restaurant
  if (isRestaurantAdmin && restaurant_name) {
    const restaurant = await Restaurant.create({
      owner_id: user.id,
      name: restaurant_name,
      email: normalizedEmail || null,
      phone: restaurant_phone || phone || null,
      address: restaurant_address || null,
      city: restaurant_city || null,
      country: restaurant_country || null,
      website: restaurant_website || null,
      slogan: restaurant_slogan || null,
      is_verified: true,
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

    // If files were uploaded with the registration, handle them (business license, logo, banner, coverImage)
    try {
      const files = req.files || {};
      // business license may be named businessLicenseDocument or document
      const licenseFile = (files.businessLicenseDocument && files.businessLicenseDocument[0]) || (files.document && files.document[0]) || null;
      if (licenseFile) {
        const uploadResult = await uploadToCloudinary(licenseFile.path, 'menugo/documents');
        if (uploadResult && uploadResult.url) {
          const settings = restaurant.settings || {};
          settings.business_license = {
            url: uploadResult.url,
            publicId: uploadResult.publicId || null,
            uploadedAt: new Date(),
            originalName: licenseFile.originalname,
          };
          await restaurant.update({ settings });
        }
      }

      // Optionally handle logo/banner/coverImage and store URLs on restaurant
      const logoFile = (files.logo && files.logo[0]) || null;
      const bannerFile = (files.banner && files.banner[0]) || (files.coverImage && files.coverImage[0]) || null;
      const updates = {};
      if (logoFile) {
        const r = await uploadToCloudinary(logoFile.path, 'menugo/restaurants');
        if (r && r.url) {
          updates.logo_url = r.url;
        }
      }
      if (bannerFile) {
        const r2 = await uploadToCloudinary(bannerFile.path, 'menugo/restaurants');
        if (r2 && r2.url) {
          updates.cover_image_url = r2.url;
        }
      }
      if (Object.keys(updates).length) {
        await restaurant.update(updates);
      }
    } catch (docErr) {
      console.error('Failed to upload files during registration:', docErr && docErr.message ? docErr.message : docErr);
      // non-fatal; proceed with registration
    }
  }

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  await user.update({
    email_verification_token: verificationToken,
    email_verification_expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });
  // Send welcome email (do not fail registration if email sending errors)
  try {
    await sendWelcomeEmail(normalizedEmail, full_name);
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
    }, 'Registration successful'));
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
  const normalizedEmail = normalizeEmailInput(email);

  // Find user by email (we'll check active status after verifying password)
  const user = await User.findOne({ where: { email: normalizedEmail } });
  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  // Development debug logging to help diagnose login failures (safe in non-production)
  if (isAuthLoginDebugEnabled) {
    try {
      console.log('[debug] authController.login — attempt for:', email);
      console.log('[debug] authController.login — normalized email:', normalizedEmail);
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

  if (isAuthLoginDebugEnabled) {
    try {
      console.log('[debug] authController.login — bcrypt.compare result:', isPasswordValid);
    } catch (e) {
      // don't let logging break the login flow
    }
  }
  // Compatibility fallback: if stored password isn't a bcrypt hash (e.g., legacy or dev plain text),
  // allow login if the provided password matches the stored value, then re-hash and save it.
  if (!isPasswordValid) {
    try {
      const stored = user.password_hash || '';
      const looksLikeBcrypt = typeof stored === 'string' && stored.startsWith('$2');
      if (isAuthLoginDebugEnabled) {
        try {
          console.log('[debug] authController.login — fallback check, stored length:', stored.length, 'looksLikeBcrypt:', looksLikeBcrypt);
        } catch (e) {
          // don't let logging break the login flow
        }
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

  // Restaurant admins should be able to log in directly now that the payment gate is removed.
  if (user.role === 'restaurant_admin' && (!user.is_active || !user.is_verified)) {
    await user.update({ is_active: true, is_verified: true });
    user.is_active = true;
    user.is_verified = true;

    const staffRecord = await RestaurantStaff.findOne({ where: { user_id: user.id } });
    if (staffRecord) {
      const staffRestaurant = await Restaurant.findByPk(staffRecord.restaurant_id);
      if (staffRestaurant) {
        await staffRestaurant.update({ is_active: true, is_verified: true });
      }
    }
  }

  // If account is not active (e.g., restaurant_admin awaiting platform verification), return informative error
  if (!user.is_active) {
    throw new ApiError(403, 'Account not active. Await platform verification.');
  }

  // If this user is a restaurant staff member, ensure their staff record is active
  const staffRecord = await RestaurantStaff.findOne({ where: { user_id: user.id } });
  // treat any falsy value (false, 0, null, undefined) as inactive
  if (staffRecord && !staffRecord.is_active) {
    throw new ApiError(403, 'Staff account not active. Await restaurant activation.');
  }
  // If staff belongs to a restaurant, ensure the restaurant itself is active
  if (staffRecord) {
    const staffRestaurant = await Restaurant.findByPk(staffRecord.restaurant_id);
    if (staffRestaurant && !staffRestaurant.is_active) {
      throw new ApiError(403, 'Associated restaurant is not active. Contact platform admin.');
    }
  }

  // Reset login attempts
  await user.update({ login_attempts: 0, last_login: new Date() });

  // Generate tokens and save session (guard against unexpected errors)
  let token;
  let refreshToken;
  try {
    token = generateToken(user.id, user.role);
    refreshToken = generateRefreshToken(user.id);

    await UserSession.create({
      user_id: user.id,
      token,
      refresh_token: refreshToken,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  } catch (sessionErr) {
    console.error('authController.login - failed to create session or generate tokens:', sessionErr && sessionErr.message ? sessionErr.message : sessionErr);
    throw new ApiError(500, 'Login failed due to server error');
  }

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
    if (staffRecord) {
      staff = staffRecord && typeof staffRecord.toJSON === 'function' ? staffRecord.toJSON() : staffRecord;
    }
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
      is_active: user.is_active,
      is_verified: user.is_verified,
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
      { where: { token } },
    );
  }

  res.json(ApiResponse.success(null, 'Logged out successfully'));
});

// Forgot password
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = normalizeEmailInput(email);

  const user = await User.findOne({ where: { email: normalizedEmail } });
  if (!user) {
    return res.json(ApiResponse.success(null, 'If an account exists for that email, a reset link has been prepared.'));
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  await user.update({
    password_reset_token: resetToken,
    password_reset_expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
  });

  try {
    await sendPasswordResetEmail(normalizedEmail, user.full_name, resetToken);
  } catch (emailError) {
    console.error('forgotPassword email delivery error:', emailError && emailError.message ? emailError.message : emailError);

    const resetUrl = `${getClientUrl()}/reset-password/${resetToken}`;

    if (process.env.NODE_ENV !== 'production' || process.env.ALLOW_DEV_EMAIL_FALLBACK === 'true') {
      return res.json(ApiResponse.success({
        email_sent: false,
        reset_url: resetUrl,
        reset_token: resetToken,
        delivery_message: 'Email delivery is unavailable in local development. Use the reset link below to continue.',
      }, 'Email delivery is unavailable in local development. Use the reset link below to continue.'));
    }

    throw new ApiError(503, 'Password reset is temporarily unavailable. Please try again later.');
  }

  res.json(ApiResponse.success({ email_sent: true }, 'If an account exists for that email, a reset link has been sent.'));
});

// Reset password
const resetPassword = catchAsync(async (req, res) => {
  const { token } = req.body;
  const nextPassword = req.body.newPassword || req.body.password;

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
  const password_hash = await bcrypt.hash(nextPassword, salt);

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
    if (staffRecord) {
      staff = staffRecord && typeof staffRecord.toJSON === 'function' ? staffRecord.toJSON() : staffRecord;
    }
  } catch (e) {
    staff = null;
  }

  res.json(ApiResponse.success({ user, restaurant, staff }, 'User retrieved'));
});

// Update profile
const updateProfile = catchAsync(async (req, res) => {
  const { full_name, phone, avatar_url, email, preferences, cover_image_url, coverImageUrl } = req.body;

  const nextEmail = email ? normalizeEmailInput(email) : null;
  if (nextEmail && nextEmail !== req.user.email) {
    const existingUser = await User.findOne({ where: { email: nextEmail } });
    if (existingUser && existingUser.id !== req.user.id) {
      throw new ApiError(409, 'Email address is already in use');
    }
  }

  const currentPreferences = req.user.preferences || {};
  const nextPreferences = {
    ...currentPreferences,
    ...(preferences || {}),
  };

  const resolvedCoverImageUrl = coverImageUrl || cover_image_url || preferences?.coverImageUrl || preferences?.cover_image_url || nextPreferences.coverImageUrl || nextPreferences.cover_image_url || null;
  if (resolvedCoverImageUrl) {
    nextPreferences.coverImageUrl = resolvedCoverImageUrl;
  }

  await req.user.update({
    full_name: full_name || req.user.full_name,
    phone: phone || req.user.phone,
    avatar_url: avatar_url || req.user.avatar_url,
    email: nextEmail || req.user.email,
    preferences: nextPreferences,
  });

  const updatedUser = await User.findByPk(req.user.id, { attributes: { exclude: ['password_hash'] } });

  res.json(ApiResponse.success({
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      full_name: updatedUser.full_name,
      phone: updatedUser.phone,
      avatar_url: updatedUser.avatar_url,
      preferences: updatedUser.preferences,
      role: updatedUser.role,
      is_active: updatedUser.is_active,
      is_verified: updatedUser.is_verified,
      email_verified: updatedUser.email_verified,
      last_login: updatedUser.last_login,
      login_attempts: updatedUser.login_attempts,
    },
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
