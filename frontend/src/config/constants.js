export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5050';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5050';

// User Roles (matches backend)
export const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin'
};

// Event Status (matches backend)
export const EVENT_STATUS = {
  UPCOMING: 'Upcoming',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled'
};

// Event Categories (matches backend)
export const EVENT_CATEGORIES = [
  'Cleanup',
  'Volunteering',
  'Education',
  'Fundraising',
  'Other'
];

// Community Categories (matches backend)
export const COMMUNITY_CATEGORIES = [
  'Environment',
  'Education',
  'Health',
  'Social',
  'Other'
];

// Verification Status (matches backend)
export const VERIFICATION_STATUS = {
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
};

// Participation Status (matches backend)
export const PARTICIPATION_STATUS = {
  REGISTERED: 'Registered',
  ATTENDED: 'Attended',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  REJECTED: 'Rejected'
};

// Photo Types (matches backend)
export const PHOTO_TYPES = {
  EVENT_PREVIEW: 'event_preview',
  DURING_EVENT: 'during_event',
  AFTER_EVENT: 'after_event'
};

// Points Config (matches backend POINTS_CONFIG)
export const POINTS_CONFIG = {
  EVENT_CREATED: 100,
  EVENT_PARTICIPATED: 50,
  COMMUNITY_CREATED: 150,
  COMMUNITY_JOINED: 10,
  BADGE_EARNED: 200,
  HOURS_VOLUNTEERED: 10
};

// Resource Categories (matches backend)
export const RESOURCE_CATEGORIES = [
  'Event Planning',
  'Sustainability Tips',
  'Recycling Guides',
  'Energy Conservation',
  'Community Building',
  'Environmental Education',
  'DIY Projects',
  'Local Resources',
  'Templates',
  'Other'
];

// Resource Types (matches backend)
export const RESOURCE_TYPES = ['article', 'video', 'pdf', 'template', 'infographic'];

// Resource Difficulty (matches backend)
export const RESOURCE_DIFFICULTY = ['Beginner', 'Intermediate', 'Advanced'];

// Activity Types (matches backend)
export const ACTIVITY_TYPES = [
  'event_joined',
  'event_left',
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
  'resource_created'
];

// Volunteer Ranks (matches backend pointsService)
export const VOLUNTEER_RANKS = {
  BEGINNER: { min: 0, max: 499, name: 'Beginner', color: '#10b981', icon: '🟢' },
  CONTRIBUTOR: { min: 500, max: 1499, name: 'Contributor', color: '#3b82f6', icon: '🔵' },
  LEADER: { min: 1500, max: 2999, name: 'Leader', color: '#8b5cf6', icon: '🟣' },
  CHAMPION: { min: 3000, max: 4999, name: 'Champion', color: '#f59e0b', icon: '🟡' },
  LEGEND: { min: 5000, max: Infinity, name: 'Legend', color: '#ef4444', icon: '🔴' }
};

// Community Tiers (matches backend pointsService)
export const COMMUNITY_TIERS = {
  BRONZE: { min: 0, max: 999, name: 'Bronze', color: '#cd7f32' },
  SILVER: { min: 1000, max: 2499, name: 'Silver', color: '#c0c0c0' },
  GOLD: { min: 2500, max: 4999, name: 'Gold', color: '#ffd700' },
  PLATINUM: { min: 5000, max: 9999, name: 'Platinum', color: '#e5e4e2' },
  DIAMOND: { min: 10000, max: Infinity, name: 'Diamond', color: '#b9f2ff' }
};

// HTTP Error Messages
export const HTTP_ERRORS = {
  400: 'Bad Request',
  401: 'Unauthorized - Please login',
  403: 'Forbidden - Access denied',
  404: 'Not Found',
  409: 'Conflict - Already exists',
  500: 'Server Error'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Logged in successfully',
  LOGOUT: 'Logged out successfully',
  REGISTERED: 'Registered successfully',
  EVENT_CREATED: 'Event created successfully',
  EVENT_JOINED: 'Joined event successfully',
  EVENT_LEFT: 'Left event successfully',
  COMMUNITY_CREATED: 'Community created successfully',
  COMMUNITY_JOINED: 'Joined community successfully',
  COMMUNITY_LEFT: 'Left community successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  RATING_SUBMITTED: 'Rating submitted successfully',
  PHOTO_UPLOADED: 'Photo uploaded successfully'
};

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED: 'Unauthorized access',
  NOT_FOUND: 'Resource not found',
  ALREADY_EXISTS: 'Resource already exists',
  VALIDATION_ERROR: 'Validation error',
  SERVER_ERROR: 'Internal server error',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UPLOAD_ERROR: 'Failed to upload file'
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};