export const POINTS_CONFIG = {
  EVENT_CREATED: 100,
  EVENT_PARTICIPATED: 50,
  COMMUNITY_CREATED: 150,
  COMMUNITY_JOINED: 10,
  BADGE_EARNED: 200,
  HOURS_VOLUNTEERED: 10, // Per hour
};

export const LEVEL_THRESHOLDS = {
  1: 0,
  2: 500,
  3: 1500,
  4: 3000,
  5: 5000,
  6: 7500,
  7: 10000,
  8: 15000,
  9: 20000,
  10: 25000,
};

export const EVENT_CATEGORIES = [
  'Cleanup',
  'Volunteering',
  'Education',
  'Fundraising',
  'Other',
];

export const COMMUNITY_CATEGORIES = [
  'Environment',
  'Education',
  'Health',
  'Social',
  'Other',
];

export const ACTIVITY_TYPES = [
  'event_joined',
  'event_created',
  'event_attended',
  'event_saved',
  'community_joined',
  'community_created',
  'badge_earned',
  'points_earned',
  'rating_created',
  'verification_requested',
  'community_verification_verified',
  'community_verification_rejected',
];

export const ERROR_MESSAGES = {
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED: 'Unauthorized access',
  NOT_FOUND: 'Resource not found',
  ALREADY_EXISTS: 'Resource already exists',
  VALIDATION_ERROR: 'Validation error',
  SERVER_ERROR: 'Internal server error',
};

export const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  FETCHED: 'Resource fetched successfully',
};

export default {
  POINTS_CONFIG,
  LEVEL_THRESHOLDS,
  EVENT_CATEGORIES,
  COMMUNITY_CATEGORIES,
  ACTIVITY_TYPES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};