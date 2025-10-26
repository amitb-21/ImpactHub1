import express from 'express';
import rateLimit from 'express-rate-limit';
import * as eventPhotoController from '../controllers/eventPhotoController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validator.js';
import { uploadSingle, handleUploadError, validateFileExists } from '../middleware/uploadMiddleware.js';
import { isModeratorOrAdmin } from '../middleware/roleValidation.js';

const router = express.Router();

// Upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many uploads, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload event photo - ✅ ONLY MODERATORS
router.post(
  '/:eventId/upload',
  verifyToken,
  isModeratorOrAdmin,
  uploadLimiter,
  validateId('eventId'),
  uploadSingle,
  handleUploadError,
  validateFileExists,
  eventPhotoController.uploadEventPhoto
);

// Get photos by type
router.get(
  '/:eventId/type/:photoType',
  validateId('eventId'),
  eventPhotoController.getPhotosByType
);

// Get community photo gallery
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

// Like/Unlike photo
router.post(
  '/photo/:photoId/like',
  verifyToken,
  validateId('photoId'),
  eventPhotoController.likePhoto
);

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

// Get all photos for an event
router.get(
  '/:eventId',
  validateId('eventId'),
  validatePagination,
  eventPhotoController.getEventPhotos
);

export default router;
