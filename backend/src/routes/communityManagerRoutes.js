import express from 'express';
import * as communityManagerController from '../controllers/communityManagerApplicationController.js';
import { verifyToken } from '../middleware/auth.js';
import { isAdmin } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validator.js';

const router = express.Router();

// =====================
// USER ROUTES (Authenticated)
// =====================

// Apply as community manager
router.post(
  '/apply',
  verifyToken,
  communityManagerController.applyAsCommunityManager
);

// Get my application status
router.get(
  '/my-application',
  verifyToken,
  communityManagerController.getMyApplication
);

// Get my application history
router.get(
  '/my-history',
  verifyToken,
  validatePagination,
  communityManagerController.getApplicationHistory
);

// =====================
// ADMIN ROUTES (Admin only)
// =====================

// Get all pending applications
router.get(
  '/admin/pending',
  verifyToken,
  isAdmin,
  validatePagination,
  communityManagerController.getPendingApplications
);

// View single application
router.get(
  '/admin/:applicationId',
  verifyToken,
  isAdmin,
  validateId('applicationId'),
  communityManagerController.viewApplication
);

// Approve application
router.post(
  '/admin/:applicationId/approve',
  verifyToken,
  isAdmin,
  validateId('applicationId'),
  communityManagerController.approveApplication
);

// Reject application
router.post(
  '/admin/:applicationId/reject',
  verifyToken,
  isAdmin,
  validateId('applicationId'),
  communityManagerController.rejectApplication
);

export default router;