const { CURRENCY } = require('./constants');

// Format currency
const formatCurrency = (amount, currency = CURRENCY.CODE) => {
  if (amount === undefined || amount === null) return `$${0}`;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: CURRENCY.DECIMAL_PLACES,
  }).format(amount);
};

// Format number with commas
const formatNumber = (number) => {
  if (number === undefined || number === null) return '0';
  return new Intl.NumberFormat('en-US').format(number);
};

// Format percentage
const formatPercentage = (value, decimals = 1) => {
  if (value === undefined || value === null) return '0%';
  return `${value.toFixed(decimals)}%`;
};

// Format phone number
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{1,3})(\d{3})(\d{4})$/);
  if (match) {
    return `+${match[1]} (${match[2]}) ${match[3]}`;
  }
  return phone;
};

// Format address
const formatAddress = (address) => {
  const parts = [];
  if (address.address) parts.push(address.address);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.postal_code) parts.push(address.postal_code);
  if (address.country) parts.push(address.country);
  return parts.join(', ');
};

// Truncate text
const truncateText = (text, maxLength = 50, suffix = '...') => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
};

// Capitalize first letter
const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Title case
const toTitleCase = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
};

// Snake case to camel case
const snakeToCamel = (str) => {
  return str.replace(/(_\w)/g, (match) => match[1].toUpperCase());
};

// Camel case to snake case
const camelToSnake = (str) => {
  return str.replace(/[A-Z]/g, (match) => `_${match.toLowerCase()}`);
};

// Convert object keys from snake to camel
const convertKeysToCamel = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(v => convertKeysToCamel(v));
  }
  if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      result[snakeToCamel(key)] = convertKeysToCamel(obj[key]);
      return result;
    }, {});
  }
  return obj;
};

// Convert object keys from camel to snake
const convertKeysToSnake = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map(v => convertKeysToSnake(v));
  }
  if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      result[camelToSnake(key)] = convertKeysToSnake(obj[key]);
      return result;
    }, {});
  }
  return obj;
};

// Format order status for display
const formatOrderStatus = (status) => {
  const statusMap = {
    pending: 'Pending',
    verified: 'Verified',
    preparing: 'Preparing',
    ready: 'Ready',
    served: 'Served',
    completed: 'Completed',
    cancelled: 'Cancelled',
    rejected: 'Rejected',
  };
  return statusMap[status] || status;
};

// Format payment status for display
const formatPaymentStatus = (status) => {
  const statusMap = {
    unpaid: 'Unpaid',
    paid: 'Paid',
    refunded: 'Refunded',
    failed: 'Failed',
    partial: 'Partial',
  };
  return statusMap[status] || status;
};

// Format table status for display
const formatTableStatus = (status) => {
  const statusMap = {
    available: 'Available',
    occupied: 'Occupied',
    reserved: 'Reserved',
    cleaning: 'Cleaning',
    maintenance: 'Maintenance',
  };
  return statusMap[status] || status;
};

module.exports = {
  formatCurrency,
  formatNumber,
  formatPercentage,
  formatPhoneNumber,
  formatAddress,
  truncateText,
  capitalize,
  toTitleCase,
  snakeToCamel,
  camelToSnake,
  convertKeysToCamel,
  convertKeysToSnake,
  formatOrderStatus,
  formatPaymentStatus,
  formatTableStatus,
};