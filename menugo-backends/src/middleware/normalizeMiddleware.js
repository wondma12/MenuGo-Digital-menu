// Normalize incoming request payloads (camelCase → snake_case) for compatibility
const normalizeOrderPayload = (req, res, next) => {
  if (!req.body) {
    return next();
  }

  const body = req.body;

  // Top-level mappings
  if (body.restaurantId && !body.restaurant_id) {
    body.restaurant_id = body.restaurantId;
  }
  if (body.tableNumber && !body.table_number) {
    body.table_number = body.tableNumber;
  }
  if (body.specialInstructions && !body.special_instructions) {
    body.special_instructions = body.specialInstructions;
  }
  if (body.orderType && !body.order_type) {
    body.order_type = body.orderType;
  }
  if (body.couponCode && !body.coupon_code) {
    body.coupon_code = body.couponCode;
  }
  if (body.customerName && !body.customer_name) {
    body.customer_name = body.customerName;
  }
  if (body.customerEmail && !body.customer_email) {
    body.customer_email = body.customerEmail;
  }
  if (body.customerPhone && !body.customer_phone) {
    body.customer_phone = body.customerPhone;
  }

  // Coerce empty strings for optional contact fields so validators treat them as missing
  if ('customer_email' in body && (body.customer_email === '' || body.customer_email == null)) {
    delete body.customer_email;
  }
  if ('customer_phone' in body && (body.customer_phone === '' || body.customer_phone == null)) {
    delete body.customer_phone;
  }

  // Normalize items array
  if (Array.isArray(body.items)) {
    body.items = body.items.map(item => {
      const normalized = { ...item };
      if (item.menuItemId && !item.menu_item_id) {
        normalized.menu_item_id = item.menuItemId;
      }
      if (item.menu_item_id == null && item.id) {
        normalized.menu_item_id = item.id;
      }
      if (item.specialInstructions && !item.special_instructions) {
        normalized.special_instructions = item.specialInstructions;
      }
      if (item.selectedOptions && !normalized.options) {
        normalized.options = item.selectedOptions;
      }
      if (item.selectedModifiers && !normalized.modifiers) {
        normalized.modifiers = item.selectedModifiers;
      }
      if (item.qty && !normalized.quantity) {
        normalized.quantity = item.qty;
      }
      return normalized;
    });
  }

  req.body = body;
  return next();
};

module.exports = {
  normalizeOrderPayload,
};
