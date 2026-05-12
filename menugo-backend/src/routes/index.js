// src/routes/index.js
const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const restaurantRoutes = require('./restaurantRoutes');
const menuRoutes = require('./menuRoutes');
const orderRoutes = require('./orderRoutes');
const tableRoutes = require('./tableRoutes');
const waiterRoutes = require('./waiterRoutes');
const staffRoutes = require('./staffRoutes');
const qrRoutes = require('./qrRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const reviewRoutes = require('./reviewRoutes');
const couponRoutes = require('./couponRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const notificationRoutes = require('./notificationRoutes');
const reportRoutes = require('./reportRoutes');
// const subscriptionRoutes = require('./subscriptionRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const platformRoutes = require('./platformRoutes');
const supportRoutes = require('./supportRoutes');
const systemRoutes = require('./systemRoutes');
const uploadRoutes = require('./uploadRoutes');
const kitchenRoutes = require('./kitchenRoutes');  // Make sure this line exists
// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/menu', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/tables', tableRoutes);
router.use('/waiters', waiterRoutes);
router.use('/staff', staffRoutes);
router.use('/qr', qrRoutes);
router.use('/kitchen', kitchenRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/reviews', reviewRoutes);
router.use('/coupons', couponRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);
// router.use('/subscriptions', subscriptionRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/platform', platformRoutes);  // Make sure this line exists
router.use('/support', supportRoutes);  // Make sure this line exists
router.use('/system', systemRoutes);  // Make sure this line exists
router.use('/upload', uploadRoutes);
// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Server is running' });
});

module.exports = router;
