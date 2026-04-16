const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { isRestaurantStaff, isWaiter, isRestaurantOwner } = require('../middleware/roleMiddleware');
const { validate } = require('../middleware/validationMiddleware');
const { tableValidations } = require('../middleware/validationMiddleware');
const {
  getTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
  assignWaiter,
  getReservations,
  createReservation,
  updateReservationStatus,
  getTableLayout,
} = require('../controllers/tableController');

// Protected routes
router.use(protect);

// Table CRUD
router.get('/restaurant/:restaurantId', isRestaurantStaff, getTables);
router.get('/restaurant/:restaurantId/layout', isRestaurantStaff, getTableLayout);
router.get('/:id', getTableById);
router.post('/restaurant/:restaurantId', isRestaurantOwner, validate(tableValidations.create), createTable);
router.put('/:id', isRestaurantOwner, updateTable);
router.delete('/:id', isRestaurantOwner, deleteTable);
router.patch('/:id/status', isRestaurantStaff, validate(tableValidations.updateStatus), updateTableStatus);
router.post('/:id/assign-waiter', isRestaurantStaff, validate(tableValidations.assignWaiter), assignWaiter);

// Reservation routes
router.get('/:id/reservations', isRestaurantStaff, getReservations);
router.post('/restaurant/:restaurantId/reservations', isRestaurantStaff, validate(tableValidations.createReservation), createReservation);
router.patch('/reservations/:id/status', isRestaurantStaff, updateReservationStatus);

module.exports = router;