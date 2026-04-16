/**
 * @typedef {Object} Waiter
 * @property {string} id - Waiter unique identifier
 * @property {string} staffId - Staff record identifier
 * @property {string} userId - User identifier
 * @property {string} restaurantId - Restaurant identifier
 * @property {string} employeeId - Employee ID
 * @property {string} hireDate - Hire date
 * @property {number} hourlyRate - Hourly rate
 * @property {string} shiftStart - Shift start time
 * @property {string} shiftEnd - Shift end time
 * @property {string[]} assignedSections - Assigned sections
 * @property {string[]} assignedTables - Assigned table IDs
 * @property {number} maxTables - Maximum tables allowed
 * @property {boolean} isOnDuty - On duty status
 * @property {string} currentShiftStart - Current shift start time
 * @property {string} currentShiftEnd - Current shift end time
 * @property {number} rating - Waiter rating
 * @property {number} totalOrdersServed - Total orders served
 * @property {number} totalTips - Total tips earned
 * @property {number} totalRevenueGenerated - Total revenue generated
 * @property {Object} notificationPreferences - Notification preferences
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} WaiterShift
 * @property {string} id - Shift identifier
 * @property {string} waiterId - Waiter identifier
 * @property {string} shiftDate - Shift date
 * @property {string} shiftStart - Scheduled start time
 * @property {string} shiftEnd - Scheduled end time
 * @property {string} actualStart - Actual start timestamp
 * @property {string} actualEnd - Actual end timestamp
 * @property {string} status - Shift status
 * @property {string} breakStart - Break start time
 * @property {string} breakEnd - Break end time
 * @property {number} breakDuration - Break duration in minutes
 * @property {number} totalHours - Total hours worked
 * @property {number} ordersServed - Orders served during shift
 * @property {number} tipsEarned - Tips earned during shift
 * @property {string} notes - Shift notes
 */

/**
 * @typedef {Object} WaiterPerformance
 * @property {string} waiterId - Waiter identifier
 * @property {string} date - Performance date
 * @property {number} ordersServed - Orders served
 * @property {number} tablesServed - Tables served
 * @property {number} averageResponseTime - Average response time (seconds)
 * @property {number} customerSatisfaction - Customer satisfaction rating
 * @property {number} totalRevenue - Total revenue generated
 * @property {number} totalTips - Total tips earned
 * @property {number} upsellCount - Number of upsells
 * @property {number} upsellRevenue - Revenue from upsells
 */

export const ShiftStatus = {
  SCHEDULED: 'scheduled',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ABSENT: 'absent',
  LATE: 'late',
  BREAK: 'break',
}

export const CallType = {
  SERVICE: 'service',
  BILL: 'bill',
  HELP: 'help',
  FOOD_ISSUE: 'food_issue',
  OTHER: 'other',
}

export const CallStatus = {
  PENDING: 'pending',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved',
  CANCELLED: 'cancelled',
}