import express from 'express';
import * as eventController from '../controllers/eventController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateId, validatePagination, validateCreateEvent } from '../middleware/validator.js';
import { validateLocationData } from '../middleware/locationValidator.js';
import { isModeratorOrAdmin } from '../middleware/roleValidation.js';

const router = express.Router();

// Create event - ✅ ONLY MODERATORS (approved community managers)
router.post(
  '/',
  verifyToken,
  isModeratorOrAdmin,
  validateCreateEvent,
  validateLocationData,
  eventController.createEvent
);

// Get all events (public)
router.get('/', validatePagination, eventController.getEvents);

// Get event by ID (public)
router.get('/:id', validateId('id'), eventController.getEventById);

// Join event (user)
router.post('/:id/join', verifyToken, validateId('id'), eventController.joinEvent);

// Leave event (user)
router.post('/:id/leave', verifyToken, validateId('id'), eventController.leaveEvent);

// Get event participants (creator/admin only)
router.get(
  '/:id/participants',
  verifyToken,
  validateId('id'),
  validatePagination,
  eventController.getEventParticipants
);

// Update event (owner/admin only)
router.put(
  '/:id',
  verifyToken,
  validateId('id'),
  validateLocationData,
  eventController.updateEvent
);

// Delete event (owner/admin only)
router.delete('/:id', verifyToken, validateId('id'), eventController.deleteEvent);

export default router;