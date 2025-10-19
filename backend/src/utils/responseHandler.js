import { logger } from './logger.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from './constants.js';

/**
 * Standardized Response Handler
 * Ensures consistent response format across all endpoints
 */

// =====================
// SUCCESS RESPONSES
// =====================

/**
 * Send success response with data and pagination
 */
export const sendPaginatedResponse = (res, data, pagination, message = SUCCESS_MESSAGES.FETCHED) => {
  res.json({
    success: true,
    message,
    data,
    pagination,
  });
};

/**
 * Send success response with data only
 */
export const sendDataResponse = (res, data, message = SUCCESS_MESSAGES.FETCHED, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send success response with message only
 */
export const sendMessageResponse = (res, message = SUCCESS_MESSAGES.UPDATED, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
  });
};

/**
 * Send success response with data and message
 */
export const sendSuccessResponse = (res, message, data, statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    ...(data && { data }),
  });
};

/**
 * Send created response (201)
 */
export const sendCreatedResponse = (res, data, message = SUCCESS_MESSAGES.CREATED) => {
  res.status(201).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send updated response
 */
export const sendUpdatedResponse = (res, data, message = SUCCESS_MESSAGES.UPDATED) => {
  res.status(200).json({
    success: true,
    message,
    data,
  });
};

/**
 * Send deleted response
 */
export const sendDeletedResponse = (res, message = SUCCESS_MESSAGES.DELETED) => {
  res.status(200).json({
    success: true,
    message,
  });
};

// =====================
// ERROR RESPONSES
// =====================

/**
 * Send error response
 */
export const sendErrorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = Array.isArray(errors) ? errors : [errors];
  }

  res.status(statusCode).json(response);
};

/**
 * Send validation error response (400)
 */
export const sendValidationError = (res, message = ERROR_MESSAGES.VALIDATION_ERROR, errors = null) => {
  sendErrorResponse(res, 400, message, errors);
};

/**
 * Send not found error response (404)
 */
export const sendNotFoundError = (res, message = ERROR_MESSAGES.NOT_FOUND) => {
  sendErrorResponse(res, 404, message);
};

/**
 * Send unauthorized error response (401)
 */
export const sendUnauthorizedError = (res, message = ERROR_MESSAGES.INVALID_TOKEN) => {
  sendErrorResponse(res, 401, message);
};

/**
 * Send forbidden error response (403)
 */
export const sendForbiddenError = (res, message = ERROR_MESSAGES.UNAUTHORIZED) => {
  sendErrorResponse(res, 403, message);
};

/**
 * Send conflict error response (409)
 */
export const sendConflictError = (res, message = ERROR_MESSAGES.ALREADY_EXISTS) => {
  sendErrorResponse(res, 409, message);
};

/**
 * Send server error response (500)
 */
export const sendServerError = (res, message = ERROR_MESSAGES.SERVER_ERROR) => {
  sendErrorResponse(res, 500, message);
};

/**
 * Send bad request error response (400)
 */
export const sendBadRequestError = (res, message, errors = null) => {
  sendErrorResponse(res, 400, message, errors);
};

// =====================
// ASYNC SAFE WRAPPERS
// =====================

/**
 * Safe async operation executor with error handling
 */
export const safeAsyncExecute = async (asyncFn, errorMessage = ERROR_MESSAGES.SERVER_ERROR) => {
  try {
    return await asyncFn();
  } catch (error) {
    logger.error(errorMessage, error);
    throw error;
  }
};

/**
 * Wrap controller with automatic error handling
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Standardized error handler for catch blocks
 */
export const handleControllerError = (error, res, customMessage = null) => {
  logger.error(customMessage || 'Controller error', error);

  if (error.statusCode) {
    return sendErrorResponse(res, error.statusCode, error.message);
  }

  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((e) => e.message);
    return sendValidationError(res, ERROR_MESSAGES.VALIDATION_ERROR, errors);
  }

  if (error.name === 'CastError') {
    return sendBadRequestError(res, 'Invalid ID format');
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return sendConflictError(res, `${field} already exists`);
  }

  if (error.message.includes('Unauthorized')) {
    return sendForbiddenError(res);
  }

  if (error.message.includes('not found')) {
    return sendNotFoundError(res, error.message);
  }

  return sendServerError(res);
};

// =====================
// RESPONSE BUILDERS
// =====================

/**
 * Build standardized data response
 */
export const buildDataResponse = (data, message = SUCCESS_MESSAGES.FETCHED) => {
  return {
    success: true,
    message,
    data,
  };
};

/**
 * Build standardized paginated response
 */
export const buildPaginatedResponse = (data, pagination, message = SUCCESS_MESSAGES.FETCHED) => {
  return {
    success: true,
    message,
    data,
    pagination,
  };
};

/**
 * Build standardized error response
 */
export const buildErrorResponse = (message, errors = null) => {
  const response = {
    success: false,
    message,
  };

  if (errors) {
    response.errors = Array.isArray(errors) ? errors : [errors];
  }

  return response;
};

export default {
  // Success responses
  sendPaginatedResponse,
  sendDataResponse,
  sendMessageResponse,
  sendSuccessResponse,
  sendCreatedResponse,
  sendUpdatedResponse,
  sendDeletedResponse,
  // Error responses
  sendErrorResponse,
  sendValidationError,
  sendNotFoundError,
  sendUnauthorizedError,
  sendForbiddenError,
  sendConflictError,
  sendServerError,
  sendBadRequestError,
  // Async helpers
  safeAsyncExecute,
  asyncHandler,
  handleControllerError,
  // Builders
  buildDataResponse,
  buildPaginatedResponse,
  buildErrorResponse,
};