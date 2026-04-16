/**
 * @typedef {Object} DashboardStats
 * @property {number} todayOrders - Today's order count
 * @property {number} todayRevenue - Today's revenue
 * @property {number} weekOrders - Week's order count
 * @property {number} weekRevenue - Week's revenue
 * @property {number} monthOrders - Month's order count
 * @property {number} monthRevenue - Month's revenue
 * @property {number} pendingOrders - Pending orders count
 * @property {number} preparingOrders - Preparing orders count
 * @property {number} readyOrders - Ready orders count
 * @property {number} totalMenuItems - Total menu items
 * @property {number} totalCategories - Total categories
 * @property {number} occupiedTables - Occupied tables count
 * @property {number} totalTables - Total tables count
 * @property {number} averageRating - Average rating
 * @property {Array} popularItems - Popular items list
 */

/**
 * @typedef {Object} SalesReport
 * @property {string} date - Report date
 * @property {number} totalOrders - Total orders
 * @property {number} totalRevenue - Total revenue
 * @property {number} averageOrderValue - Average order value
 * @property {number} dineInOrders - Dine-in orders
 * @property {number} takeawayOrders - Takeaway orders
 * @property {number} deliveryOrders - Delivery orders
 * @property {string} topSellingItem - Top selling item name
 * @property {number} topSellingQuantity - Top selling quantity
 */

/**
 * @typedef {Object} MenuPerformance
 * @property {string} itemId - Menu item ID
 * @property {string} itemName - Item name
 * @property {string} category - Item category
 * @property {number} views - View count
 * @property {number} orders - Order count
 * @property {number} quantitySold - Quantity sold
 * @property {number} revenue - Revenue generated
 * @property {number} conversionRate - Conversion rate
 */

/**
 * @typedef {Object} CustomerInsights
 * @property {number} totalCustomers - Total customers
 * @property {number} newCustomers - New customers
 * @property {number} returningCustomers - Returning customers
 * @property {number} retentionRate - Customer retention rate
 * @property {number} averageSpend - Average spend per customer
 * @property {Array} topCustomers - Top customers list
 * @property {Array} customerSegments - Customer segments
 */

/**
 * @typedef {Object} PlatformAnalytics
 * @property {number} totalRestaurants - Total restaurants
 * @property {number} activeRestaurants - Active restaurants
 * @property {number} totalUsers - Total users
 * @property {number} totalOrders - Total orders
 * @property {number} totalRevenue - Total revenue
 * @property {number} platformRevenue - Platform revenue
 * @property {number} subscriptionRevenue - Subscription revenue
 * @property {number} totalQRScans - Total QR code scans
 * @property {number} averageRestaurantRating - Average restaurant rating
 * @property {Array} revenueData - Revenue trend data
 * @property {Array} restaurantGrowth - Restaurant growth data
 * @property {Array} userDistribution - User distribution by role
 * @property {Array} subscriptionDistribution - Subscription distribution
 */

export const ReportTypes = {
  SALES: 'sales',
  ORDERS: 'orders',
  MENU: 'menu',
  CUSTOMERS: 'customers',
  REVENUE: 'revenue',
}

export const TimeRanges = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: 'last_7_days',
  LAST_30_DAYS: 'last_30_days',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_YEAR: 'this_year',
  CUSTOM: 'custom',
}