import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validator.js';
import * as pointsService from '../services/pointsService.js';
import { logger } from '../utils/logger.js';
import { ERROR_MESSAGES } from '../utils/constants.js';

const router = express.Router();

// =====================
// VOLUNTEER POINTS ROUTES
// =====================

/**
 * Get volunteer points summary (real-time)
 * GET /points/volunteer/:userId
 */
router.get(
  '/volunteer/:userId',
  validateId('userId'),
  async (req, res) => {
    try {
      const { userId } = req.params;

      const summary = await pointsService.getVolunteerPointsSummary(userId);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      logger.error('Error fetching volunteer points', error);
      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }
);

/**
 * Get volunteer leaderboard (real-time)
 * GET /points/volunteer/leaderboard?page=1&limit=20
 */
router.get(
  '/volunteer/leaderboard',
  validatePagination,
  async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;

      const result = await pointsService.getVolunteerLeaderboard(
        parseInt(limit),
        parseInt(page)
      );

      res.json({
        success: true,
        data: result.leaderboard,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('Error fetching volunteer leaderboard', error);
      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }
);

// =====================
// COMMUNITY REWARDS ROUTES
// =====================

/**
 * Get community rewards summary (real-time)
 * GET /points/community/:communityId
 */
router.get(
  '/community/:communityId',
  validateId('communityId'),
  async (req, res) => {
    try {
      const { communityId } = req.params;

      const summary = await pointsService.getCommunityRewardsSummary(communityId);

      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      logger.error('Error fetching community rewards', error);
      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }
);

/**
 * Get community leaderboard (real-time)
 * GET /points/community/leaderboard?page=1&limit=20
 */
router.get(
  '/community/leaderboard',
  validatePagination,
  async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;

      const result = await pointsService.getCommunityLeaderboard(
        parseInt(limit),
        parseInt(page)
      );

      res.json({
        success: true,
        data: result.leaderboard,
        pagination: result.pagination,
      });
    } catch (error) {
      logger.error('Error fetching community leaderboard', error);
      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }
);

export default router;