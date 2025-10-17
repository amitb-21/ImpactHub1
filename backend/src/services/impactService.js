import User from '../models/User.js';
import ImpactMetric from '../models/ImpactMetric.js';
import Activity from '../models/Activity.js';
import { POINTS_CONFIG } from '../utils/constants.js';
import { calculateLevel, getProgressToNextLevel } from '../utils/helpers.js';
import { logger } from '../utils/logger.js';

export const addPoints = async (userId, points, activityType, description) => {
  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { points } },
      { new: true }
    );

    const newLevel = calculateLevel(user.points);
    if (newLevel > user.level) {
      user.level = newLevel;
      await user.save();
      logger.success(`User ${userId} leveled up to ${newLevel}`);
    }

    await Activity.create({
      user: userId,
      type: activityType,
      description,
      metadata: { pointsEarned: points },
    });

    return user;
  } catch (error) {
    logger.error('Error adding points', error);
    throw error;
  }
};

export const awardEventParticipation = async (userId, eventId, hoursContributed = 0) => {
  try {
    let points = POINTS_CONFIG.EVENT_PARTICIPATED;
    if (hoursContributed > 0) {
      points += hoursContributed * POINTS_CONFIG.HOURS_VOLUNTEERED;
    }

    const user = await addPoints(
      userId,
      points,
      'event_joined',
      `Participated in event and earned ${points} points`
    );

    await ImpactMetric.findOneAndUpdate(
      { user: userId },
      {
        $inc: {
          eventsParticipated: 1,
          hoursVolunteered: hoursContributed,
          totalPoints: points,
        },
      },
      { upsert: true, new: true }
    );

    return user;
  } catch (error) {
    logger.error('Error awarding event participation', error);
    throw error;
  }
};

export const awardCommunityCreation = async (userId) => {
  try {
    const points = POINTS_CONFIG.COMMUNITY_CREATED;

    const user = await addPoints(
      userId,
      points,
      'community_created',
      `Created a community and earned ${points} points`
    );

    await ImpactMetric.findOneAndUpdate(
      { user: userId },
      {
        $inc: {
          communitiesCreated: 1,
          totalPoints: points,
        },
      },
      { upsert: true, new: true }
    );

    return user;
  } catch (error) {
    logger.error('Error awarding community creation', error);
    throw error;
  }
};

export const awardEventCreation = async (userId) => {
  try {
    const points = POINTS_CONFIG.EVENT_CREATED;

    const user = await addPoints(
      userId,
      points,
      'event_created',
      `Created an event and earned ${points} points`
    );

    await ImpactMetric.findOneAndUpdate(
      { user: userId },
      {
        $inc: {
          eventsCreated: 1,
          totalPoints: points,
        },
      },
      { upsert: true, new: true }
    );

    return user;
  } catch (error) {
    logger.error('Error awarding event creation', error);
    throw error;
  }
};

export const getUserImpactMetrics = async (userId) => {
  try {
    const metrics = await ImpactMetric.findOne({ user: userId });
    if (!metrics) {
      return await ImpactMetric.create({ user: userId });
    }
    return metrics;
  } catch (error) {
    logger.error('Error fetching user impact metrics', error);
    throw error;
  }
};

export const getUserProgressToNextLevel = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error('User not found');

    return getProgressToNextLevel(user.points, user.level);
  } catch (error) {
    logger.error('Error calculating progress', error);
    throw error;
  }
};

export const getUserActivityFeed = async (userId, limit = 10, skip = 0) => {
  try {
    const activities = await Activity.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('user', 'name profileImage');

    const total = await Activity.countDocuments({ user: userId });

    return {
      activities,
      total,
      limit,
      skip,
    };
  } catch (error) {
    logger.error('Error fetching activity feed', error);
    throw error;
  }
};

export const updateImpactMetrics = async (userId, metricsUpdate) => {
  try {
    const updated = await ImpactMetric.findOneAndUpdate(
      { user: userId },
      { $set: metricsUpdate },
      { upsert: true, new: true }
    );
    return updated;
  } catch (error) {
    logger.error('Error updating impact metrics', error);
    throw error;
  }
};

export default {
  addPoints,
  awardEventParticipation,
  awardCommunityCreation,
  awardEventCreation,
  getUserImpactMetrics,
  getUserProgressToNextLevel,
  getUserActivityFeed,
  updateImpactMetrics,
};