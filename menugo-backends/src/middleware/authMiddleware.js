const jwt = require('jsonwebtoken');
const { User, UserSession, RestaurantStaff } = require('../models');
const { ApiError } = require('../utils/apiError');
const { logger } = require('../utils/logger');
const { restrictTo } = require('./roleMiddleware');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers or cookies
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new ApiError(401, 'Not authorized, no token provided');
    }

    // Prefer DB-backed session lookup: if a valid session exists in DB, accept it.
    // This supports local dev sessions and refresh-token based sessions where JWT
    // verification may not be necessary for every request.
    const session = await UserSession.findOne({
      where: { token, revoked_at: null },
      include: [{ model: User, as: 'user_owner', where: { is_active: true } }],
    }).catch(() => null);

    if (session && session.expires_at && session.expires_at > new Date()) {
      req.user = session.user_owner;
      req.userId = session.user_owner.id;
      req.userRole = session.user_owner.role;
      req.sessionId = session.id;
      return next();
    }

    // If no valid DB session, fall back to strict JWT verification
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Re-check session after JWT verify in case of stateless tokens
    const sessionAfter = await UserSession.findOne({
      where: { token, revoked_at: null },
      include: [{ model: User, as: 'user_owner', where: { is_active: true } }],
    }).catch(() => null);

    if (!sessionAfter || sessionAfter.expires_at < new Date()) {
      throw new ApiError(401, 'Session expired or invalid');
    }

    req.user = sessionAfter.user_owner;
    req.userId = sessionAfter.user_owner.id;
    req.userRole = sessionAfter.user_owner.role;
    req.sessionId = sessionAfter.id;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      next(new ApiError(401, 'Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      next(new ApiError(401, 'Token expired'));
    } else {
      next(error);
    }
  }
};

// Optional auth - doesn't require token but sets user if present
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      // Try DB session first
      const session = await UserSession.findOne({
        where: { token, revoked_at: null },
        include: [{ model: User, as: 'user_owner', where: { is_active: true } }],
      }).catch(() => null);

      if (session && session.expires_at > new Date()) {
        req.user = session.user_owner;
        req.userId = session.user_owner.id;
      } else {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const session2 = await UserSession.findOne({
            where: { token, revoked_at: null },
            include: [{ model: User, as: 'user_owner', where: { is_active: true } }],
          }).catch(() => null);
          if (session2 && session2.expires_at > new Date()) {
            req.user = session2.user_owner;
            req.userId = session2.user_owner.id;
          }
        } catch (e) {
          // ignore verification errors in optionalAuth
        }
      }
    }
    next();
  } catch (error) {
    next();
  }
};

// Authorize based on roles (checks both top-level user.role and restaurant staff role)
const authorize = (...roles) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Allow if user's top-level role is permitted
    if (roles.includes(req.user.role)) return next();

    // Check for a restaurant staff assignment and allow based on that role
    try {
      const staff = await RestaurantStaff.findOne({ where: { user_id: req.user.id, is_active: true } });
      if (staff && roles.includes(staff.role)) return next();
    } catch (e) {
      // swallow DB errors and fall through to deny
    }

    return res.status(403).json({ success: false, message: `Role ${req.user.role} is not authorized to access this route` });
  };
};

// Verify JWT token and return decoded payload
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
  );
};

module.exports = {
  protect,
  restrictTo,
  authorize,  // Add this line
  optionalAuth,
  verifyToken,
  generateToken,
  generateRefreshToken,
};