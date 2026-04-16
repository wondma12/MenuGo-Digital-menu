const { body, param } = require('express-validator');
const { WAITER_SHIFT_STATUS, WAITER_REALTIME_STATUS, CALL_TYPES } = require('../utils/constants');

// Start shift validation
const startShiftValidation = [
  body('shift_start')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Shift start must be a valid time format (HH:MM)'),
  body('shift_end')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Shift end must be a valid time format (HH:MM)'),
];

// End shift validation
const endShiftValidation = [
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

// Take break validation
const takeBreakValidation = [
  body('duration')
    .isInt({ min: 5, max: 120 })
    .withMessage('Break duration must be between 5 and 120 minutes'),
];

// Update waiter status validation
const updateWaiterStatusValidation = [
  body('status')
    .isIn(Object.values(WAITER_REALTIME_STATUS))
    .withMessage(`Status must be one of: ${Object.values(WAITER_REALTIME_STATUS).join(', ')}`),
  body('current_table_id')
    .optional()
    .isUUID()
    .withMessage('Invalid table ID format'),
  body('battery_level')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Battery level must be between 0 and 100'),
  body('current_location')
    .optional()
    .isObject()
    .withMessage('Current location must be a valid JSON object'),
];

// Create waiter call validation
const createWaiterCallValidation = [
  body('table_id')
    .isUUID()
    .withMessage('Invalid table ID format'),
  body('call_type')
    .isIn(Object.values(CALL_TYPES))
    .withMessage(`Call type must be one of: ${Object.values(CALL_TYPES).join(', ')}`),
  body('customer_name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters'),
];

// Acknowledge call validation
const acknowledgeCallValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid call ID format'),
];

// Resolve call validation
const resolveCallValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid call ID format'),
  body('resolution_notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Resolution notes cannot exceed 500 characters'),
];

// Update waiter profile validation
const updateWaiterProfileValidation = [
  body('preferred_language')
    .optional()
    .isIn(['en', 'es', 'fr', 'de', 'zh'])
    .withMessage('Preferred language must be one of: en, es, fr, de, zh'),
  body('notification_preferences')
    .optional()
    .isObject()
    .withMessage('Notification preferences must be a valid JSON object'),
  body('notification_preferences.sound_enabled')
    .optional()
    .isBoolean()
    .withMessage('sound_enabled must be a boolean'),
  body('notification_preferences.vibration_enabled')
    .optional()
    .isBoolean()
    .withMessage('vibration_enabled must be a boolean'),
  body('notification_preferences.new_order_notification')
    .optional()
    .isBoolean()
    .withMessage('new_order_notification must be a boolean'),
  body('notification_preferences.order_ready_notification')
    .optional()
    .isBoolean()
    .withMessage('order_ready_notification must be a boolean'),
  body('notification_preferences.push_notifications')
    .optional()
    .isBoolean()
    .withMessage('push_notifications must be a boolean'),
];

// Get notifications query validation
const getNotificationsQueryValidation = [
  body('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  body('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  body('is_read')
    .optional()
    .isBoolean()
    .withMessage('is_read must be a boolean'),
];

module.exports = {
  startShiftValidation,
  endShiftValidation,
  takeBreakValidation,
  updateWaiterStatusValidation,
  createWaiterCallValidation,
  acknowledgeCallValidation,
  resolveCallValidation,
  updateWaiterProfileValidation,
  getNotificationsQueryValidation,
};