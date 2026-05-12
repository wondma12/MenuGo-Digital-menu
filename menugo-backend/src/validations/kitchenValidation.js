// src/validations/kitchenValidation.js
const Joi = require('joi');

const validateKitchenUpdate = (req, res, next) => {
  const schema = Joi.object({
    status: Joi.string().valid('pending', 'preparing', 'ready', 'completed', 'cancelled').required(),
    notes: Joi.string().max(500).optional().allow(null),
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  
  next();
};

const validateBulkUpdate = (req, res, next) => {
  const schema = Joi.object({
    orderIds: Joi.array().items(Joi.number().integer().positive()).min(1).max(100).required(),
    status: Joi.string().valid('preparing', 'ready', 'completed').required(),
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  
  next();
};

const validateCreateKitchenOrder = (req, res, next) => {
  const schema = Joi.object({
    order_id: Joi.number().integer().positive().required(),
    restaurant_id: Joi.number().integer().positive().required(),
    order_number: Joi.string().max(50).required(),
    table_number: Joi.string().max(20).required(),
    customer_name: Joi.string().max(100).optional(),
    waiter_id: Joi.number().integer().positive().optional(),
    items: Joi.array().items(
      Joi.object({
        item_id: Joi.number().integer().positive().required(),
        item_name: Joi.string().max(200).required(),
        quantity: Joi.number().integer().min(1).max(99).required(),
        preparation_time: Joi.number().integer().min(1).max(60).optional(),
        special_instructions: Joi.string().max(500).optional(),
        modifiers: Joi.array().items(
          Joi.object({
            name: Joi.string().max(100).required(),
            price: Joi.number().min(0).optional(),
          }),
        ).optional(),
      }),
    ).min(1).max(50).required(),
    priority: Joi.string().valid('low', 'normal', 'high', 'urgent').optional(),
    notes: Joi.string().max(500).optional(),
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  
  next();
};

const validateStationAssignment = (req, res, next) => {
  const schema = Joi.object({
    stationId: Joi.number().integer().positive().required(),
    kitchenOrderId: Joi.number().integer().positive().required(),
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  
  next();
};

const validateDateRange = (req, res, next) => {
  const schema = Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
  });

  const { error } = schema.validate(req.query);
  
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message,
    });
  }
  
  next();
};

module.exports = {
  validateKitchenUpdate,
  validateBulkUpdate,
  validateCreateKitchenOrder,
  validateStationAssignment,
  validateDateRange,
};
