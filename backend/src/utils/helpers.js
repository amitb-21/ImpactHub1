import { LEVEL_THRESHOLDS, POINTS_CONFIG } from './constants.js';

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

export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const generatePaginationMeta = (total, page, limit) => {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const sanitizeObject = (obj, fieldsToRemove = []) => {
  const sanitized = { ...obj };
  fieldsToRemove.forEach((field) => {
    delete sanitized[field];
  });
  return sanitized;
};

export const parseQueryParams = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.max(1, Math.min(parseInt(query.limit) || 10, 100));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export default {
  calculateLevel,
  getNextLevelThreshold,
  getProgressToNextLevel,
  calculatePointsFromHours,
  isValidEmail,
  formatDate,
  generatePaginationMeta,
  sanitizeObject,
  parseQueryParams,
};