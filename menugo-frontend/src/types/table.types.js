/**
 * @typedef {Object} RestaurantTable
 * @property {string} id - Table unique identifier
 * @property {string} restaurantId - Restaurant identifier
 * @property {string} tableNumber - Table number
 * @property {string} tableName - Table name
 * @property {number} capacity - Table capacity
 * @property {string} qrCodeId - QR code identifier
 * @property {string} qrCodeUrl - QR code URL
 * @property {string} section - Table section
 * @property {number} xPosition - X position on map
 * @property {number} yPosition - Y position on map
 * @property {string} shape - Table shape (rectangle, circle, square)
 * @property {number} width - Table width in pixels
 * @property {number} height - Table height in pixels
 * @property {string} status - Table status
 * @property {string} currentOrderId - Current order ID
 * @property {string} currentWaiterId - Current waiter ID
 * @property {string} currentCustomerName - Current customer name
 * @property {string} occupiedSince - Occupied since timestamp
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} TableReservation
 * @property {string} id - Reservation unique identifier
 * @property {string} restaurantId - Restaurant identifier
 * @property {string} tableId - Table identifier
 * @property {string} customerName - Customer name
 * @property {string} customerPhone - Customer phone
 * @property {string} customerEmail - Customer email
 * @property {number} partySize - Party size
 * @property {string} reservationDate - Reservation date
 * @property {string} reservationTime - Reservation time
 * @property {number} durationMinutes - Duration in minutes
 * @property {string} status - Reservation status
 * @property {string} specialRequests - Special requests
 * @property {string} createdBy - Creator user ID
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} TableAssignment
 * @property {string} id - Assignment identifier
 * @property {string} restaurantId - Restaurant identifier
 * @property {string} tableId - Table identifier
 * @property {string} waiterId - Waiter identifier
 * @property {string} assignedAt - Assignment timestamp
 * @property {string} unassignedAt - Unassignment timestamp
 * @property {string} reason - Assignment reason
 */

export const TableStatus = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  RESERVED: 'reserved',
  CLEANING: 'cleaning',
  MAINTENANCE: 'maintenance',
}

export const ReservationStatus = {
  CONFIRMED: 'confirmed',
  SEATED: 'seated',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
  COMPLETED: 'completed',
}

export const TableShape = {
  RECTANGLE: 'rectangle',
  CIRCLE: 'circle',
  SQUARE: 'square',
}