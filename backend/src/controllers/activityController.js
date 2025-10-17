import Activity from '../models/Activity.js';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';
import { ERROR_MESSAGES } from '../utils/constants.js';
import { parseQueryParams } from '../utils/helpers.js';

export const getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, type } = req.query;
    const { skip } = parseQueryParams({ page, limit });

    let query = { user: userId };

    if (type) {
      query.type = type;
    }

    const activities = await Activity.find(query)
      .populate('user', 'name profileImage')
      .populate('relatedEntity.entityId')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Activity.countDocuments(query);

    res.json({
      success: true,
      data: activities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching user activity', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const getGlobalActivity = async (req, res) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const { skip } = parseQueryParams({ page, limit });

    let query = {};

    if (type) {
      query.type = type;
    }

    const activities = await Activity.find(query)
      .populate('user', 'name profileImage')
      .populate('relatedEntity.entityId')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Activity.countDocuments(query);

    res.json({
      success: true,
      data: activities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching global activity', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const getCommunityActivity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const { skip } = parseQueryParams({ page, limit });

    // Find all users in the community
    const users = await User.find({ communitiesJoined: communityId }).select('_id');
    const userIds = users.map((u) => u._id);

    const activities = await Activity.find({ user: { $in: userIds } })
      .populate('user', 'name profileImage')
      .populate('relatedEntity.entityId')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Activity.countDocuments({ user: { $in: userIds } });

    res.json({
      success: true,
      data: activities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching community activity', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const getActivityStats = async (req, res) => {
  try {
    const activityTypes = await Activity.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
    ]);

    const topUsers = await Activity.aggregate([
      {
        $group: {
          _id: '$user',
          activityCount: { $sum: 1 },
        },
      },
      {
        $sort: { activityCount: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
    ]);

    const totalActivities = await Activity.countDocuments();

    res.json({
      success: true,
      stats: {
        totalActivities,
        byType: activityTypes,
        topUsers,
      },
    });
  } catch (error) {
    logger.error('Error fetching activity stats', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export default {
  getUserActivity,
  getGlobalActivity,
  getCommunityActivity,
  getActivityStats,
};