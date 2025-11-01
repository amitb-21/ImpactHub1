import express from 'express';
import * as userController from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validator.js';
import uploadMiddleware from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Search users - generic but should come first due to query params
router.get('/', validatePagination, userController.searchUsers);

// User activity feed - SPECIFIC
router.get(
  '/:id/activity',
  validateId('id'),
  validatePagination,
  userController.getUserActivityFeed
);

// User stats - SPECIFIC
router.get(
  '/:id/stats',
  validateId('id'),
  userController.getUserStats
);

// Update user profile - SPECIFIC with method
router.put(
  '/:id',
  verifyToken,
  validateId('id'),
  // Accept a single file under field name 'profileImage' (frontend uses this key)
  uploadMiddleware.uploadProfileImage,
  userController.updateUserProfile,
  uploadMiddleware.handleUploadError
);

// Get user profile - GENERIC (must be LAST)
router.get(
  '/:id',
  validateId('id'),
  userController.getUserProfile
);

export default router;
