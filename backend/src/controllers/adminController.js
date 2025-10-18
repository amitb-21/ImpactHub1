import User from '../models/User.js';
import Community from '../models/Community.js';
import Event from '../models/Event.js';
import Activity from '../models/Activity.js';
import CommunityVerification from '../models/CommunityVerification.js';
import Participation from '../models/Participation.js';
import { logger } from '../utils/logger.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants.js';
import { parseQueryParams } from '../utils/helpers.js';

// =====================
// USER MANAGEMENT
// =====================

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search, status } = req.query;
    const { skip } = parseQueryParams({ page, limit });

    let query = {};

    if (role) {
      query.role = role;
    }

    if (status) {
      query.isActive = status === 'active';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-googleId')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await User.countDocuments(query);

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
    logger.error('Error fetching users', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId)
      .select('-googleId')
      .populate('communitiesJoined', 'name image')
      .populate('eventsParticipated', 'title image');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user stats
    const eventsCount = await Participation.countDocuments({ user: userId });
    const activitiesCount = await Activity.countDocuments({ user: userId });

    res.json({
      success: true,
      user: user.toJSON(),
      stats: {
        totalEvents: eventsCount,
        totalActivities: activitiesCount,
      },
    });
  } catch (error) {
    logger.error('Error fetching user details', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role',
      });
    }

    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    logger.success(`User role updated: ${userId} -> ${role}`);

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.UPDATED,
      user: user.toJSON(),
    });
  } catch (error) {
    logger.error('Error updating user role', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false, lastLogin: new Date() },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Log activity
    await Activity.create({
      user: userId,
      type: 'user_deactivated',
      description: `Account deactivated. Reason: ${reason || 'Not specified'}`,
      relatedEntity: {
        entityType: 'User',
        entityId: userId,
      },
    });

    logger.success(`User deactivated: ${userId}`);

    res.json({
      success: true,
      message: 'User deactivated',
      user: user.toJSON(),
    });
  } catch (error) {
    logger.error('Error deactivating user', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const reactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(userId, { isActive: true }, { new: true });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    logger.success(`User reactivated: ${userId}`);

    res.json({
      success: true,
      message: 'User reactivated',
      user: user.toJSON(),
    });
  } catch (error) {
    logger.error('Error reactivating user', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// =====================
// COMMUNITY MANAGEMENT
// =====================

export const getAllCommunities = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search, status } = req.query;
    const { skip } = parseQueryParams({ page, limit });

    let query = {};

    if (category) {
      query.category = category;
    }

    if (status) {
      query.isActive = status === 'active';
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const communities = await Community.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Community.countDocuments(query);

    res.json({
      success: true,
      data: communities,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching communities', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const getCommunityAnalytics = async (req, res) => {
  try {
    const { communityId } = req.params;

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found',
      });
    }

    // Get analytics
    const totalMembers = community.members.length;
    const totalEvents = await Event.countDocuments({ community: communityId });
    const totalParticipations = await Participation.countDocuments({ community: communityId });
    const totalRatings = community.totalRatings || 0;

    // Get recent activities
    const activities = await Activity.find({
      'relatedEntity.entityId': communityId,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name profileImage');

    // Get top events by participation
    const topEvents = await Event.find({ community: communityId })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      analytics: {
        totalMembers,
        totalEvents,
        totalParticipations,
        avgRating: community.avgRating || 0,
        totalRatings,
        recentActivities: activities,
        topEvents,
      },
    });
  } catch (error) {
    logger.error('Error fetching community analytics', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const deactivateCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { reason } = req.body;

    const community = await Community.findByIdAndUpdate(
      communityId,
      { isActive: false },
      { new: true }
    );

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found',
      });
    }

    // Log activity
    await Activity.create({
      user: req.userId,
      type: 'community_deactivated',
      description: `Community deactivated. Reason: ${reason || 'Not specified'}`,
      relatedEntity: {
        entityType: 'Community',
        entityId: communityId,
      },
    });

    logger.success(`Community deactivated: ${communityId}`);

    res.json({
      success: true,
      message: 'Community deactivated',
      community,
    });
  } catch (error) {
    logger.error('Error deactivating community', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const reactivateCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;

    const community = await Community.findByIdAndUpdate(
      communityId,
      { isActive: true },
      { new: true }
    );

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found',
      });
    }

    logger.success(`Community reactivated: ${communityId}`);

    res.json({
      success: true,
      message: 'Community reactivated',
      community,
    });
  } catch (error) {
    logger.error('Error reactivating community', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// =====================
// COMMUNITY MANAGER ENDPOINTS
// =====================

// Get participants for an event (community manager view)
export const getEventParticipantsDetailed = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 20, status } = req.query;
    const { skip } = parseQueryParams({ page, limit });

    const event = await Event.findById(eventId).populate('community');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if user is event creator (community manager)
    if (!event.createdBy.equals(req.userId)) {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    let query = { event: eventId };

    if (status) {
      query.status = status;
    }

    const participants = await Participation.find(query)
      .populate('user', 'name profileImage email')
      .populate('verifiedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Participation.countDocuments(query);

    // Get summary
    const summary = {
      totalRegistered: await Participation.countDocuments({
        event: eventId,
        status: 'Registered',
      }),
      totalAttended: await Participation.countDocuments({
        event: eventId,
        status: 'Attended',
      }),
      totalRejected: await Participation.countDocuments({
        event: eventId,
        status: 'Rejected',
      }),
      totalCancelled: await Participation.countDocuments({
        event: eventId,
        status: 'Cancelled',
      }),
    };

    res.json({
      success: true,
      data: participants,
      summary,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching event participants', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// Export participants list to CSV
export const exportParticipantsCSV = async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    if (!event.createdBy.equals(req.userId)) {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    const participants = await Participation.find({ event: eventId })
      .populate('user', 'name email profileImage')
      .select('user status hoursContributed pointsEarned verifiedAt');

    // Create CSV
    let csv = 'Name,Email,Status,Hours Contributed,Points Earned,Verified At\n';

    participants.forEach((p) => {
      csv += `"${p.user.name}","${p.user.email}","${p.status}",${p.hoursContributed || 0},${p.pointsEarned || 0},"${p.verifiedAt || 'N/A'}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="participants-${eventId}.csv"`);
    res.send(csv);
  } catch (error) {
    logger.error('Error exporting participants', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// =====================
// ANALYTICS & DASHBOARD
// =====================

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ isActive: true });
    const totalCommunities = await Community.countDocuments({ isActive: true });
    const totalEvents = await Event.countDocuments();
    const totalParticipations = await Participation.countDocuments();

    // Get recent signups
    const recentUsers = await User.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get pending verifications
    const pendingVerifications = await CommunityVerification.countDocuments({
      status: 'pending',
    });

    // Get verified communities
    const verifiedCommunities = await Community.countDocuments({
      verificationStatus: 'verified',
    });

    // Get activity trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activityTrend = await Activity.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      success: true,
      dashboard: {
        stats: {
          totalUsers,
          totalCommunities,
          totalEvents,
          totalParticipations,
          verifiedCommunities,
          pendingVerifications,
        },
        recentUsers,
        activityTrend,
      },
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const getSystemAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
    }

    // User growth
    const userGrowth = await User.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Event distribution by category
    const eventsByCategory = await Event.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    // Community distribution by category
    const communityByCategory = await Community.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    // Top activities
    const topActivities = await Activity.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      analytics: {
        userGrowth,
        eventsByCategory,
        communityByCategory,
        topActivities,
      },
    });
  } catch (error) {
    logger.error('Error fetching system analytics', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export default {
  // Users
  getAllUsers,
  getUserDetails,
  updateUserRole,
  deactivateUser,
  reactivateUser,
  // Communities
  getAllCommunities,
  getCommunityAnalytics,
  deactivateCommunity,
  reactivateCommunity,
  // Community Manager
  getEventParticipantsDetailed,
  exportParticipantsCSV,
  // Analytics
  getDashboardStats,
  getSystemAnalytics,
};