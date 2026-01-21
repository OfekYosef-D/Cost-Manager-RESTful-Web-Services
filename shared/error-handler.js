// Error handling utilities with consistent error response format
class ApiError extends Error {
  constructor(code, description, statusCode = 500, details = null) {
    super(description);
    this.code = code;
    this.description = description;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = Date.now();
  }

  toResponseFormat() {
    // Convert to API-compatible format (maintaining backward compatibility)
    return {
      id: this.code,
      message: this.description
    };
  }
}

function createErrorResponse(errorCode, errorMessage, httpStatus = 500) {
  const error = new ApiError(errorCode, errorMessage, httpStatus);
  return {
    response: error.toResponseFormat(),
    statusCode: httpStatus
  };
}

function handleServiceError(logger, error, defaultCode = 'SERVICE_ERROR', defaultMessage = 'An error occurred') {
  logger.error({ error: error.message }, `Service error: ${defaultMessage}`);
  
  const errorMessage = error.message || defaultMessage;
  return createErrorResponse(defaultCode, errorMessage, 500);
}

module.exports = {
  ApiError,
  createErrorResponse,
  handleServiceError
};
