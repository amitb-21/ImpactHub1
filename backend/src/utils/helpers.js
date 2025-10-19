import { LEVEL_THRESHOLDS, POINTS_CONFIG } from './constants.js';
import { logger } from './logger.js';

// =====================
// LEVEL & POINTS HELPERS
// =====================

export const calculateLevel = (points) => {
  for (let level = 10; level >= 1; level--) {
    if (points >= LEVEL_THRESHOLDS[level]) {
      return level;
    }
  }
  return 1;
};

export const getNextLevelThreshold = (currentLevel) => {
  const nextLevel = currentLevel + 1;
  return LEVEL_THRESHOLDS[nextLevel] || LEVEL_THRESHOLDS[10];
};

export const getProgressToNextLevel = (points, currentLevel) => {
  const currentThreshold = LEVEL_THRESHOLDS[currentLevel];
  const nextThreshold = getNextLevelThreshold(currentLevel);
  const progress = points - currentThreshold;
  const required = nextThreshold - currentThreshold;
  return {
    progress,
    required,
    percentage: Math.round((progress / required) * 100),
  };
};

export const calculatePointsFromHours = (hours) => {
  return hours * POINTS_CONFIG.HOURS_VOLUNTEERED;
};

// =====================
// RATING HELPERS
// =====================

export const calculateAverageRating = (ratings) => {
  if (!ratings || ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  return parseFloat((sum / ratings.length).toFixed(2));
};

// =====================
// VERIFICATION HELPERS
// =====================

export const isVerifiedCommunity = (community) => {
  return community?.verificationStatus === 'verified';
};

export const isVerificationPending = (community) => {
  return community?.verificationStatus === 'pending';
};

// =====================
// VALIDATION HELPERS
// =====================

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidNumberRange = (value, min, max) => {
  return typeof value === 'number' && value >= min && value <= max;
};

export const isValidNonNegativeNumber = (value) => {
  return typeof value === 'number' && value >= 0;
};

export const validateHoursContributed = (hours) => {
  if (hours === undefined || hours === null) return null; // Optional field
  if (!isValidNonNegativeNumber(hours)) {
    return 'Hours contributed must be a non-negative number';
  }
  return null;
};

export const validatePoints = (points) => {
  if (!Number.isInteger(points) || points <= 0) {
    return 'Points must be a positive integer';
  }
  return null;
};

export const validateUserId = (userId) => {
  if (!userId) {
    return 'User ID is required';
  }
  return null;
};

export const validateCommunityId = (communityId) => {
  if (!communityId) {
    return 'Community ID is required';
  }
  return null;
};

export const validateEventId = (eventId) => {
  if (!eventId) {
    return 'Event ID is required';
  }
  return null;
};

// =====================
// FORMATTING HELPERS
// =====================

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

// =====================
// PAGINATION HELPERS
// =====================

export const parseQueryParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, Math.min(parseInt(query.limit) || 10, 100));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const generatePaginationMeta = (total, page, limit) => {
  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
  };
};

// =====================
// POPULATION CONSTANTS
// =====================

export const POPULATE_FIELDS = {
  CREATOR: { path: 'createdBy', select: 'name profileImage email' },
  CREATOR_MINIMAL: { path: 'createdBy', select: 'name profileImage' },
  COMMUNITY: { path: 'community', select: 'name image verificationStatus' },
  COMMUNITY_MINIMAL: { path: 'community', select: 'name' },
  USER_FULL: { path: 'user', select: 'name profileImage email' },
  USER_MINIMAL: { path: 'user', select: 'name profileImage' },
  VERIFIER: { path: 'verifiedBy', select: 'name email' },
  MEMBERS: { path: 'members', select: 'name profileImage' },
  PARTICIPANTS: { path: 'participants', select: 'name profileImage' },
};

// Helper to apply multiple populations
export const applyPopulations = (query, populationKeys = []) => {
  populationKeys.forEach((key) => {
    if (POPULATE_FIELDS[key]) {
      query.populate(POPULATE_FIELDS[key]);
    }
  });
  return query;
};

// =====================
// RESPONSE HELPERS
// =====================

export const sendSuccessResponse = (res, statusCode, message, data = null) => {
  res.status(statusCode).json({
    success: true,
    message,
    ...(data && { data }),
  });
};

export const sendErrorResponse = (res, statusCode, message, errors = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

// =====================
// OBJECT UTILITIES
// =====================

export const sanitizeObject = (obj, fieldsToRemove = []) => {
  const sanitized = { ...obj };
  fieldsToRemove.forEach((field) => {
    delete sanitized[field];
  });
  return sanitized;
};

export const filterObject = (obj, allowedFields = []) => {
  const filtered = {};
  allowedFields.forEach((field) => {
    if (field in obj) {
      filtered[field] = obj[field];
    }
  });
  return filtered;
};

// =====================
// SAFETY WRAPPERS
// =====================

export const safeParseJSON = (jsonString) => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    logger.error('Error parsing JSON', error);
    return null;
  }
};

export const safeAsyncExecute = async (asyncFn, errorMessage) => {
  try {
    return await asyncFn();
  } catch (error) {
    logger.error(errorMessage, error);
    throw error;
  }
};

export default {
  // Level & Points
  calculateLevel,
  getNextLevelThreshold,
  getProgressToNextLevel,
  calculatePointsFromHours,
  // Rating
  calculateAverageRating,
  // Verification
  isVerifiedCommunity,
  isVerificationPending,
  // Validation
  isValidEmail,
  isValidNumberRange,
  isValidNonNegativeNumber,
  validateHoursContributed,
  validatePoints,
  validateUserId,
  validateCommunityId,
  validateEventId,
  // Formatting
  formatDate,
  formatDateTime,
  // Pagination
  parseQueryParams,
  generatePaginationMeta,
  // Populations
  POPULATE_FIELDS,
  applyPopulations,
  // Response
  sendSuccessResponse,
  sendErrorResponse,
  // Objects
  sanitizeObject,
  filterObject,
  // Safety
  safeParseJSON,
  safeAsyncExecute,
};