// backend/src/routes/verificationRoutes.js
import express from 'express';
import * as verificationController from '../controllers/verificationController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validator.js';

const router = express.Router();

// =====================
// PUBLIC ENDPOINTS
// =====================

// Submit verification request (community creator)
router.post(
  '/:communityId/submit',
  verifyToken,
  validateId('communityId'),
  verificationController.submitVerificationRequest
);

// Get verification status (anyone can check)
router.get(
  '/:communityId/status',
  validateId('communityId'),
  verificationController.getVerificationStatus
);

// =====================
// ADMIN ONLY ENDPOINTS
// =====================

// Get pending verifications (admin only)
router.get(
  '/admin/pending',
  verifyToken,
  isAdmin,
  validatePagination,
  verificationController.getPendingVerifications
);

// Approve community (admin only)
router.post(
  '/:verificationId/approve',
  verifyToken,
  isAdmin,
  validateId('verificationId'),
  verificationController.approveCommunity
);

// Reject community (admin only)
router.post(
  '/:verificationId/reject',
  verifyToken,
  isAdmin,
  validateId('verificationId'),
  verificationController.rejectCommunity
);

// Get verification history (admin only)
router.get(
  '/admin/history',
  verifyToken,
  isAdmin,
  validatePagination,
  verificationController.getVerificationHistory
);

export default router;