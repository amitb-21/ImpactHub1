import express from 'express';
import * as participationController from '../controllers/participationController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validator.js';
import { isModeratorOrAdmin } from '../middleware/roleValidation.js';

const router = express.Router();

// Save event to wishlist
router.post(
  '/:eventId/wishlist/save',
  verifyToken,
  validateId('eventId'),
  participationController.saveEventToWishlist
);

// Remove event from wishlist
router.delete(
  '/:eventId/wishlist/remove',
  verifyToken,
  validateId('eventId'),
  participationController.removeEventFromWishlist
);

// Get user's wishlist
router.get(
  '/user/:userId/wishlist',
  validateId('userId'),
  validatePagination,
  participationController.getUserWishlist
);

// Mark participant as attended - ✅ ONLY MODERATORS
router.post(
  '/:participationId/mark-attended',
  verifyToken,
  isModeratorOrAdmin,
  validateId('participationId'),
  participationController.markAttendance
);

// Reject participant - ✅ ONLY MODERATORS
router.post(
  '/:participationId/reject',
  verifyToken,
  isModeratorOrAdmin,
  validateId('participationId'),
  participationController.rejectParticipant
);

// Get pending participants
router.get(
  '/event/:eventId/pending',
  verifyToken,
  validateId('eventId'),
  validatePagination,
  participationController.getPendingParticipants
);

// Get verified participants
router.get(
  '/event/:eventId/verified',
  verifyToken,
  validateId('eventId'),
  validatePagination,
  participationController.getVerifiedParticipants
);

// Get participation details
router.get(
  '/:participationId',
  validateId('participationId'),
  participationController.getParticipationDetails
);

export default router;
