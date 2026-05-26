const { body, param, query } = require('express-validator');

// Generate report validation
const generateReportValidation = [
  param('restaurantId')
    .isUUID()
    .withMessage('Invalid restaurant ID format'),
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (req.query.start_date && new Date(value) <= new Date(req.query.start_date)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),
  query('format')
    .optional()
    .isIn(['json', 'excel', 'pdf', 'csv'])
    .withMessage('Format must be json, excel, pdf, or csv'),
  query('group_by')
    .optional()
    .isIn(['day', 'week', 'month', 'year'])
    .withMessage('Group by must be day, week, month, or year'),
];

// Export data validation
const exportDataValidation = [
  param('restaurantId')
    .isUUID()
    .withMessage('Invalid restaurant ID format'),
  query('entity')
    .isIn(['orders', 'menu_items', 'customers', 'inventory', 'reviews'])
    .withMessage('Entity must be orders, menu_items, customers, inventory, or reviews'),
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  query('format')
    .optional()
    .isIn(['excel', 'csv', 'json'])
    .withMessage('Format must be excel, csv, or json'),
];

// Sales report validation
const salesReportValidation = [
  param('restaurantId')
    .isUUID()
    .withMessage('Invalid restaurant ID format'),
  query('period')
    .optional()
    .isIn(['day', 'week', 'month', 'year', 'custom'])
    .withMessage('Period must be day, week, month, year, or custom'),
  query('start_date')
    .if(query('period').equals('custom'))
    .notEmpty()
    .withMessage('Start date is required for custom period')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('end_date')
    .if(query('period').equals('custom'))
    .notEmpty()
    .withMessage('End date is required for custom period')
    .isISO8601()
    .withMessage('End date must be a valid date'),
];

// Order report validation
const orderReportValidation = [
  param('restaurantId')
    .isUUID()
    .withMessage('Invalid restaurant ID format'),
  query('status')
    .optional()
    .isIn(['pending', 'verified', 'preparing', 'ready', 'served', 'completed', 'cancelled', 'rejected'])
    .withMessage('Invalid order status'),
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
];

// Menu performance report validation
const menuPerformanceValidation = [
  param('restaurantId')
    .isUUID()
    .withMessage('Invalid restaurant ID format'),
  query('category_id')
    .optional()
    .isUUID()
    .withMessage('Invalid category ID format'),
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
];

// Customer report validation
const customerReportValidation = [
  param('restaurantId')
    .isUUID()
    .withMessage('Invalid restaurant ID format'),
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  query('min_orders')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Minimum orders must be a non-negative integer'),
];

module.exports = {
  generateReportValidation,
  exportDataValidation,
  salesReportValidation,
  orderReportValidation,
  menuPerformanceValidation,
  customerReportValidation,
};