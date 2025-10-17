import express from 'express';
import * as userController from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validator.js';

const router = express.Router();

// Get user profile
router.get('/:id', validateId('id'), userController.getUserProfile);

// Update user profile
router.put('/:id', verifyToken, validateId('id'), userController.updateUserProfile);

// Get user activity feed
router.get('/:id/activity', validateId('id'), validatePagination, userController.getUserActivityFeed);

// Get user stats
router.get('/:id/stats', validateId('id'), userController.getUserStats);

// Search users
router.get('/', validatePagination, userController.searchUsers);

export default router;