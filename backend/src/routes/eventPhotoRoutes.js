import express from 'express';
import rateLimit from 'express-rate-limit'; // ✅ ADD
import * as eventPhotoController from '../controllers/eventPhotoController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validator.js';
import { uploadSingle, handleUploadError, validateFileExists } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// ✅ ADD THIS - Upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 uploads per 15 minutes per IP
  message: 'Too many uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ ADD uploadLimiter to this route
router.post(
  '/:eventId/upload',
  verifyToken,
  uploadLimiter, // ✅ ADD THIS
  validateId('eventId'),
  uploadSingle,
  handleUploadError,
  validateFileExists,
  eventPhotoController.uploadEventPhoto
);

// Get photos by type (must be BEFORE generic /:eventId route)
router.get(
  '/:eventId/type/:photoType',
  validateId('eventId'),
  eventPhotoController.getPhotosByType
);

// Get community photo gallery (specific path)
router.get(
  '/community/:communityId/gallery',
  validateId('communityId'),
  validatePagination,
  eventPhotoController.getCommunityPhotoGallery
);

// Update photo description
router.put(
  '/photo/:photoId/description',
  verifyToken,
  validateId('photoId'),
  eventPhotoController.updatePhotoDescription
);

// Like photo
router.post(
  '/photo/:photoId/like',
  verifyToken,
  validateId('photoId'),
  eventPhotoController.likePhoto
);

// Unlike photo
router.post(
  '/photo/:photoId/unlike',
  verifyToken,
  validateId('photoId'),
  eventPhotoController.unlikePhoto
);

// Delete photo
router.delete(
  '/photo/:photoId',
  verifyToken,
  validateId('photoId'),
  eventPhotoController.deleteEventPhoto
);

// Get all photos for an event (generic - LAST)
router.get(
  '/:eventId',
  validateId('eventId'),
  validatePagination,
  eventPhotoController.getEventPhotos
);

export default router;