const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isWaiter, isRestaurantAdmin } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { waiterValidations } = require('../middleware/validationMiddleware');
const {
  getDashboard,
  startShift,
  endShift,
  takeBreak,
  getNotifications,
  markNotificationRead,
  getCallRequests,
  getTodayReservations,
  acknowledgeCall,
  resolveCall,
  getPerformance,
  updateRealtimeStatus,
  getProfile,
  updateProfile,
} = require('../controllers/waiterController');

// All routes require authentication and waiter role
router.use(protect);
router.use(isWaiter);

// Dashboard
router.get('/dashboard', getDashboard);

// Shift management
router.post('/shift/start', startShift);
router.post('/shift/end', endShift);
router.post('/shift/break', validate(waiterValidations.takeBreak), takeBreak);

// Notifications
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);

// Call requests
router.get('/calls', getCallRequests);
router.post('/calls/:id/acknowledge', acknowledgeCall);
router.post('/calls/:id/resolve', resolveCall);

// Today's reservations for the waiter's restaurant
router.get('/reservations/today', getTodayReservations);

// Performance
router.get('/performance', getPerformance);

// Realtime status
router.patch('/status', validate(waiterValidations.updateStatus), updateRealtimeStatus);

// Profile
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

module.exports = router;