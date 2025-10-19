import VolunteerPoints from '../models/VolunteerPoints.js';
import CommunityRewards from '../models/CommunityRewards.js';
import User from '../models/User.js';
import Community from '../models/Community.js';
import { logger } from '../utils/logger.js';
import { POINTS_CONFIG, ERROR_MESSAGES } from '../utils/constants.js';
import {
  validateUserId,
  validateCommunityId,
  validatePoints,
  calculateLevel, 
} from '../utils/helpers.js';
import * as socketService from './socketService.js';


const validateUserIdOrThrow = (userId) => {
  const error = validateUserId(userId);
  if (error) throw new Error(error);
};

const validateCommunityIdOrThrow = (communityId) => {
  const error = validateCommunityId(communityId);
  if (error) throw new Error(error);
};

const validatePointsOrThrow = (points) => {
  const error = validatePoints(points);
  if (error) throw new Error(error);
};

// =====================
// VOLUNTEER POINTS SERVICE
// =====================

/**
 * Award points to volunteer for event participation
 * @param {string} userId - User ID
 * @param {string} eventId - Event ID
 * @param {number} points - Points to award (default: EVENT_PARTICIPATED)
 * @param {number} hoursContributed - Hours volunteered (optional)
 */
export const awardVolunteerEventPoints = async (
  userId,
  eventId,
  points = POINTS_CONFIG.EVENT_PARTICIPATED,
  hoursContributed = 0
) => {
  try {
    // Validate inputs
    validateUserIdOrThrow(userId);
    if (!eventId) throw new Error('Event ID is required');
    validatePointsOrThrow(points);

    if (typeof hoursContributed !== 'number' || hoursContributed < 0) {
      throw new Error('Hours contributed must be a non-negative number');
    }

    let totalPoints = points;

    // Add bonus for hours volunteered
    if (hoursContributed > 0) {
      totalPoints += hoursContributed * POINTS_CONFIG.HOURS_VOLUNTEERED;
    }

    // Update or create volunteer points record
    const volunteerPoints = await VolunteerPoints.findOneAndUpdate(
      { user: userId },
      {
        $inc: {
          totalPoints: totalPoints,
          'pointsBreakdown.eventParticipation': points,
        },
        $push: {
          pointsHistory: {
            points: totalPoints,
            type: 'event_participation',
            description: `Participated in event and earned ${totalPoints} points${
              hoursContributed > 0 ? ` (${hoursContributed} hours)` : ''
            }`,
            eventId: eventId,
            relatedEntity: {
              entityType: 'Event',
              entityId: eventId,
            },
            awardedAt: new Date(),
          },
        },
        lastPointsUpdate: new Date(),
      },
      { upsert: true, new: true }
    );

    // Update user's total points (single source of truth)
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $inc: { points: totalPoints } },
      { new: true }
    );

    logger.success(
      `Volunteer ${userId} awarded ${totalPoints} points for event participation`
    );

    // ✅ FIXED: Now socket notifications have proper imports and functions
    socketService.notifyPointsEarned(userId, totalPoints, 'event_participation', {
      entityType: 'Event',
      entityId: eventId,
    });

    // Check for level up
    // ✅ FIXED: calculateLevel is now imported
    const newLevel = calculateLevel(updatedUser.points);
    if (newLevel > updatedUser.level) {
      await User.findByIdAndUpdate(userId, { level: newLevel });
      socketService.notifyLevelUp(userId, newLevel, calculateVolunteerRank(updatedUser.points));
    }

    // Update leaderboard
    socketService.updateLeaderboard('volunteer', {
      userId,
      totalPoints: volunteerPoints.totalPoints,
      rank: volunteerPoints.currentRank,
    });

    return volunteerPoints;
  } catch (error) {
    logger.error('Error awarding volunteer event points', error);
    throw error;
  }
};

/**
 * Award points to volunteer for creating event
 */
export const awardVolunteerEventCreationPoints = async (userId, eventId) => {
  try {
    validateUserIdOrThrow(userId);
    if (!eventId) throw new Error('Event ID is required');

    const points = POINTS_CONFIG.EVENT_CREATED;

    const volunteerPoints = await VolunteerPoints.findOneAndUpdate(
      { user: userId },
      {
        $inc: {
          totalPoints: points,
          'pointsBreakdown.eventCreation': points,
        },
        $push: {
          pointsHistory: {
            points: points,
            type: 'event_creation',
            description: `Created event and earned ${points} points`,
            eventId: eventId,
            relatedEntity: {
              entityType: 'Event',
              entityId: eventId,
            },
            awardedAt: new Date(),
          },
        },
        lastPointsUpdate: new Date(),
      },
      { upsert: true, new: true }
    );

    await User.findByIdAndUpdate(userId, { $inc: { points } });

    logger.success(`Volunteer ${userId} awarded ${points} points for event creation`);

    return volunteerPoints;
  } catch (error) {
    logger.error('Error awarding volunteer event creation points', error);
    throw error;
  }
};

