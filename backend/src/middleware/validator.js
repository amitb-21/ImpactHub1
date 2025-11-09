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

// ✅ FIXED: Event creation validator that works with FormData (JSON string location)
export const validateCreateEvent = (req, res, next) => {
  try {
    console.log('🔍 Validating event creation');
    console.log('Received fields:', Object.keys(req.body));

    const {
      title,
      description,
      startDate,
      endDate,
      category,
      community,
      location: locationString,
    } = req.body;

    const errors = [];

    // ✅ Validate title
    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      errors.push('Event title must be at least 3 characters');
    }
    if (title && title.length > 200) {
      errors.push('Event title must not exceed 200 characters');
    }

    // ✅ Validate description
    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      errors.push('Event description must be at least 10 characters');
    }
    if (description && description.length > 5000) {
      errors.push('Event description must not exceed 5000 characters');
    }

    // ✅ Validate dates
    if (!startDate) {
      errors.push('Start date is required');
    } else {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        errors.push('Invalid start date format');
      }
    }

    if (!endDate) {
      errors.push('End date is required');
    } else {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        errors.push('Invalid end date format');
      }
    }

    // ✅ Validate date range
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start >= end) {
        errors.push('End date must be after start date');
      }
    }

    // ✅ Validate category
    const validCategories = ['Cleanup', 'Volunteering', 'Education', 'Fundraising', 'Other'];
    if (!category || !validCategories.includes(category)) {
      errors.push(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
    }

    // ✅ Validate community (required)
    if (!community) {
      errors.push('Community is required');
    }

    // ✅ Validate location (JSON string from FormData) - RELAXED VALIDATION
    if (!locationString) {
      errors.push('Location is required');
    } else {
      try {
        const location = JSON.parse(locationString);
        console.log('📍 Parsed location:', location);

        // Location must have at least a city
        if (!location.city || typeof location.city !== 'string' || location.city.trim().length < 1) {
          errors.push('Location city is required');
        }

        // ✅ Coordinates validation - allow 0,0 during creation (user can set it later)
        // Only validate if coordinates are provided and non-zero
        if (location.latitude && location.longitude) {
          const lat = parseFloat(location.latitude);
          const lng = parseFloat(location.longitude);

          if (isNaN(lat) || isNaN(lng)) {
            errors.push('Coordinates must be valid numbers');
          } else if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
            errors.push('Invalid coordinate ranges');
          }
        }
      } catch (e) {
        console.error('❌ Failed to parse location JSON:', e.message);
        errors.push('Location must be valid JSON');
      }
    }

    if (errors.length > 0) {
      console.log('❌ Validation errors:', errors);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
        receivedFields: {
          title: !!title,
          description: !!description,
          startDate: !!startDate,
          endDate: !!endDate,
          category: !!category,
          community: !!community,
          location: !!locationString,
        },
      });
    }

    console.log('✅ Event validation passed');
    next();
  } catch (error) {
    console.error('❌ Validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation error',
      error: error.message,
    });
  }
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