import express from 'express';
import * as participationController from '../controllers/participationController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validator.js';

const router = express.Router();

// IMPORTANT: Order matters - more specific routes first!

// =====================
// WISHLIST ROUTES
// =====================

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

// =====================
// ATTENDANCE VERIFICATION ROUTES
// =====================

// Mark participant as attended
router.post(
  '/:participationId/mark-attended',
  verifyToken,
  validateId('participationId'),
  participationController.markAttendance
);

// Reject participant
router.post(
  '/:participationId/reject',
  verifyToken,
  validateId('participationId'),
  participationController.rejectParticipant
);

// =====================
// EVENT PARTICIPANTS ROUTES
// =====================

// Get pending/unverified participants for an event
router.get(
  '/event/:eventId/pending',
  validateId('eventId'),
  validatePagination,
  participationController.getPendingParticipants
);

// Get verified/attended participants for an event
router.get(
  '/event/:eventId/verified',
  validateId('eventId'),
  validatePagination,
  participationController.getVerifiedParticipants
);

// =====================
// GENERIC ROUTE (MUST BE LAST)
// =====================

// Get participation details (generic - MUST be after specific routes)
router.get(
  '/:participationId',
  validateId('participationId'),
  participationController.getParticipationDetails
);

export default router;