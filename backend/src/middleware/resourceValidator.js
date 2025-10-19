import { ERROR_MESSAGES } from '../utils/constants.js';

const VALID_CATEGORIES = [
  'Event Planning',
  'Sustainability Tips',
  'Recycling Guides',
  'Energy Conservation',
  'Community Building',
  'Environmental Education',
  'DIY Projects',
  'Local Resources',
  'Templates',
  'Other',
];

const VALID_TYPES = ['article', 'video', 'pdf', 'template', 'infographic'];

const VALID_DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export const validateCreateResource = (req, res, next) => {
  const { title, description, content, category, type, estimatedReadTime } = req.body;

  const errors = [];

  // Title validation
  if (!title || title.trim().length < 5) {
    errors.push('Title must be at least 5 characters');
  }
  if (title && title.length > 200) {
    errors.push('Title must not exceed 200 characters');
  }

  // Description validation
  if (!description || description.trim().length < 20) {
    errors.push('Description must be at least 20 characters');
  }
  if (description && description.length > 500) {
    errors.push('Description must not exceed 500 characters');
  }

  // Content validation
  if (!content || content.trim().length < 50) {
    errors.push('Content must be at least 50 characters');
  }

  // Category validation
  if (!category) {
    errors.push('Category is required');
  } else if (!VALID_CATEGORIES.includes(category)) {
    errors.push(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  // Type validation
  if (type && !VALID_TYPES.includes(type)) {
    errors.push(`Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`);
  }

  // Estimated read time validation
  if (estimatedReadTime && (estimatedReadTime < 1 || estimatedReadTime > 120)) {
    errors.push('Estimated read time must be between 1 and 120 minutes');
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

export const validateUpdateResource = (req, res, next) => {
  const { title, description, content, category, type, difficulty, estimatedReadTime } = req.body;

  const errors = [];

  // Title validation (if provided)
  if (title !== undefined) {
    if (title.trim().length < 5) {
      errors.push('Title must be at least 5 characters');
    }
    if (title.length > 200) {
      errors.push('Title must not exceed 200 characters');
    }
  }

  // Description validation (if provided)
  if (description !== undefined) {
    if (description.trim().length < 20) {
      errors.push('Description must be at least 20 characters');
    }
    if (description.length > 500) {
      errors.push('Description must not exceed 500 characters');
    }
  }

  // Content validation (if provided)
  if (content !== undefined && content.trim().length < 50) {
    errors.push('Content must be at least 50 characters');
  }

  // Category validation (if provided)
  if (category && !VALID_CATEGORIES.includes(category)) {
    errors.push(`Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  // Type validation (if provided)
  if (type && !VALID_TYPES.includes(type)) {
    errors.push(`Invalid type. Must be one of: ${VALID_TYPES.join(', ')}`);
  }

  // Difficulty validation (if provided)
  if (difficulty && !VALID_DIFFICULTIES.includes(difficulty)) {
    errors.push(`Invalid difficulty. Must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
  }

  // Estimated read time validation (if provided)
  if (estimatedReadTime && (estimatedReadTime < 1 || estimatedReadTime > 120)) {
    errors.push('Estimated read time must be between 1 and 120 minutes');
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

export default {
  validateCreateResource,
  validateUpdateResource,
};