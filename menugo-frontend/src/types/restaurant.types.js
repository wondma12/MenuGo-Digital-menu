/**
 * @typedef {Object} Restaurant
 * @property {string} id - Restaurant unique identifier
 * @property {string} ownerId - Owner user identifier
 * @property {string} name - Restaurant name
 * @property {string} description - Restaurant description
 * @property {string} address - Street address
 * @property {string} city - City
 * @property {string} state - State/Province
 * @property {string} country - Country
 * @property {string} postalCode - Postal/ZIP code
 * @property {number} latitude - Latitude coordinate
 * @property {number} longitude - Longitude coordinate
 * @property {string} phone - Contact phone
 * @property {string} email - Contact email
 * @property {string} website - Website URL
 * @property {string} logoUrl - Logo image URL
 * @property {string} coverImageUrl - Cover image URL
 * @property {string} cuisineType - Primary cuisine type
 * @property {string[]} cuisineTypes - Multiple cuisine types
 * @property {Object} operatingHours - Operating hours schedule
 * @property {number} deliveryRadiusKm - Delivery radius in kilometers
 * @property {number} minimumOrderAmount - Minimum order amount
 * @property {number} taxRate - Tax rate percentage
 * @property {number} serviceCharge - Service charge percentage
 * @property {number} deliveryFee - Delivery fee amount
 * @property {string} qrCodeUrl - QR code URL
 * @property {string} qrCodeIdentifier - QR code identifier
 * @property {boolean} isActive - Active status
 * @property {boolean} isVerified - Verification status
 * @property {string} verificationDate - Verification date
 * @property {string} subscriptionTier - Subscription tier
 * @property {string} subscriptionStartDate - Subscription start date
 * @property {string} subscriptionEndDate - Subscription end date
 * @property {string} subscriptionStatus - Subscription status
 * @property {number} maxMenuItems - Maximum menu items limit
 * @property {number} maxUsers - Maximum users limit
 * @property {number} maxOrdersPerDay - Maximum orders per day
 * @property {Object} features - Feature flags
 * @property {Object} settings - Restaurant settings
 * @property {boolean} onboardingCompleted - Onboarding completion status
 * @property {number} onboardingStep - Current onboarding step
 * @property {number} averageRating - Average customer rating
 * @property {number} totalReviews - Total number of reviews
 * @property {string} createdAt - Creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} RestaurantSettings
 * @property {boolean} autoAcceptOrders - Auto accept orders
 * @property {boolean} allowOnlinePayment - Allow online payment
 * @property {boolean} allowCashPayment - Allow cash payment
 * @property {boolean} enableDelivery - Enable delivery
 * @property {boolean} enableTakeaway - Enable takeaway
 * @property {boolean} tableManagement - Table management enabled
 * @property {boolean} orderNotifications - Order notifications
 * @property {boolean} emailNotifications - Email notifications
 * @property {boolean} smsNotifications - SMS notifications
 * @property {boolean} loyaltyProgram - Loyalty program enabled
 * @property {boolean} happyHour - Happy hour enabled
 */

/**
 * @typedef {Object} RestaurantStats
 * @property {number} totalOrders - Total orders
 * @property {number} totalRevenue - Total revenue
 * @property {number} averageOrderValue - Average order value
 * @property {number} totalCustomers - Total customers
 * @property {number} totalMenuViews - Total menu views
 * @property {number} totalQRScans - Total QR code scans
 * @property {number} pendingOrders - Pending orders count
 * @property {number} preparingOrders - Preparing orders count
 * @property {number} readyOrders - Ready orders count
 */

export const SubscriptionTiers = {
  MONTHLY: 'monthly',
  SIX_MONTH: 'six_month',
  YEARLY: 'yearly',
}

export const SubscriptionStatus = {
  TRIAL: 'trial',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
}