import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import * as eventController from '../controllers/eventController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateId, validatePagination, validateCreateEvent } from '../middleware/validator.js';
import { validateLocationData } from '../middleware/locationValidator.js';
import { isModeratorOrAdmin } from '../middleware/roleValidation.js';

const router = express.Router();

// ✅ STEP 1: Configure Multer for file uploads
const uploadsDir = path.join(process.cwd(), 'uploads');

// Create uploads directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `event-${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP images allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

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
 * ✅ CRITICAL: /my-events MUST come BEFORE /:id routes
 * Otherwise requests to /my-events will be interpreted as /:id with id="my-events"
 */
router.get(
  '/my-events',
  verifyToken,
  validatePagination,
  eventController.getMyCreatedEvents
);

/**
 * ✅ FIXED: Create event with FormData (image upload)
 * POST /events
 * 
 * FormData fields:
 * - title (string)
 * - description (string)
 * - community (ObjectId)
 * - startDate (ISO date)
 * - endDate (ISO date)
 * - startTime (optional, HH:mm format)
 * - endTime (optional, HH:mm format)
 * - location (JSON string)
 * - category (string)
 * - maxParticipants (number)
 * - image (optional, file)
 */
router.post(
  '/',
  verifyToken,
  isModeratorOrAdmin,
  upload.single('image'), // ✅ Handle image upload
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
 * 
 * Can include image in FormData
 */
router.put(
  '/:id',
  verifyToken,
  validateId('id'),
  upload.single('image'), // ✅ Handle image upload in updates too
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