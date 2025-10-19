import { getIO } from '../config/socket.js';
import { logger } from '../utils/logger.js';

/**
 * Emit notification to specific user
 */
export const emitToUser = (userId, event, data) => {
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: new Date(),
    });
    logger.debug(`Emitted ${event} to user:${userId}`);
  } catch (error) {
    logger.error('Error emitting to user', error);
  }
};

/**
 * Emit notification to community members
 */
export const emitToCommunity = (communityId, event, data) => {
  try {
    const io = getIO();
    io.to(`community:${communityId}`).emit(event, {
      ...data,
      timestamp: new Date(),
    });
    logger.debug(`Emitted ${event} to community:${communityId}`);
  } catch (error) {
    logger.error('Error emitting to community', error);
  }
};

/**
 * Emit notification to event participants
 */
export const emitToEvent = (eventId, event, data) => {
  try {
    const io = getIO();
    io.to(`event:${eventId}`).emit(event, {
      ...data,
      timestamp: new Date(),
    });
    logger.debug(`Emitted ${event} to event:${eventId}`);
  } catch (error) {
    logger.error('Error emitting to event', error);
  }
};

/**
 * Emit notification to all admins
 */
export const emitToAdmins = (event, data) => {
  try {
    const io = getIO();
    io.to('admin').emit(event, {
      ...data,
      timestamp: new Date(),
    });
    logger.debug(`Emitted ${event} to admins`);
  } catch (error) {
    logger.error('Error emitting to admins', error);
  }
};

/**
 * Broadcast to all connected clients
 */
export const broadcastToAll = (event, data) => {
  try {
    const io = getIO();
    io.emit(event, {
      ...data,
      timestamp: new Date(),
    });
    logger.debug(`Broadcasted ${event} to all clients`);
  } catch (error) {
    logger.error('Error broadcasting', error);
  }
};

// =====================
// SPECIFIC EVENT EMITTERS
// =====================

/**
 * Notify user of points earned
 */
export const notifyPointsEarned = (userId, points, reason, relatedEntity = null) => {
  emitToUser(userId, 'points:earned', {
    points,
    reason,
    relatedEntity,
  });
};

/**
 * Notify user of level up
 */
export const notifyLevelUp = (userId, newLevel, newRank = null) => {
  emitToUser(userId, 'user:levelup', {
    level: newLevel,
    rank: newRank,
  });
};

/**
 * Notify community of new member
 */
export const notifyCommunityNewMember = (communityId, user) => {
  emitToCommunity(communityId, 'community:member_joined', {
    user: {
      id: user._id,
      name: user.name,
      profileImage: user.profileImage,
    },
  });
};

/**
 * Notify community of new event
 */
export const notifyCommunityNewEvent = (communityId, event) => {
  emitToCommunity(communityId, 'community:event_created', {
    event: {
      id: event._id,
      title: event.title,
      image: event.image,
      startDate: event.startDate,
    },
  });
};

/**
 * Notify event participants of update
 */
export const notifyEventUpdate = (eventId, updateType, data) => {
  emitToEvent(eventId, `event:${updateType}`, data);
};

/**
 * Notify user of attendance verification
 */
export const notifyAttendanceVerified = (userId, eventId, points, hours) => {
  emitToUser(userId, 'participation:verified', {
    eventId,
    points,
    hours,
    message: `Your attendance has been verified! You earned ${points} points.`,
  });
};

/**
 * Notify user of rejection
 */
export const notifyParticipationRejected = (userId, eventId, reason) => {
  emitToUser(userId, 'participation:rejected', {
    eventId,
    reason,
    message: 'Your participation was rejected.',
  });
};

/**
 * Notify community creator of verification status
 */
export const notifyCommunityVerification = (userId, communityId, status, message) => {
  emitToUser(userId, 'community:verification_update', {
    communityId,
    status,
    message,
  });
};

/**
 * Notify admins of new verification request
 */
export const notifyAdminsNewVerification = (communityId, communityName) => {
  emitToAdmins('admin:new_verification', {
    communityId,
    communityName,
    message: `New verification request from ${communityName}`,
  });
};

/**
 * Update leaderboard in real-time
 */
export const updateLeaderboard = (leaderboardType, data) => {
  try {
    const io = getIO();
    io.to('leaderboard').emit(`leaderboard:${leaderboardType}_update`, data);
    logger.debug(`Updated ${leaderboardType} leaderboard`);
  } catch (error) {
    logger.error('Error updating leaderboard', error);
  }
};

/**
 * Notify event organizer of new participant
 */
export const notifyEventNewParticipant = (organizerId, eventId, participant) => {
  emitToUser(organizerId, 'event:new_participant', {
    eventId,
    participant: {
      id: participant._id,
      name: participant.name,
      profileImage: participant.profileImage,
    },
  });
};

/**
 * Broadcast activity to followers/community
 */
export const broadcastActivity = (activityType, userId, data) => {
  try {
    const io = getIO();
    // Broadcast to activity feed subscribers
    io.emit('activity:new', {
      type: activityType,
      userId,
      ...data,
      timestamp: new Date(),
    });
    logger.debug(`Broadcasted activity: ${activityType}`);
  } catch (error) {
    logger.error('Error broadcasting activity', error);
  }
};

/**
 * Notify about new rating
 */
export const notifyNewRating = (entityType, entityId, rating) => {
  if (entityType === 'Community') {
    emitToCommunity(entityId, 'community:new_rating', rating);
  } else if (entityType === 'Event') {
    emitToEvent(entityId, 'event:new_rating', rating);
  }
};

/**
 * Real-time event capacity update
 */
export const updateEventCapacity = (eventId, capacityData) => {
  emitToEvent(eventId, 'event:capacity_update', capacityData);
};

/**
 * Notify about new photo uploaded
 */
export const notifyEventPhotoUploaded = (eventId, communityId, photo) => {
  emitToEvent(eventId, 'event:photo_uploaded', photo);
  emitToCommunity(communityId, 'community:photo_uploaded', photo);
};

/**
 * Send system notification to user
 */
export const sendSystemNotification = (userId, notification) => {
  emitToUser(userId, 'notification:system', {
    title: notification.title,
    message: notification.message,
    type: notification.type || 'info',
    action: notification.action || null,
  });
};

export default {
  emitToUser,
  emitToCommunity,
  emitToEvent,
  emitToAdmins,
  broadcastToAll,
  notifyPointsEarned,
  notifyLevelUp,
  notifyCommunityNewMember,
  notifyCommunityNewEvent,
  notifyEventUpdate,
  notifyAttendanceVerified,
  notifyParticipationRejected,
  notifyCommunityVerification,
  notifyAdminsNewVerification,
  updateLeaderboard,
  notifyEventNewParticipant,
  broadcastActivity,
  notifyNewRating,
  updateEventCapacity,
  notifyEventPhotoUploaded,
  sendSystemNotification,
};