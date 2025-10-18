import express from 'express';
import * as activityController from '../controllers/activityController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validator.js';

const router = express.Router();

// Get user activity
router.get(
  '/user/:userId',
  validateId('userId'),
  validatePagination,
  activityController.getUserActivity
);

// Get community activity
router.get(
  '/community/:communityId',
  validateId('communityId'),
  validatePagination,
  activityController.getCommunityActivity
);

// Get activity stats (ADMIN ONLY)
router.get(
  '/stats',
  verifyToken,
  isAdmin,
  activityController.getActivityStats
);

// Get global activity feed (public)
router.get(
  '/',
  validatePagination,
  activityController.getGlobalActivity
);

export default router;