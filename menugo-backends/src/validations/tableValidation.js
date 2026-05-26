const { body, param } = require('express-validator');
const { TABLE_STATUS, TABLE_SHAPES, RESERVATION_STATUS } = require('../utils/constants');

// Create table validation
const createTableValidation = [
  param('restaurantId')
    .isUUID()
    .withMessage('Invalid restaurant ID format'),
  body('table_number')
    .notEmpty()
    .withMessage('Table number is required')
    .trim(),
  body('table_name')
    .optional()
    .trim(),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Capacity must be between 1 and 20'),
  body('section')
    .optional()
    .trim(),
  body('x_position')
    .optional()
    .isInt()
    .withMessage('X position must be an integer'),
  body('y_position')
    .optional()
    .isInt()
    .withMessage('Y position must be an integer'),
  body('shape')
    .optional()
    .isIn(Object.values(TABLE_SHAPES))
    .withMessage(`Shape must be one of: ${Object.values(TABLE_SHAPES).join(', ')}`),
  body('width')
    .optional()
    .isInt({ min: 50, max: 200 })
    .withMessage('Width must be between 50 and 200'),
  body('height')
    .optional()
    .isInt({ min: 50, max: 200 })
    .withMessage('Height must be between 50 and 200'),
];

// Update table validation
const updateTableValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid table ID format'),
  body('table_number')
    .optional()
    .trim(),
  body('table_name')
    .optional()
    .trim(),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 20 })
    .withMessage('Capacity must be between 1 and 20'),
  body('section')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(Object.values(TABLE_STATUS))
    .withMessage(`Status must be one of: ${Object.values(TABLE_STATUS).join(', ')}`),
];

// Update table status validation
const updateTableStatusValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid table ID format'),
  body('status')
    .isIn(Object.values(TABLE_STATUS))
    .withMessage(`Status must be one of: ${Object.values(TABLE_STATUS).join(', ')}`),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

// Assign waiter validation
const assignWaiterValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid table ID format'),
  body('waiter_id')
    .isUUID()
    .withMessage('Invalid waiter ID format'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Reason cannot exceed 500 characters'),
];

// Create reservation validation
const createReservationValidation = [
  param('restaurantId')
    .isUUID()
    .withMessage('Invalid restaurant ID format'),
  body('table_id')
    .optional()
    .isUUID()
    .withMessage('Invalid table ID format'),
  body('customer_name')
    .notEmpty()
    .withMessage('Customer name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),
  body('customer_phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('customer_email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('party_size')
    .isInt({ min: 1, max: 50 })
    .withMessage('Party size must be between 1 and 50'),
  body('reservation_date')
    .isISO8601()
    .withMessage('Reservation date must be a valid date')
    .custom(value => {
      const date = new Date(value);
      if (date < new Date()) {
        throw new Error('Reservation date cannot be in the past');
      }
      return true;
    }),
  body('reservation_time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Reservation time must be a valid time format (HH:MM)'),
  body('duration_minutes')
    .optional()
    .isInt({ min: 30, max: 240 })
    .withMessage('Duration must be between 30 and 240 minutes'),
  body('special_requests')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special requests cannot exceed 500 characters'),
];

// Update reservation status validation
const updateReservationStatusValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid reservation ID format'),
  body('status')
    .isIn(Object.values(RESERVATION_STATUS))
    .withMessage(`Status must be one of: ${Object.values(RESERVATION_STATUS).join(', ')}`),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

// Get reservations query validation
const getReservationsQueryValidation = [
  param('restaurantId')
    .isUUID()
    .withMessage('Invalid restaurant ID format'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid date'),
  body('status')
    .optional()
    .isIn(Object.values(RESERVATION_STATUS))
    .withMessage(`Status must be one of: ${Object.values(RESERVATION_STATUS).join(', ')}`),
];

module.exports = {
  createTableValidation,
  updateTableValidation,
  updateTableStatusValidation,
  assignWaiterValidation,
  createReservationValidation,
  updateReservationStatusValidation,
  getReservationsQueryValidation,
};