/**
 * Award points to volunteer for community creation
 */
export const awardVolunteerCommunityCreationPoints = async (userId, communityId) => {
  try {
    validateUserIdOrThrow(userId);
    validateCommunityIdOrThrow(communityId);

    const points = POINTS_CONFIG.COMMUNITY_CREATED;

    const volunteerPoints = await VolunteerPoints.findOneAndUpdate(
      { user: userId },
      {
        $inc: {
          totalPoints: points,
          'pointsBreakdown.communityCreation': points,
        },
        $push: {
          pointsHistory: {
            points: points,
            type: 'community_creation',
            description: `Created community and earned ${points} points`,
            relatedEntity: {
              entityType: 'Community',
              entityId: communityId,
            },
            awardedAt: new Date(),
          },
        },
        lastPointsUpdate: new Date(),
      },
      { upsert: true, new: true }
    );

    await User.findByIdAndUpdate(userId, { $inc: { points } });

    logger.success(`Volunteer ${userId} awarded ${points} points for community creation`);

    return volunteerPoints;
  } catch (error) {
    logger.error('Error awarding volunteer community creation points', error);
    throw error;
  }
};

/**
 * Get volunteer points summary (real-time)
 */
export const getVolunteerPointsSummary = async (userId) => {
  try {
    validateUserIdOrThrow(userId);

    let volunteerPoints = await VolunteerPoints.findOne({ user: userId });

    if (!volunteerPoints) {
      volunteerPoints = await VolunteerPoints.create({ user: userId });
    }

    // Calculate rank based on points
    const rank = calculateVolunteerRank(volunteerPoints.totalPoints);
    volunteerPoints.currentRank = rank;
    await volunteerPoints.save();

    return {
      totalPoints: volunteerPoints.totalPoints,
      breakdown: volunteerPoints.pointsBreakdown,
      currentLevel: volunteerPoints.currentLevel,
      currentRank: volunteerPoints.currentRank,
      recentHistory: volunteerPoints.pointsHistory.slice(-10),
      lastUpdate: volunteerPoints.lastPointsUpdate,
    };
  } catch (error) {
    logger.error('Error getting volunteer points summary', error);
    throw error;
  }
};

/**
 * Calculate volunteer rank based on points
 */
export const calculateVolunteerRank = (totalPoints) => {
  if (totalPoints < 500) return 'Beginner';
  if (totalPoints < 1500) return 'Contributor';
  if (totalPoints < 3000) return 'Leader';
  if (totalPoints < 5000) return 'Champion';
  return 'Legend';
};

// =====================
// COMMUNITY REWARDS SERVICE
// =====================

/**
 * Award points to community when member joins
 */
export const awardCommunityMemberJoinedPoints = async (communityId, userId) => {
  try {
    validateCommunityIdOrThrow(communityId);
    validateUserIdOrThrow(userId);

    const points = 5; // Points per member joined

    const communityRewards = await CommunityRewards.findOneAndUpdate(
      { community: communityId },
      {
        $inc: {
          totalPoints: points,
          'pointsBreakdown.memberJoined': points,
          totalMembers: 1,
        },
        $push: {
          rewardsHistory: {
            points: points,
            type: 'member_joined',
            description: `New member joined community`,
            relatedUser: userId,
            relatedEntity: {
              entityType: 'User',
              entityId: userId,
            },
            awardedAt: new Date(),
          },
        },
        lastPointsUpdate: new Date(),
      },
      { upsert: true, new: true }
    );

    logger.success(`Community ${communityId} awarded ${points} points for new member`);

    return communityRewards;
  } catch (error) {
    logger.error('Error awarding community member joined points', error);
    throw error;
  }
};

/**
 * Award points to community when event is created
 */
export const awardCommunityEventCreatedPoints = async (communityId) => {
  try {
    validateCommunityIdOrThrow(communityId);

    const points = 50;

    const communityRewards = await CommunityRewards.findOneAndUpdate(
      { community: communityId },
      {
        $inc: {
          totalPoints: points,
          'pointsBreakdown.eventsCreated': points,
          totalEvents: 1,
        },
        $push: {
          rewardsHistory: {
            points: points,
            type: 'event_created',
            description: `Event created in community`,
            awardedAt: new Date(),
          },
        },
        lastPointsUpdate: new Date(),
      },
      { upsert: true, new: true }
    );

    logger.success(`Community ${communityId} awarded ${points} points for event creation`);

    return communityRewards;
  } catch (error) {
    logger.error('Error awarding community event created points', error);
    throw error;
  }
};

