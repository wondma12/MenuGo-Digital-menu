const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { User } = require('../models');

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  console.warn('WARNING: JWT_SECRET is not set in environment variables. Using fallback secret.');
  console.warn('Set JWT_SECRET in .env file for production use.');
}

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret || 'dev-fallback-secret-not-for-production-use-set-jwt-secret-env-var',
};

passport.use(
  new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
      const user = await User.findOne({
        where: { id: jwt_payload.id, is_active: true },
      });
      if (user) {
        return done(null, user);
      }
      return done(null, false);
    } catch (error) {
      return done(error, false);
    }
  })
);

module.exports = passport;