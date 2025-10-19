import express from 'express';
import * as communityController from '../controllers/communityController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateId, validatePagination, validateCreateCommunity } from '../middleware/validator.js';
import { validateLocationData } from '../middleware/locationValidator.js';

const router = express.Router();

// Create community with location and organization validation
router.post(
  '/',
  verifyToken,
  validateCreateCommunity,
  validateLocationData, // ✅ Validate location data
  communityController.createCommunity
);

// Get all communities
router.get('/', validatePagination, communityController.getCommunities);

// Get community by ID
router.get('/:id', validateId('id'), communityController.getCommunityById);

// Get community verification status
router.get(
  '/:id/verification-status',
  validateId('id'),
  communityController.getCommunityVerificationStatus
);

// Join community
router.post('/:id/join', verifyToken, validateId('id'), communityController.joinCommunity);

// Leave community
router.post(
  '/:id/leave',
  verifyToken,
  validateId('id'),
  communityController.leaveCommunity
);

// Update community with location validation
router.put(
  '/:id',
  verifyToken,
  validateId('id'),
  validateLocationData, // ✅ Validate location data on updates
  communityController.updateCommunity
);

export default router;