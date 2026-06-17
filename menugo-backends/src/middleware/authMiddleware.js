const jwt = require('jsonwebtoken');
const { User, UserSession, RestaurantStaff } = require('../models');
const { ApiError } = require('../utils/apiError');
const { logger } = require('../utils/logger');
const { restrictTo } = require('./roleMiddleware');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers, cookies, or query param
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.headers['x-access-token']) {
      token = req.headers['x-access-token'];
    } else if (req.headers['auth_token']) {
      token = req.headers['auth_token'];
    } else if (req.headers['x-auth-token']) {
      token = req.headers['x-auth-token'];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    // Normalize token: trim and strip surrounding quotes which can appear
    // when stored or transmitted incorrectly by some clients.
    if (typeof token === 'string') {
      token = token.trim();
      // Remove surrounding single or double quotes
      token = token.replace(/^"(.+)"$/, '$1').replace(/^'(.+)'$/, '$1');
    }

    if (!token) {
      throw new ApiError(401, 'Not authorized, no token provided');
    }

    // Dev/debugging: log masked token source and snippet to help diagnose
    // malformed headers during development. Enable by setting DEBUG_AUTH=true.
    const authDebug = String(process.env.DEBUG_AUTH || '').toLowerCase() === 'true';
    if (authDebug) {
      const mask = (t) => (typeof t === 'string' && t.length > 12) ? `${t.slice(0,6)}...${t.slice(-6)}` : String(t)
      const headerVal = req.headers.authorization || req.headers['x-access-token'] || req.headers['auth_token'] || req.headers['x-auth-token'] || null
      logger && logger.info && logger.info('protect() token sources', { header: headerVal && String(headerVal).slice(0,120), cookie: req.cookies && req.cookies.token, query: req.query && req.query.token, sanitized: mask(token) })
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

    // If no valid DB session, try JWT verification. We accept either
    // a valid DB-backed session OR a valid JWT (stateless). This makes
    // the middleware robust when sessions are rotated/absent.
    let decoded = null;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (verifyErr) {
      // If token is not a JWT (e.g. a random session token) or malformed,
      // attempt a final DB lookup before failing to give clearer behavior.
      const fallback = await UserSession.findOne({
        where: { token, revoked_at: null },
        include: [{ model: User, as: 'user_owner', where: { is_active: true } }],
      }).catch(() => null);

      if (fallback && fallback.expires_at && fallback.expires_at > new Date()) {
        req.user = fallback.user_owner;
        req.userId = fallback.user_owner.id;
        req.userRole = fallback.user_owner.role;
        req.sessionId = fallback.id;
        return next();
      }

      // Re-throw so outer catch handles sending appropriate error
      throw verifyErr;
    }

    // If JWT verified, try to find a matching session to attach metadata.
    // If no DB session exists, fall back to loading the user directly.
    const sessionAfter = await UserSession.findOne({
      where: { token, revoked_at: null },
      include: [{ model: User, as: 'user_owner', where: { is_active: true } }],
    }).catch(() => null);

    if (sessionAfter && sessionAfter.expires_at && sessionAfter.expires_at > new Date()) {
      req.user = sessionAfter.user_owner;
      req.userId = sessionAfter.user_owner.id;
      req.userRole = sessionAfter.user_owner.role;
      req.sessionId = sessionAfter.id;
      return next();
    }

    // No DB session found — attempt to load user from decoded JWT payload
    if (decoded && decoded.id) {
      const userFromToken = await User.findByPk(decoded.id).catch(() => null);
      if (userFromToken && userFromToken.is_active) {
        req.user = userFromToken;
        req.userId = userFromToken.id;
        req.userRole = userFromToken.role;
        // sessionId remains undefined for stateless JWTs
        return next();
      }
    }

    throw new ApiError(401, 'Session expired or invalid');
    } catch (error) {
    // Mask token for logs (don't log full token).
    const mask = (t) => (typeof t === 'string' && t.length > 12) ? `${t.slice(0,6)}...${t.slice(-6)}` : String(t)
    if (error.name === 'JsonWebTokenError') {
      logger && logger.warn && logger.warn('Invalid JWT provided to protect()', { reason: error.message, token: mask(req.headers && (req.headers.authorization || req.headers['x-access-token'] || req.headers['auth_token'] || req.headers['x-auth-token'] || req.cookies?.token || req.query?.token)) })
      next(new ApiError(401, 'Invalid token'));
    } else if (error.name === 'TokenExpiredError') {
      logger && logger.info && logger.info('Expired JWT provided to protect()', { token: mask(req.headers && (req.headers.authorization || req.headers['x-access-token'] || req.headers['auth_token'] || req.headers['x-auth-token'] || req.cookies?.token || req.query?.token)) })
      next(new ApiError(401, 'Token expired'));
    } else {
      logger && logger.error && logger.error('Auth protect() error', { err: error && (error.message || error) })
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