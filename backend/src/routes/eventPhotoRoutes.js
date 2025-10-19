import express from 'express';
import * as eventPhotoController from '../controllers/eventPhotoController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validator.js';
import { uploadSingle, handleUploadError, validateFileExists } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// ✅ FIXED: Upload photo to event with multer middleware
router.post(
  '/:eventId/upload',
  verifyToken,
  validateId('eventId'),
  uploadSingle, // ✅ Multer middleware to handle file upload
  handleUploadError, // ✅ Handle upload errors
  validateFileExists, // ✅ Validate file was uploaded
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

// ✅ SPLIT PHOTO ROUTES INTO SEPARATE PATHS

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