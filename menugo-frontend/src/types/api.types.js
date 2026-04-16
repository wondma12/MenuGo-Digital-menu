/**
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Request success status
 * @property {string} message - Response message
 * @property {any} data - Response data
 * @property {Array} errors - Validation errors
 * @property {number} statusCode - HTTP status code
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {Array} data - Paginated data
 * @property {number} total - Total items count
 * @property {number} page - Current page number
 * @property {number} limit - Items per page
 * @property {number} totalPages - Total pages count
 * @property {boolean} hasNextPage - Has next page flag
 * @property {boolean} hasPrevPage - Has previous page flag
 */

/**
 * @typedef {Object} ApiError
 * @property {string} message - Error message
 * @property {number} statusCode - HTTP status code
 * @property {string} error - Error type
 * @property {Array} details - Error details
 */

/**
 * @typedef {Object} RequestOptions
 * @property {Object} params - URL query parameters
 * @property {Object} headers - Custom headers
 * @property {boolean} withCredentials - Include credentials
 * @property {number} timeout - Request timeout in milliseconds
 * @property {AbortSignal} signal - Abort signal for cancellation
 */

/**
 * @typedef {Object} PaginationParams
 * @property {number} page - Page number (default: 1)
 * @property {number} limit - Items per page (default: 10)
 * @property {string} sortBy - Sort field
 * @property {string} sortOrder - Sort order (asc/desc)
 * @property {string} search - Search query
 */

/**
 * @typedef {Object} DateRangeParams
 * @property {string} startDate - Start date (ISO format)
 * @property {string} endDate - End date (ISO format)
 */

export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
}

export const SortOrder = {
  ASC: 'asc',
  DESC: 'desc',
}