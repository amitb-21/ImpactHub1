import express from 'express';
import * as eventPhotoController from '../controllers/eventPhotoController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validator.js';

const router = express.Router();

// Upload photo to event
router.post(
  '/:eventId/upload',
  verifyToken,
  validateId('eventId'),
  eventPhotoController.uploadEventPhoto
);

// Get all photos for an event
router.get(
  '/:eventId',
  validateId('eventId'),
  validatePagination,
  eventPhotoController.getEventPhotos
);

// Get photos by type (event_preview, during_event, after_event)
router.get(
  '/:eventId/type/:photoType',
  validateId('eventId'),
  eventPhotoController.getPhotosByType
);

// Update photo description
router.put(
  '/photo/:photoId',
  verifyToken,
  validateId('photoId'),
  eventPhotoController.updatePhotoDescription
);

// Delete photo
router.delete(
  '/photo/:photoId',
  verifyToken,
  validateId('photoId'),
  eventPhotoController.deleteEventPhoto
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

// Get community photo gallery
router.get(
  '/community/:communityId/gallery',
  validateId('communityId'),
  validatePagination,
  eventPhotoController.getCommunityPhotoGallery
);

export default router;