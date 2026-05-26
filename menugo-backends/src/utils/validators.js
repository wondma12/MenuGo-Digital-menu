const { isValidEmail, isValidPhone } = require('./helpers');
const { ORDER_STATUS, PAYMENT_STATUS, USER_ROLES } = require('./constants');

// Validate required fields
const validateRequired = (data, fields) => {
  const errors = [];
  
  for (const field of fields) {
    if (!data[field] && data[field] !== 0) {
      errors.push(`${field} is required`);
    }
  }
  
  return errors;
};

// Validate email
const validateEmail = (email) => {
  if (!email) return null;
  if (!isValidEmail(email)) {
    return 'Invalid email format';
  }
  return null;
};

// Validate phone
const validatePhone = (phone) => {
  if (!phone) return null;
  if (!isValidPhone(phone)) {
    return 'Invalid phone number format';
  }
  return null;
};

// Validate password strength
const validatePassword = (password) => {
  if (!password) return 'Password is required';
  
  const errors = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return errors.length > 0 ? errors.join(', ') : null;
};

// Validate URL
const validateUrl = (url) => {
  if (!url) return null;
  
  const urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
  if (!urlRegex.test(url)) {
    return 'Invalid URL format';
  }
  return null;
};

// Validate price
const validatePrice = (price) => {
  if (price === undefined || price === null) return 'Price is required';
  if (isNaN(price)) return 'Price must be a number';
  if (price < 0) return 'Price cannot be negative';
  if (price > 999999.99) return 'Price exceeds maximum value';
  return null;
};

// Validate quantity
const validateQuantity = (quantity) => {
  if (quantity === undefined || quantity === null) return 'Quantity is required';
  if (!Number.isInteger(quantity)) return 'Quantity must be an integer';
  if (quantity < 1) return 'Quantity must be at least 1';
  if (quantity > 999) return 'Quantity exceeds maximum value';
  return null;
};

// Validate rating
const validateRating = (rating) => {
  if (rating === undefined || rating === null) return 'Rating is required';
  if (!Number.isInteger(rating)) return 'Rating must be an integer';
  if (rating < 1 || rating > 5) return 'Rating must be between 1 and 5';
  return null;
};

// Validate date
const validateDate = (date, isRequired = false) => {
  if (!date) {
    return isRequired ? 'Date is required' : null;
  }
  
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return 'Invalid date format';
  }
  return null;
};

// Validate future date
const validateFutureDate = (date) => {
  const error = validateDate(date, true);
  if (error) return error;
  
  const parsedDate = new Date(date);
  if (parsedDate < new Date()) {
    return 'Date must be in the future';
  }
  return null;
};

// Validate order status transition
const validateOrderStatusTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    [ORDER_STATUS.PENDING]: [ORDER_STATUS.VERIFIED, ORDER_STATUS.CANCELLED, ORDER_STATUS.REJECTED],
    [ORDER_STATUS.VERIFIED]: [ORDER_STATUS.PREPARING, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.PREPARING]: [ORDER_STATUS.READY, ORDER_STATUS.CANCELLED],
    [ORDER_STATUS.READY]: [ORDER_STATUS.SERVED, ORDER_STATUS.COMPLETED],
    [ORDER_STATUS.SERVED]: [ORDER_STATUS.COMPLETED],
    [ORDER_STATUS.COMPLETED]: [],
    [ORDER_STATUS.CANCELLED]: [],
    [ORDER_STATUS.REJECTED]: [],
  };
  
  const allowed = validTransitions[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    return `Cannot transition from ${currentStatus} to ${newStatus}`;
  }
  return null;
};

// Validate payment status transition
const validatePaymentStatusTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    [PAYMENT_STATUS.UNPAID]: [PAYMENT_STATUS.PAID, PAYMENT_STATUS.FAILED],
    [PAYMENT_STATUS.PAID]: [PAYMENT_STATUS.REFUNDED],
    [PAYMENT_STATUS.REFUNDED]: [],
    [PAYMENT_STATUS.FAILED]: [PAYMENT_STATUS.UNPAID],
    [PAYMENT_STATUS.PARTIAL]: [PAYMENT_STATUS.PAID, PAYMENT_STATUS.REFUNDED],
  };
  
  const allowed = validTransitions[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    return `Cannot transition payment from ${currentStatus} to ${newStatus}`;
  }
  return null;
};

// Validate user role
const validateUserRole = (role) => {
  const validRoles = Object.values(USER_ROLES);
  if (!validRoles.includes(role)) {
    return `Invalid role. Must be one of: ${validRoles.join(', ')}`;
  }
  return null;
};

// Validate array of items
const validateArray = (items, validator, itemName = 'item') => {
  if (!Array.isArray(items)) {
    return `${itemName}s must be an array`;
  }
  
  const errors = [];
  items.forEach((item, index) => {
    const error = validator(item);
    if (error) {
      errors.push(`${itemName} at index ${index}: ${error}`);
    }
  });
  
  return errors.length > 0 ? errors : null;
};

// Validate object against schema
const validateSchema = (data, schema) => {
  const errors = {};
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];
    
    if (rules.required && (value === undefined || value === null || value === '')) {
      errors[field] = `${field} is required`;
      continue;
    }
    
    if (value !== undefined && value !== null) {
      if (rules.type && typeof value !== rules.type) {
        errors[field] = `${field} must be of type ${rules.type}`;
      }
      
      if (rules.min !== undefined && value < rules.min) {
        errors[field] = `${field} must be at least ${rules.min}`;
      }
      
      if (rules.max !== undefined && value > rules.max) {
        errors[field] = `${field} must be at most ${rules.max}`;
      }
      
      if (rules.pattern && !rules.pattern.test(value)) {
        errors[field] = rules.patternMessage || `${field} has invalid format`;
      }
      
      if (rules.custom) {
        const customError = rules.custom(value);
        if (customError) errors[field] = customError;
      }
    }
  }
  
  return Object.keys(errors).length > 0 ? errors : null;
};

module.exports = {
  validateRequired,
  validateEmail,
  validatePhone,
  validatePassword,
  validateUrl,
  validatePrice,
  validateQuantity,
  validateRating,
  validateDate,
  validateFutureDate,
  validateOrderStatusTransition,
  validatePaymentStatusTransition,
  validateUserRole,
  validateArray,
  validateSchema,
};