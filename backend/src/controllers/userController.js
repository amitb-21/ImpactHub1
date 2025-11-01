import User from '../models/User.js';
import ImpactMetric from '../models/ImpactMetric.js';
import Activity from '../models/Activity.js';
import { logger } from '../utils/logger.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants.js';
import { parseQueryParams } from '../utils/helpers.js';
import { uploadToCloudinary, uploadBase64ToCloudinary } from '../services/uploadService.js';

export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .populate('communitiesJoined', 'name image')
      .populate('eventsParticipated', 'title image');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    const metrics = await ImpactMetric.findOne({ user: id });

    // Ensure createdAt is present — derive from ObjectId timestamp as a fallback
    const userObj = user.toObject({ getters: true, virtuals: false });
    if (!userObj.createdAt) {
      try {
        // Mongoose ObjectId has getTimestamp() which returns a Date
        userObj.createdAt = user._id.getTimestamp();
      } catch (err) {
        // ignore and leave createdAt undefined
      }
    }

    res.json({
      success: true,
      user: userObj,
      metrics,
    });
  } catch (error) {
    logger.error('Error fetching user profile', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, bio, location } = req.body;
    // profileImage may come as multipart file (req.file) or as a string in body
    let profileImage = req.body.profileImage;

    if (req.userId !== id && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (bio) updateData.bio = bio;
    if (location) updateData.location = location;

    // If a file was uploaded via multer, req.file will be present (memoryStorage)
    if (req.file) {
      try {
        const uploadResult = await uploadToCloudinary(req.file, 'impacthub/profiles');
        updateData.profileImage = uploadResult.url;
      } catch (err) {
        logger.error('Error uploading profile image', err);
        return res.status(500).json({ success: false, message: 'Failed to upload profile image' });
      }
    } else if (profileImage) {
      // If profileImage is provided as string (URL or base64), handle accordingly
      if (typeof profileImage === 'string' && profileImage.startsWith('data:')) {
        // base64 string
        try {
          const uploadResult = await uploadBase64ToCloudinary(profileImage, 'impacthub/profiles');
          updateData.profileImage = uploadResult.url;
        } catch (err) {
          logger.error('Error uploading base64 profile image', err);
          return res.status(500).json({ success: false, message: 'Failed to upload profile image' });
        }
      } else if (typeof profileImage === 'string') {
        updateData.profileImage = profileImage;
      }
    }

    const user = await User.findByIdAndUpdate(id, updateData, { new: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    logger.success(`User profile updated: ${id}`);

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.UPDATED,
      user: user.toJSON(),
    });
  } catch (error) {
    logger.error('Error updating user profile', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const getUserActivityFeed = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const { skip } = parseQueryParams({ page, limit });

    const activities = await Activity.find({ user: id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('user', 'name profileImage');

    const total = await Activity.countDocuments({ user: id });

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
    logger.error('Error fetching activity feed', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const getUserStats = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    const metrics = await ImpactMetric.findOne({ user: id });
    const activitiesCount = await Activity.countDocuments({ user: id });

    res.json({
      success: true,
      stats: {
        points: user.points,
        level: user.level,
        ...(metrics && {
          eventsParticipated: metrics.eventsParticipated,
          eventsCreated: metrics.eventsCreated,
          communitiesJoined: metrics.communitiesJoined,
          communitiesCreated: metrics.communitiesCreated,
          hoursVolunteered: metrics.hoursVolunteered,
          activitiesCount,
        }),
      },
    });
  } catch (error) {
    logger.error('Error fetching user stats', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    const { skip } = parseQueryParams({ page, limit });

    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
    })
      .select('-googleId')
      .limit(limit)
      .skip(skip);

    const total = await User.countDocuments({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
    });

    res.json({
      success: true,
      data: users.map((u) => u.toJSON()),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error searching users', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  getUserActivityFeed,
  getUserStats,
  searchUsers,
};