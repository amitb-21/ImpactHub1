import express from 'express';
import * as eventController from '../controllers/eventController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateId, validatePagination, validateCreateEvent } from '../middleware/validator.js';
import { validateLocationData } from '../middleware/locationValidator.js';
import { isModeratorOrAdmin } from '../middleware/roleValidation.js';

const router = express.Router();

// =====================
// PUBLIC ROUTES (No auth required)
// =====================

/**
 * Get all events (public)
 * GET /events?page=1&limit=10&category=Cleanup&status=Upcoming&sortBy=upcoming
 */
router.get('/', validatePagination, eventController.getEvents);

/**
 * Get event by ID (public)
 * GET /events/:id
 */
router.get('/:id', validateId('id'), eventController.getEventById);

// =====================
// PROTECTED ROUTES (Auth required)
// =====================

/**
 * ✅ NEW: Get events created by current user (community manager)
 * GET /events/my-events?page=1&limit=10&status=Upcoming
 * 
 * IMPORTANT: This MUST come BEFORE the /:id route to avoid shadowing!
 * Otherwise requests to /my-events will be interpreted as /:id with id="my-events"
 */
router.get(
  '/my-events',
  verifyToken,
  validatePagination,
  eventController.getMyCreatedEvents
);

/**
 * Create event - ONLY MODERATORS (community managers)
 * POST /events
 * Body: { title, description, community, startDate, endDate, location, category, image, maxParticipants }
 */
router.post(
  '/',
  verifyToken,
  isModeratorOrAdmin,
  validateCreateEvent,
  validateLocationData,
  eventController.createEvent
);

/**
 * Join event (user)
 * POST /events/:id/join
 */
router.post(
  '/:id/join',
  verifyToken,
  validateId('id'),
  eventController.joinEvent
);

/**
 * Leave event (user)
 * POST /events/:id/leave
 */
router.post(
  '/:id/leave',
  verifyToken,
  validateId('id'),
  eventController.leaveEvent
);

/**
 * Get event participants (creator/admin only)
 * GET /events/:id/participants?page=1&limit=10
 */
router.get(
  '/:id/participants',
  verifyToken,
  validateId('id'),
  validatePagination,
  eventController.getEventParticipants
);

/**
 * Update event (owner/admin only)
 * PUT /events/:id
 * Body: { title, description, startDate, endDate, location, category, image, status, maxParticipants }
 */
router.put(
  '/:id',
  verifyToken,
  validateId('id'),
  validateLocationData,
  eventController.updateEvent
);

/**
 * Delete event (owner/admin only)
 * DELETE /events/:id
 */
router.delete(
  '/:id',
  verifyToken,
  validateId('id'),
  eventController.deleteEvent
);

export default router;