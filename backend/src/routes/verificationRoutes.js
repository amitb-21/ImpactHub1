import express from 'express';
import * as verificationController from '../controllers/verificationController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validator.js';

const router = express.Router();

// Submit verification request (community creator)
router.post('/:communityId/submit', verifyToken, validateId('communityId'), verificationController.submitVerificationRequest);

// Get verification status (anyone)
router.get('/:communityId/status', validateId('communityId'), verificationController.getVerificationStatus);

// ADMIN ENDPOINTS

// Get pending verifications (admin only)
router.get('/admin/pending', verifyToken, isAdmin, validatePagination, verificationController.getPendingVerifications);

// Approve/Reject community (admin only)
router.post('/:verificationId/review', verifyToken, isAdmin, validateId('verificationId'), verificationController.verifyOrRejectCommunity);

// Get verification history (admin only)
router.get('/admin/history', verifyToken, isAdmin, validatePagination, verificationController.getVerificationHistory);

export default router;