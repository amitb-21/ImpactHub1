import express from 'express';
import * as verificationController from '../controllers/verificationController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validator.js';

const router = express.Router();

// =====================
// PUBLIC ENDPOINTS (No auth required)
// =====================

// Get verification status (anyone can check)
router.get(
  '/:communityId/status',
  validateId('communityId'),
  verificationController.getVerificationStatus
);

// Submit verification request (community creator)
router.post(
  '/:communityId/submit',
  verifyToken,
  validateId('communityId'),
  verificationController.submitVerificationRequest
);

// =====================
// ADMIN ONLY ENDPOINTS (Must be grouped together)
// =====================

// ✅ FIX: More specific routes BEFORE generic patterns

// Get verification history
router.get(
  '/admin/history',
  verifyToken,
  isAdmin,
  validatePagination,
  verificationController.getVerificationHistory
);

// Get pending verifications
router.get(
  '/admin/pending',
  verifyToken,
  isAdmin,
  validatePagination,
  verificationController.getPendingVerifications
);

// Approve community
router.post(
  '/:verificationId/approve',
  verifyToken,
  isAdmin,
  validateId('verificationId'),
  verificationController.approveCommunity
);

// Reject community
router.post(
  '/:verificationId/reject',
  verifyToken,
  isAdmin,
  validateId('verificationId'),
  verificationController.rejectCommunity
);

export default router;