import express from 'express';
import * as eventController from '../controllers/eventController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateId, validatePagination, validateCreateEvent } from '../middleware/validator.js';
import { validateLocationData } from '../middleware/locationValidator.js';

const router = express.Router();

// Create event with location validation
router.post(
  '/',
  verifyToken,
  validateCreateEvent,
  validateLocationData, // ✅ Validate location data
  eventController.createEvent
);

// Get all events
router.get('/', validatePagination, eventController.getEvents);

// Get event by ID
router.get('/:id', validateId('id'), eventController.getEventById);

// Join event
router.post('/:id/join', verifyToken, validateId('id'), eventController.joinEvent);

// Leave event
router.post('/:id/leave', verifyToken, validateId('id'), eventController.leaveEvent);

// Get event participants
router.get(
  '/:id/participants',
  validateId('id'),
  validatePagination,
  eventController.getEventParticipants
);

// Update event with location validation
router.put(
  '/:id',
  verifyToken,
  validateId('id'),
  validateLocationData, // ✅ Validate location data on updates
  eventController.updateEvent
);

// Delete event
router.delete('/:id', verifyToken, validateId('id'), eventController.deleteEvent);

export default router;