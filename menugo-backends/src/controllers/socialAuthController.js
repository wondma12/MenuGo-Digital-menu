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

// Allowed frontend origins for redirect safety (local dev hosts + configured FRONTEND_URL)
const allowedOrigins = new Set([
  frontendUrl.replace(/\/api\/?$/, ''),
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5172',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
])

exports.googleRedirect = (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(501).json({ success: false, message: 'Google OAuth not configured on this backend' });
  }
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || `${process.env.API_URL || 'http://localhost:5000'}/api/auth/google/callback`;

  // Determine frontend origin to return to after OAuth. Prefer the Origin header if present (captures dev port).
  let frontendOrigin = req.headers.origin || req.query.frontend || frontendUrl
  try {
    frontendOrigin = decodeURIComponent(frontendOrigin)
  } catch (e) {
    // keep raw
  }

  if (!allowedOrigins.has(frontendOrigin)) {
    frontendOrigin = frontendUrl
  }

  // Pass frontendOrigin via OAuth state so Google will return it to us on callback.
  return passportGoogle.authenticate('google', { scope: ['profile', 'email'], callbackURL: callbackUrl, state: encodeURIComponent(frontendOrigin) })(req, res, next);
};

exports.googleCallback = (req, res, next) => {
  const callbackUrl = process.env.GOOGLE_CALLBACK_URL || `${process.env.API_URL || 'http://localhost:5000'}/api/auth/google/callback`;
  return passportGoogle.authenticate('google', { session: false, callbackURL: callbackUrl }, async (err, user, info) => {
    try {
      if (err || !user) {
        // use state if available
        const requested = req.query && req.query.state ? decodeURIComponent(req.query.state) : frontendUrl
        const dest = allowedOrigins.has(requested) ? requested : frontendUrl
        return res.redirect(`${dest}/login?error=oauth`);
      }

      const token = generateToken(user.id, user.role);
      const refreshToken = generateRefreshToken(user.id);

      await UserSession.create({
        user_id: user.id,
        token,
        refresh_token: refreshToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const requested = req.query && req.query.state ? decodeURIComponent(req.query.state) : frontendUrl
      const dest = allowedOrigins.has(requested) ? requested : frontendUrl

      const redirectUrl = `${dest}/login?token=${encodeURIComponent(token)}`;
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

      const redirectUrl = `${frontendUrl}/login?token=${encodeURIComponent(token)}`;
      return res.redirect(redirectUrl);
    } catch (e) {
      return next(new ApiError(500, 'OAuth processing failed'));
    }
  })(req, res, next);
};
