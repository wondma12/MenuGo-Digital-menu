/**
 * @typedef {Object} Order
 * @property {string} id - Order unique identifier
 * @property {string} orderNumber - Order number
 * @property {string} restaurantId - Restaurant identifier
 * @property {string} userId - User identifier
 * @property {string} waiterId - Waiter identifier
 * @property {string} tableId - Table identifier
 * @property {string} tableNumber - Table number
 * @property {string} customerName - Customer name
 * @property {string} customerPhone - Customer phone
 * @property {string} customerEmail - Customer email
 * @property {number} subtotal - Subtotal amount
 * @property {number} taxAmount - Tax amount
 * @property {number} serviceCharge - Service charge amount
 * @property {number} deliveryFee - Delivery fee amount
 * @property {number} discountAmount - Discount amount
 * @property {number} totalAmount - Total amount
 * @property {string} status - Order status
 * @property {string} paymentStatus - Payment status
 * @property {string} paymentMethod - Payment method
 * @property {string} orderType - Order type (dine_in, takeaway, delivery)
 * @property {string} deliveryAddress - Delivery address
 * @property {string} specialInstructions - Special instructions
 * @property {string} verifiedBy - Verifier user ID
 * @property {boolean} verifiedByWaiter - Verified by waiter flag
 * @property {string} verificationCode - Verification code
 * @property {string} verifiedAt - Verification timestamp
 * @property {string} preparedBy - Preparer user ID
 * @property {string} preparedAt - Preparation start timestamp
 * @property {string} readyAt - Ready timestamp
 * @property {string} servedBy - Server user ID
 * @property {string} servedAt - Served timestamp
 * @property {string} cancelledBy - Canceller user ID
 * @property {string} cancelledAt - Cancellation timestamp
 * @property {string} cancellationReason - Cancellation reason
 * @property {number} estimatedPreparationTime - Estimated prep time
 * @property {number} actualPreparationTime - Actual prep time
 * @property {string} source - Order source (qr_code, waiter, online, pos)
 * @property {string} couponCode - Applied coupon code
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} OrderItem
 * @property {string} id - Order item identifier
 * @property {string} orderId - Order identifier
 * @property {string} menuItemId - Menu item identifier
 * @property {string} itemName - Item name
 * @property {number} quantity - Item quantity
 * @property {number} unitPrice - Unit price
 * @property {number} discountAmount - Discount amount
 * @property {number} subtotal - Subtotal amount
 * @property {string} specialInstructions - Special instructions
 * @property {string} status - Item status
 * @property {OrderItemOption[]} options - Selected options
 * @property {OrderItemModifier[]} modifiers - Selected modifiers
 */

/**
 * @typedef {Object} OrderItemOption
 * @property {string} orderItemId - Order item identifier
 * @property {string} optionName - Option name
 * @property {string} choiceName - Selected choice name
 * @property {number} priceAdjustment - Price adjustment
 */

/**
 * @typedef {Object} OrderItemModifier
 * @property {string} orderItemId - Order item identifier
 * @property {string} modifierName - Modifier name
 * @property {number} priceAdjustment - Price adjustment
 */

/**
 * @typedef {Object} OrderStatusHistory
 * @property {string} id - History record identifier
 * @property {string} orderId - Order identifier
 * @property {string} status - Order status
 * @property {string} changedBy - User who changed status
 * @property {string} notes - Change notes
 * @property {string} createdAt - Change timestamp
 */

export const OrderStatus = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  PREPARING: 'preparing',
  READY: 'ready',
  SERVED: 'served',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
}

export const PaymentStatus = {
  UNPAID: 'unpaid',
  PAID: 'paid',
  REFUNDED: 'refunded',
  FAILED: 'failed',
  PARTIAL: 'partial',
}

export const PaymentMethod = {
  CASH: 'cash',
  CARD: 'card',
  ONLINE: 'online',
  MOBILE_MONEY: 'mobile_money',
}

export const OrderType = {
  DINE_IN: 'dine_in',
  TAKEAWAY: 'takeaway',
  DELIVERY: 'delivery',
}

export const OrderSource = {
  QR_CODE: 'qr_code',
  WAITER: 'waiter',
  ONLINE: 'online',
  POS: 'pos',
}