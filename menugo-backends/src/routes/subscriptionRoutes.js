// src/routes/subscriptionRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const {
  getSubscriptionPlans,
  getAllSubscriptions,
  getSubscriptionById,
  getRestaurantSubscription,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  getSubscriptionRevenue,
} = require('../controllers/subscriptionController');

// All subscription routes require authentication
router.use(protect);

// Public subscription routes (accessible by all authenticated users)
router.get('/plans', getSubscriptionPlans);
router.get('/current', async (req, res) => {
  // Get current subscription for the authenticated user's restaurant
  const { RestaurantStaff } = require('../models');
  const staff = await RestaurantStaff.findOne({ where: { user_id: req.user.id } });
  if (staff) {
    const subscription = await getRestaurantSubscription({ params: { restaurantId: staff.restaurant_id } }, res);
    return subscription;
  }
  res.json({ success: true, data: null });
});
router.get('/restaurant/:restaurantId', getRestaurantSubscription);
router.get('/invoices', (req, res) => {
  res.json({ success: true, data: [] });
});
router.get('/invoices/:invoiceId/download', (req, res) => {
  res.json({ success: true, data: {} });
});
router.get('/revenue', getSubscriptionRevenue);

// Admin only routes
router.use(restrictTo('platform_admin'));
router.get('/', getAllSubscriptions);
router.get('/:id', getSubscriptionById);
router.post('/plans', createSubscriptionPlan);
router.put('/plans/:id', updateSubscriptionPlan);
router.delete('/plans/:id', deleteSubscriptionPlan);
router.post('/', createSubscription);
router.put('/', updateSubscription);
router.post('/cancel', cancelSubscription);

module.exports = router;