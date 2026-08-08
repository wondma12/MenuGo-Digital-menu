const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models');

// Only configure Google strategy when credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  const resolvedCallback = process.env.GOOGLE_CALLBACK_URL || `${process.env.API_URL || 'http://localhost:5000'}/api/auth/google/callback`;
  // Log the resolved callback so developers can register it in Google Cloud Console
  // (keeps troubleshooting easier when redirect_uri_mismatch occurs).
  try {
    // Only log in non-production or when console is available
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.info('[passportGoogle] using callbackURL =', resolvedCallback);
    }
  } catch (e) { /* ignore logging errors */ }

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: resolvedCallback,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let email = profile.emails && profile.emails[0] && profile.emails[0].value
      email = String(email || '').trim().toLowerCase()
      if (!email) return done(new Error('No email returned from Google'), null)

      // Find existing user by normalized email. This preserves admin/restaurant roles
      // for accounts that were created before Google auth was enabled.
      let user = await User.findOne({ where: { email } })
      if (!user) {
        user = await User.create({
          email,
          full_name: profile.displayName || '',
          is_verified: true,
          is_active: true,
          role: 'customer',
          avatar_url: (profile.photos && profile.photos[0] && profile.photos[0].value) || null,
        })
      }

      return done(null, user)
    } catch (err) {
      return done(err, null)
    }
  }))
}

module.exports = passport;
