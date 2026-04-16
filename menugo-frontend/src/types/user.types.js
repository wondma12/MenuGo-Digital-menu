/**
 * @typedef {Object} User
 * @property {string} id - User unique identifier
 * @property {string} email - User email address
 * @property {string} fullName - User full name
 * @property {string} phone - User phone number
 * @property {string} avatar - User avatar URL
 * @property {string} role - User role (customer, waiter, restaurant_admin, platform_admin, support_agent)
 * @property {boolean} isActive - User active status
 * @property {boolean} isVerified - User verification status
 * @property {boolean} emailVerified - Email verification status
 * @property {string} lastLogin - Last login timestamp
 * @property {Object} preferences - User preferences
 * @property {string} createdAt - Account creation timestamp
 * @property {string} updatedAt - Last update timestamp
 */

/**
 * @typedef {Object} UserPreferences
 * @property {string} language - Preferred language
 * @property {string} theme - UI theme (light/dark)
 * @property {boolean} notifications - Notification preferences
 */

/**
 * @typedef {Object} UserSession
 * @property {string} id - Session identifier
 * @property {string} userId - User identifier
 * @property {string} token - Session token
 * @property {string} refreshToken - Refresh token
 * @property {Object} deviceInfo - Device information
 * @property {string} ipAddress - IP address
 * @property {string} userAgent - User agent string
 * @property {string} expiresAt - Expiration timestamp
 * @property {string} createdAt - Creation timestamp
 */

/**
 * @typedef {Object} LoginRequest
 * @property {string} email - User email
 * @property {string} password - User password
 * @property {boolean} rememberMe - Remember me flag
 */

/**
 * @typedef {Object} LoginResponse
 * @property {User} user - User object
 * @property {string} token - Authentication token
 * @property {string} refreshToken - Refresh token
 */

/**
 * @typedef {Object} RegisterRequest
 * @property {string} fullName - User full name
 * @property {string} email - User email
 * @property {string} phone - User phone
 * @property {string} password - User password
 * @property {string} role - User role
 */

/**
 * @typedef {Object} UpdateProfileRequest
 * @property {string} fullName - User full name
 * @property {string} email - User email
 * @property {string} phone - User phone
 * @property {string} avatar - Avatar URL
 */

/**
 * @typedef {Object} ChangePasswordRequest
 * @property {string} currentPassword - Current password
 * @property {string} newPassword - New password
 */

export const UserRoles = {
  CUSTOMER: 'customer',
  WAITER: 'waiter',
  RESTAURANT_ADMIN: 'restaurant_admin',
  PLATFORM_ADMIN: 'platform_admin',
  SUPPORT_AGENT: 'support_agent',
}

export const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
}