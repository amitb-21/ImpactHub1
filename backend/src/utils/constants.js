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
  'event_photo_uploaded',
  'community_joined',
  'community_created',
  'community_deactivated',
  'badge_earned',
  'points_earned',
  'rating_created',
  'verification_requested',
  'community_verification_verified',
  'community_verification_rejected',
  'user_deactivated',
];

export const COMMUNITY_VERIFICATION_STATUS = {
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

export const ORGANIZATION_DETAILS_RULES = {
  MIN_REGISTRATION_NUMBER_LENGTH: 1,
  MIN_FOUNDED_YEAR: 1900,
  MIN_MEMBER_COUNT: 1,
  MAX_REJECTION_REASON_LENGTH: 500,
  MAX_NOTES_LENGTH: 1000,
};

export const VERIFICATION_DOCUMENT_TYPES = [
  'registration_certificate',
  'tax_id',
  'mission_statement',
  'other',
];

export const ERROR_MESSAGES = {
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED: 'Unauthorized access',
  NOT_FOUND: 'Resource not found',
  ALREADY_EXISTS: 'Resource already exists',
  VALIDATION_ERROR: 'Validation error',
  SERVER_ERROR: 'Internal server error',
  VERIFICATION_PENDING: 'Verification request already pending for this community',
  COMMUNITY_NOT_VERIFIED: 'Can only join verified communities',
  COMMUNITY_NOT_VERIFIED_FOR_EVENTS: 'Cannot create events for unverified communities',
  REJECTION_REASON_REQUIRED: 'Rejection reason is required when rejecting',
  INVALID_VERIFICATION_STATUS: 'Invalid verification status',
  INVALID_HOURS_CONTRIBUTED: 'Hours contributed must be a non-negative number',
  INVALID_POINTS: 'Points must be a positive number',
};

export const SUCCESS_MESSAGES = {
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  FETCHED: 'Resource fetched successfully',
  VERIFICATION_SUBMITTED: 'Verification request submitted successfully',
  VERIFICATION_APPROVED: 'Community verified successfully! Creator awarded points.',
  VERIFICATION_REJECTED: 'Community verification rejected',
  COMMUNITY_CREATED_PENDING: 'Community created successfully. Awaiting admin verification.',
};

export const VOLUNTEER_POINTS_THRESHOLDS = {
  BEGINNER: 0,
  CONTRIBUTOR: 500,
  LEADER: 1500,
  CHAMPION: 3000,
  LEGEND: 5000,
};

export const COMMUNITY_POINTS_THRESHOLDS = {
  BRONZE: 0,
  SILVER: 1000,
  GOLD: 2500,
  PLATINUM: 5000,
  DIAMOND: 10000,
};

export const POINTS_MULTIPLIERS = {
  HOUR_BONUS: 1.5,
  GROUP_BONUS: 1.2,
  STREAK_BONUS: 1.1,
};

export default {
  POINTS_CONFIG,
  LEVEL_THRESHOLDS,
  EVENT_CATEGORIES,
  COMMUNITY_CATEGORIES,
  ACTIVITY_TYPES,
  COMMUNITY_VERIFICATION_STATUS,
  ORGANIZATION_DETAILS_RULES,
  VERIFICATION_DOCUMENT_TYPES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VOLUNTEER_POINTS_THRESHOLDS,
  COMMUNITY_POINTS_THRESHOLDS,
  POINTS_MULTIPLIERS,
};