/**
 * Award points to community when verified
 */
export const awardCommunityVerificationPoints = async (communityId) => {
  try {
    validateCommunityIdOrThrow(communityId);

    const points = 500;

    const communityRewards = await CommunityRewards.findOneAndUpdate(
      { community: communityId },
      {
        $inc: {
          totalPoints: points,
          'pointsBreakdown.verificationBonus': points,
        },
        $push: {
          rewardsHistory: {
            points: points,
            type: 'verification_bonus',
            description: `Community verified by admin`,
            awardedAt: new Date(),
          },
        },
        $addToSet: { achievements: 'verified_community' },
        lastPointsUpdate: new Date(),
      },
      { upsert: true, new: true }
    );

    logger.success(`Community ${communityId} awarded ${points} points for verification`);

    return communityRewards;
  } catch (error) {
    logger.error('Error awarding community verification points', error);
    throw error;
  }
};

/**
 * Get community rewards summary (real-time)
 */
export const getCommunityRewardsSummary = async (communityId) => {
  try {
    validateCommunityIdOrThrow(communityId);

    let communityRewards = await CommunityRewards.findOne({ community: communityId }).populate(
      'community',
      'name verificationStatus'
    );

    if (!communityRewards) {
      const community = await Community.findById(communityId);
      communityRewards = await CommunityRewards.create({
        community: communityId,
        verificationStatus: community?.verificationStatus || 'pending',
      });
    }

    // Calculate tier based on points
    const tier = calculateCommunityTier(communityRewards.totalPoints);
    communityRewards.communityTier = tier;
    await communityRewards.save();

    return {
      totalPoints: communityRewards.totalPoints,
      breakdown: communityRewards.pointsBreakdown,
      communityTier: communityRewards.communityTier,
      achievements: communityRewards.achievements,
      metrics: communityRewards.metrics,
      recentHistory: communityRewards.rewardsHistory.slice(-10),
      lastUpdate: communityRewards.lastPointsUpdate,
    };
  } catch (error) {
    logger.error('Error getting community rewards summary', error);
    throw error;
  }
};

/**
 * Calculate community tier based on points
 */
export const calculateCommunityTier = (totalPoints) => {
  if (totalPoints < 1000) return 'Bronze';
  if (totalPoints < 2500) return 'Silver';
  if (totalPoints < 5000) return 'Gold';
  if (totalPoints < 10000) return 'Platinum';
  return 'Diamond';
};

/**
 * Get leaderboard for volunteers (real-time)
 */
export const getVolunteerLeaderboard = async (limit = 20, page = 1) => {
  try {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
    if (!Number.isInteger(page) || page < 1) {
      throw new Error('Page must be a positive integer');
    }

    const skip = (page - 1) * limit;

    const leaderboard = await VolunteerPoints.find()
      .populate('user', 'name profileImage email')
      .sort({ totalPoints: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await VolunteerPoints.countDocuments();

    return {
      leaderboard,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error getting volunteer leaderboard', error);
    throw error;
  }
};

/**
 * Get leaderboard for communities (real-time)
 */
export const getCommunityLeaderboard = async (limit = 20, page = 1) => {
  try {
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
    if (!Number.isInteger(page) || page < 1) {
      throw new Error('Page must be a positive integer');
    }

    const skip = (page - 1) * limit;

    const leaderboard = await CommunityRewards.find()
      .populate('community', 'name image verificationStatus category')
      .sort({ totalPoints: -1 })
      .limit(limit)
      .skip(skip)
      .lean();

    const total = await CommunityRewards.countDocuments();

    return {
      leaderboard,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    logger.error('Error getting community leaderboard', error);
    throw error;
  }
};

export default {
  // Volunteer Points
  awardVolunteerEventPoints,
  awardVolunteerEventCreationPoints,
  awardVolunteerCommunityCreationPoints,
  getVolunteerPointsSummary,
  calculateVolunteerRank,
  getVolunteerLeaderboard,
  // Community Rewards
  awardCommunityMemberJoinedPoints,
  awardCommunityEventCreatedPoints,
  awardCommunityVerificationPoints,
  getCommunityRewardsSummary,
  calculateCommunityTier,
  getCommunityLeaderboard,
};