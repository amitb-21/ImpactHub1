import express from 'express';
import * as communityController from '../controllers/communityController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateId, validatePagination, validateCreateCommunity } from '../middleware/validator.js';

const router = express.Router();

// Create community
router.post('/', verifyToken, validateCreateCommunity, communityController.createCommunity);

// Get all communities
router.get('/', validatePagination, communityController.getCommunities);

// Get community by ID
router.get('/:id', validateId('id'), communityController.getCommunityById);

// Join community
router.post('/:id/join', verifyToken, validateId('id'), communityController.joinCommunity);

// Leave community
router.post('/:id/leave', verifyToken, validateId('id'), communityController.leaveCommunity);

// Update community
router.put('/:id', verifyToken, validateId('id'), communityController.updateCommunity);

export default router;