import express from 'express';
import * as impactController from '../controllers/impactController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validator.js';

const router = express.Router();

// Get user impact metrics
router.get('/metrics/:userId', validateId('userId'), impactController.getUserImpactMetrics);

// Get user progress to next level
router.get('/progress/:userId', validateId('userId'), impactController.getUserProgress);

// Get leaderboard
router.get('/leaderboard', validatePagination, impactController.getLeaderboard);

// Get user rank
router.get('/rank/:userId', validateId('userId'), impactController.getUserRank);

// Update impact metrics (admin only)
router.put('/metrics/:userId', verifyToken, validateId('userId'), impactController.updateImpactMetrics);

// Get overall impact summary
router.get('/summary', impactController.getImpactSummary);

export default router;