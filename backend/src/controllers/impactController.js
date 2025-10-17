import User from '../models/User.js';
import ImpactMetric from '../models/ImpactMetric.js';
import { logger } from '../utils/logger.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants.js';
import { getUserProgressToNextLevel } from '../services/impactService.js';
import { parseQueryParams } from '../utils/helpers.js';

export const getUserImpactMetrics = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    const metrics = await ImpactMetric.findOne({ user: userId });

    if (!metrics) {
      const newMetrics = await ImpactMetric.create({ user: userId });
      return res.json({
        success: true,
        metrics: newMetrics,
      });
    }

    res.json({
      success: true,
      metrics,
    });
  } catch (error) {
    logger.error('Error fetching impact metrics', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const getUserProgress = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    const progress = await getUserProgressToNextLevel(userId);

    res.json({
      success: true,
      currentLevel: user.level,
      currentPoints: user.points,
      progress,
    });
  } catch (error) {
    logger.error('Error fetching user progress', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const { page = 1, limit = 20, metric = 'points' } = req.query;
    const { skip } = parseQueryParams({ page, limit });

    let sortQuery = {};

    if (metric === 'points') {
      sortQuery = { points: -1 };
    } else if (metric === 'level') {
      sortQuery = { level: -1, points: -1 };
    } else if (metric === 'hoursVolunteered') {
      sortQuery = { 'metrics.hoursVolunteered': -1 };
    }

    const users = await User.find({ isActive: true })
      .select('name profileImage points level')
      .sort(sortQuery)
      .limit(limit)
      .skip(skip);

    // Enrich with metrics
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const metrics = await ImpactMetric.findOne({ user: user._id });
        return {
          ...user.toJSON(),
          metrics: metrics || {},
        };
      })
    );

    const total = await User.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: enrichedUsers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching leaderboard', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const getUserRank = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    const rank = await User.countDocuments({
      points: { $gt: user.points },
      isActive: true,
    });

    const totalUsers = await User.countDocuments({ isActive: true });

    res.json({
      success: true,
      rank: rank + 1,
      totalUsers,
      percentile: ((totalUsers - rank) / totalUsers * 100).toFixed(2),
    });
  } catch (error) {
    logger.error('Error fetching user rank', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const updateImpactMetrics = async (req, res) => {
  try {
    const { userId } = req.params;
    const metricsUpdate = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    const updated = await ImpactMetric.findOneAndUpdate(
      { user: userId },
      { $set: metricsUpdate },
      { upsert: true, new: true }
    );

    logger.success(`Impact metrics updated for user ${userId}`);

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.UPDATED,
      metrics: updated,
    });
  } catch (error) {
    logger.error('Error updating impact metrics', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const getImpactSummary = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });

    const topMetrics = await User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalPoints: { $sum: '$points' },
          averageLevel: { $avg: '$level' },
          maxPoints: { $max: '$points' },
        },
      },
    ]);

    const metrics = await ImpactMetric.aggregate([
      {
        $group: {
          _id: null,
          totalHoursVolunteered: { $sum: '$hoursVolunteered' },
          totalCO2Reduced: { $sum: '$co2Reduced' },
          totalTreesPlanted: { $sum: '$treesPlanted' },
          totalPeopleHelped: { $sum: '$peopleHelped' },
        },
      },
    ]);

    res.json({
      success: true,
      summary: {
        totalUsers,
        ...(topMetrics[0] || {}),
        ...(metrics[0] || {}),
      },
    });
  } catch (error) {
    logger.error('Error fetching impact summary', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export default {
  getUserImpactMetrics,
  getUserProgress,
  getLeaderboard,
  getUserRank,
  updateImpactMetrics,
  getImpactSummary,
};