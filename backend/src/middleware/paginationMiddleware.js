import { ERROR_MESSAGES } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

/**
 * Pagination Middleware
 * Validates and sets pagination query parameters
 * Usage: router.get('/items', paginationMiddleware, controller.getItems);
 */
export const paginationMiddleware = (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, Math.min(parseInt(req.query.limit) || 10, 100));

    // Validate page
    if (!Number.isInteger(page) || page < 1) {
      return res.status(400).json({
        success: false,
        message: 'Page must be a positive integer',
      });
    }

    // Validate limit
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: 'Limit must be between 1 and 100',
      });
    }

    // Attach to request for use in controllers
    req.pagination = {
      page,
      limit,
      skip: (page - 1) * limit,
    };

    next();
  } catch (error) {
    logger.error('Pagination middleware error', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Helper to build pagination response
 * Usage: res.json({ success: true, data, pagination: buildPaginationResponse(total, req.pagination) });
 */
export const buildPaginationResponse = (total, pagination) => {
  return {
    total,
    page: pagination.page,
    limit: pagination.limit,
    totalPages: Math.ceil(total / pagination.limit),
  };
};

/**
 * Helper to apply pagination to query
 * Usage: const results = await Model.find(query).limit(req.pagination.limit).skip(req.pagination.skip);
 */
export const applyPagination = (query, pagination) => {
  return query.limit(pagination.limit).skip(pagination.skip);
};

export default {
  paginationMiddleware,
  buildPaginationResponse,
  applyPagination,
};