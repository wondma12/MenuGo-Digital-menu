const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { authValidations } = require('../middleware/validationMiddleware');
const {
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
} = require('../controllers/authController');

// Public routes
router.post('/register', validate(authValidations.register), register);
router.post('/login', validate(authValidations.login), login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', validate(authValidations.forgotPassword), forgotPassword);
router.post('/reset-password', validate(authValidations.resetPassword), resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes
router.use(protect);
router.post('/logout', logout);
router.post('/change-password', validate(authValidations.changePassword), changePassword);
router.get('/me', getMe);
router.put('/profile', updateProfile);

module.exports = router;
