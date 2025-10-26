import express from 'express';
import * as communityController from '../controllers/communityController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validator.js';
import { validateLocationData } from '../middleware/locationValidator.js';

const router = express.Router();

// Get all communities (public)
router.get('/', validatePagination, communityController.getCommunities);

// Get community by ID (public)
router.get('/:id', validateId('id'), communityController.getCommunityById);

// Get community verification status (public)
router.get(
  '/:id/verification-status',
  validateId('id'),
  communityController.getCommunityVerificationStatus
);

// Get community members (creator/admin only)
router.get(
  '/:communityId/members',
  verifyToken,
  validateId('communityId'),
  validatePagination,
  communityController.getCommunityMembers
);

// Join community (user)
router.post('/:id/join', verifyToken, validateId('id'), communityController.joinCommunity);

// Leave community (user)
router.post('/:id/leave', verifyToken, validateId('id'), communityController.leaveCommunity);

// Update community (owner/admin only)
router.put(
  '/:id',
  verifyToken,
  validateId('id'),
  validateLocationData,
  communityController.updateCommunity
);

export default router;