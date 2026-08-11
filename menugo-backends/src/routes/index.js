// src/routes/index.js
const express = require('express');
const path = require('path');
const fs = require('fs');
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
const contactRoutes = require('./contactRoutes');
const systemRoutes = require('./systemRoutes');
const uploadRoutes = require('./uploadRoutes');
const previewRoutes = require('./previewRoutes');
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
router.use('/public/contact', contactRoutes);
router.use('/system', systemRoutes);  // Make sure this line exists
router.use('/upload', uploadRoutes);
router.use('/preview', previewRoutes);
// Documentation endpoints
router.get('/docs', (req, res) => {
  const docsPath = path.resolve(__dirname, '..', '..', 'docs', 'api-docs.html');
  if (fs.existsSync(docsPath)) {
    return res.sendFile(docsPath);
  }
  return res.status(404).json({ success: false, message: 'API documentation page not found' });
});

router.get('/docs.json', (req, res) => {
  const docsPath = path.resolve(__dirname, '..', '..', 'docs', 'api-docs.json');
  if (fs.existsSync(docsPath)) {
    const fileContent = fs.readFileSync(docsPath, 'utf8');
    try {
      const parsed = JSON.parse(fileContent);
      const flattenedEndpoints = (parsed.groups || []).flatMap((group) => (group.endpoints || []).map((endpoint) => ({
        ...endpoint,
        group: group.name,
      })));
      return res.json({
        ...parsed,
        endpoints: flattenedEndpoints,
      });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Invalid API documentation JSON', error: error.message });
    }
  }
  return res.status(404).json({ success: false, message: 'API documentation JSON not found' });
});

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Server is running' });
});

module.exports = router;
