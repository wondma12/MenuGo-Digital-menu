// src/routes/platformRoutes.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { restrictTo } = require('../middleware/roleMiddleware');
const {
  getPublicPlatformSummary,
  getPlatformAnalytics,
  getPlatformUserAnalytics,
  getPlatformDashboard,
  getSupportTickets,
  createSupportTicket,
  updateSupportTicket,
  addTicketMessage,
  getSystemLogs,
  getSystemHealth,
} = require('../controllers/platformController');

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

// Public homepage summary
router.get('/public-summary', getPublicPlatformSummary);

// Public subscription plans endpoint for the services page
router.get('/subscriptions/plans', getSubscriptionPlans);

// All other platform routes require authentication and platform admin role
router.use(protect);
router.use(restrictTo('platform_admin'));

// Dashboard routes
router.get('/dashboard', getPlatformDashboard);
// Use the richer dashboard payload for the analytics page, not the simplified counts-only route.
router.get('/analytics', getPlatformDashboard);
router.get('/analytics/users', getPlatformUserAnalytics);

// Support tickets routes
router.get('/tickets', getSupportTickets);
router.post('/tickets', createSupportTicket);
router.put('/tickets/:id', updateSupportTicket);
router.post('/tickets/:id/messages', addTicketMessage);

// System routes
router.get('/logs', getSystemLogs);
router.get('/health', getSystemHealth);

// IMPORTANT: Subscription routes - MAKE SURE THESE EXIST
// router.get('/subscriptions/plans', getSubscriptionPlans); // already exposed publicly above
router.get('/subscriptions', getAllSubscriptions);
router.get('/subscriptions/:id', getSubscriptionById);
router.get('/subscriptions/restaurant/:restaurantId', getRestaurantSubscription);
router.post('/subscriptions/plans', createSubscriptionPlan);
router.post('/subscriptions/plans/create', createSubscriptionPlan);
router.put('/subscriptions/plans/:id', updateSubscriptionPlan);
router.delete('/subscriptions/plans/:id', deleteSubscriptionPlan);
router.post('/subscriptions', createSubscription);
router.put('/subscriptions/:id', updateSubscription);
router.delete('/subscriptions/:id/cancel', cancelSubscription);
router.get('/subscriptions/revenue/report', getSubscriptionRevenue);

module.exports = router;