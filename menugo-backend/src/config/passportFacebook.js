const passport = require('passport');
let FacebookStrategy = null;
try {
  FacebookStrategy = require('passport-facebook').Strategy;
} catch (e) {
  FacebookStrategy = null;
}

const { User } = require('../models');

// Only configure Facebook strategy when credentials are provided
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL || `${process.env.API_URL || 'http://localhost:5000'}/api/auth/facebook/callback`,
    profileFields: ['id', 'emails', 'name', 'displayName', 'photos']
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails && profile.emails[0] && profile.emails[0].value;
      if (!email) return done(new Error('No email returned from Facebook'), null);

      // Find or create a user
      let user = await User.findOne({ where: { email } });
      if (!user) {
        user = await User.create({
          email,
          full_name: profile.displayName || `${(profile.name && profile.name.givenName) || ''} ${(profile.name && profile.name.familyName) || ''}`.trim(),
          is_verified: true,
          is_active: true,
          role: 'customer',
          avatar_url: (profile.photos && profile.photos[0] && profile.photos[0].value) || null,
        });
      }

      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }));
}

module.exports = passport;
