const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isRestaurantStaff } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  updateStaffStatus,
  getStaffSchedule,
  updateStaffSchedule,
  getRoles,
  updateRolePermissions,
  updateStaffPermissions,
} = require('../controllers/staffController');

// All staff routes require authentication
router.use(protect);

// Restaurant staff endpoints
router.get('/', isRestaurantStaff, getStaff);
router.post('/', isRestaurantStaff, createStaff);

// Schedule (specific) - register before ':id' to avoid being captured by the generic param route
router.get('/schedule', isRestaurantStaff, getStaffSchedule);
router.put('/schedule', isRestaurantStaff, updateStaffSchedule);

// Roles & permissions (specific)
router.get('/roles', isRestaurantStaff, getRoles);
router.put('/roles/:roleId', isRestaurantStaff, updateRolePermissions);
router.put('/:staffId/permissions', isRestaurantStaff, updateStaffPermissions);

// Generic staff item routes (by id)
router.put('/:id', isRestaurantStaff, updateStaff);
router.delete('/:id', isRestaurantStaff, deleteStaff);
router.patch('/:id/status', isRestaurantStaff, updateStaffStatus);

module.exports = router;
