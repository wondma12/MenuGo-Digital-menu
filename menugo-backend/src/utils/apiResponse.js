class ApiResponse {
  constructor(success, message, data = null, meta = null, errors = null) {
    this.success = success;
    this.message = message;
    if (data !== null) this.data = data;
    if (meta !== null) this.meta = meta;
    if (errors !== null) this.errors = errors;
  }

  static success(data, message = 'Success', meta = null) {
    return new ApiResponse(true, message, data, meta);
  }

  static error(message, errors = null, statusCode = 400) {
    const response = new ApiResponse(false, message, null, null, errors);
    response.statusCode = statusCode;
    return response;
  }

  static created(data, message = 'Resource created successfully') {
    return new ApiResponse(true, message, data);
  }

  static updated(data, message = 'Resource updated successfully') {
    return new ApiResponse(true, message, data);
  }

  static deleted(message = 'Resource deleted successfully') {
    return new ApiResponse(true, message);
  }

  static notFound(message = 'Resource not found') {
    return new ApiResponse(false, message);
  }

  static unauthorized(message = 'Unauthorized access') {
    return new ApiResponse(false, message);
  }

  static forbidden(message = 'Access forbidden') {
    return new ApiResponse(false, message);
  }

  static validation(errors, message = 'Validation error') {
    return new ApiResponse(false, message, null, null, errors);
  }

  toJSON() {
    const result = {
      success: this.success,
      message: this.message,
    };
    if (this.data !== undefined && this.data !== null) result.data = this.data;
    if (this.meta !== undefined && this.meta !== null) result.meta = this.meta;
    if (this.errors !== undefined && this.errors !== null) result.errors = this.errors;
    return result;
  }
}

// Paginated response helper
const paginatedResponse = (data, total, page, limit) => {
  return ApiResponse.success(data, 'Success', {
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
};

module.exports = {
  ApiResponse,
  paginatedResponse,
};