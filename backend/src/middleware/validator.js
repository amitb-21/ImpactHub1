import { ERROR_MESSAGES } from '../utils/constants.js';

export const validateCreateCommunity = (req, res, next) => {
  const { name, description, location, category } = req.body;

  const errors = [];

  if (!name || name.trim().length < 3) {
    errors.push('Community name must be at least 3 characters');
  }
  if (!description || description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }
  if (!location || location.trim().length < 2) {
    errors.push('Location is required');
  }
  if (category && !['Environment', 'Education', 'Health', 'Social', 'Other'].includes(category)) {
    errors.push('Invalid category');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      errors,
    });
  }

  next();
};

export const validateCreateEvent = (req, res, next) => {
  const { title, description, startDate, endDate, location, category } = req.body;

  const errors = [];

  if (!title || title.trim().length < 3) {
    errors.push('Event title must be at least 3 characters');
  }
  if (!description || description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }
  if (!startDate) {
    errors.push('Start date is required');
  }
  if (!endDate) {
    errors.push('End date is required');
  }
  if (new Date(startDate) > new Date(endDate)) {
    errors.push('End date must be after start date');
  }
  if (!location || location.trim().length < 2) {
    errors.push('Location is required');
  }
  if (category && !['Cleanup', 'Volunteering', 'Education', 'Fundraising', 'Other'].includes(category)) {
    errors.push('Invalid category');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      errors,
    });
  }

  next();
};

export const validateCreateRating = (req, res, next) => {
  const { entityType, entityId, rating } = req.body;

  const errors = [];

  if (!entityType || !['Community', 'Event'].includes(entityType)) {
    errors.push('Valid entityType is required (Community or Event)');
  }
  if (!entityId) {
    errors.push('entityId is required');
  }
  if (!rating || rating < 1 || rating > 5) {
    errors.push('Rating must be a number between 1 and 5');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: ERROR_MESSAGES.VALIDATION_ERROR,
      errors,
    });
  }

  next();
};

export const validateId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID format',
      });
    }
    next();
  };
};

export const validatePagination = (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  if (page < 1) {
    return res.status(400).json({
      success: false,
      message: 'Page must be at least 1',
    });
  }
  if (limit < 1 || limit > 100) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100',
    });
  }

  next();
};

export default {
  validateCreateCommunity,
  validateCreateEvent,
  validateCreateRating,
  validateId,
  validatePagination,
};