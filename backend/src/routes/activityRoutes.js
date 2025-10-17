import express from 'express';
import * as activityController from '../controllers/activityController.js';
import { validateId, validatePagination } from '../middleware/validator.js';

const router = express.Router();

// Get user activity
router.get('/user/:userId', validateId('userId'), validatePagination, activityController.getUserActivity);

// Get global activity feed
router.get('/', validatePagination, activityController.getGlobalActivity);

// Get community activity
router.get('/community/:communityId', validateId('communityId'), validatePagination, activityController.getCommunityActivity);

// Get activity stats
router.get('/stats', activityController.getActivityStats);

export default router;