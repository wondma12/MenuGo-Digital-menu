const passportGoogle = require('../config/passportGoogle');
let passportFacebook;
try {
  // passportFacebook is optional; only require if present
  passportFacebook = require('../config/passportFacebook');
} catch (e) {
  passportFacebook = null;
}

const { generateToken, generateRefreshToken } = require('../services/tokenService');
const { UserSession } = require('../models');
const { ApiError } = require('../utils/apiError');

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

exports.googleRedirect = (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(501).json({ success: false, message: 'Google OAuth not configured on this backend' });
  }
  return passportGoogle.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

exports.googleCallback = (req, res, next) => {
  return passportGoogle.authenticate('google', { session: false }, async (err, user, info) => {
    try {
      if (err || !user) {
        return res.redirect(`${frontendUrl}/login?error=oauth`);
      }

      const token = generateToken(user.id, user.role);
      const refreshToken = generateRefreshToken(user.id);

      await UserSession.create({
        user_id: user.id,
        token,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const userPayload = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar_url: user.avatar_url || null,
      };

      const redirectUrl = `${frontendUrl}/login?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(userPayload))}`;
      return res.redirect(redirectUrl);
    } catch (e) {
      return next(new ApiError(500, 'OAuth processing failed'));
    }
  })(req, res, next);
};

// Facebook handlers
exports.facebookRedirect = (req, res, next) => {
  // If Facebook strategy not configured, return helpful error
  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET || !passportFacebook) {
    return res.status(501).json({ success: false, message: 'Facebook OAuth not configured on this backend' });
  }
  return passportFacebook.authenticate('facebook', { scope: ['email', 'public_profile'] })(req, res, next);
};

exports.facebookCallback = (req, res, next) => {
  if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET || !passportFacebook) {
    return res.status(501).json({ success: false, message: 'Facebook OAuth not configured on this backend' });
  }

  return passportFacebook.authenticate('facebook', { session: false }, async (err, user, info) => {
    try {
      if (err || !user) {
        return res.redirect(`${frontendUrl}/login?error=oauth`);
      }

      const token = generateToken(user.id, user.role);
      const refreshToken = generateRefreshToken(user.id);

      await UserSession.create({
        user_id: user.id,
        token,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const userPayload = {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar_url: user.avatar_url || null,
      };

      const redirectUrl = `${frontendUrl}/login?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(userPayload))}`;
      return res.redirect(redirectUrl);
    } catch (e) {
      return next(new ApiError(500, 'OAuth processing failed'));
    }
  })(req, res, next);
};
