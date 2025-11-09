// backend/src/services/socketService.js

import { getIO } from '../config/socket.js';
import { logger } from '../utils/logger.js';

/**
 * Emit notification to specific user
 * ✅ UPDATED: Removed automatic timestamp
 */
export const emitToUser = (userId, event, data) => {
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit(event, {
      ...data,
      // ❌ REMOVED: timestamp: new Date(),
    });
    logger.debug(`Emitted ${event} to user:${userId}`);
  } catch (error) {
    logger.error('Error emitting to user', error);
  }
};

/**
 * Emit notification to community members
 * ✅ UPDATED: Removed automatic timestamp
 */
export const emitToCommunity = (communityId, event, data) => {
  try {
    const io = getIO();
    io.to(`community:${communityId}`).emit(event, {
      ...data,
      // ❌ REMOVED: timestamp: new Date(),
    });
    logger.debug(`Emitted ${event} to community:${communityId}`);
  } catch (error) {
    logger.error('Error emitting to community', error);
  }
};

/**
 * Emit notification to event participants
 * ✅ UPDATED: Removed automatic timestamp
 */
export const emitToEvent = (eventId, event, data) => {
  try {
    const io = getIO();
    io.to(`event:${eventId}`).emit(event, {
      ...data,
      // ❌ REMOVED: timestamp: new Date(),
    });
    logger.debug(`Emitted ${event} to event:${eventId}`);
  } catch (error) {
    logger.error('Error emitting to event', error);
  }
};

/**
 * Emit notification to all admins
 * ✅ UPDATED: Removed automatic timestamp
 */
export const emitToAdmins = (event, data) => {
  try {
    const io = getIO();
    io.to('admin').emit(event, {
      ...data,
      // ❌ REMOVED: timestamp: new Date(),
    });
    logger.debug(`Emitted ${event} to admins`);
  } catch (error) {
    logger.error('Error emitting to admins', error);
  }
};

/**
 * Broadcast to all connected clients
 * ✅ UPDATED: Removed automatic timestamp
 */
export const broadcastToAll = (event, data) => {
  try {
    const io = getIO();
    io.emit(event, {
      ...data,
      // ❌ REMOVED: timestamp: new Date(),
    });
    logger.debug(`Broadcasted ${event} to all clients`);
  } catch (error) {
    logger.error('Error broadcasting', error);
  }
};

// =====================
// SPECIFIC EVENT EMITTERS
// =====================

export const notifyPointsEarned = (userId, points, reason, relatedEntity = null) => {
  // ✅ FIX: Send payload that matches impactSlice expectations
  emitToUser(userId, 'points:earned', {
    userId,  // ✅ NEW: Include userId
    points,
    reason,
    type: 'points_earned',  // ✅ NEW: Add type
    relatedEntity,
  });
};

export const notifyLevelUp = (userId, newLevel, newRank = null) => {
  // ✅ FIX: Match impactSlice expectations
  emitToUser(userId, 'user:levelup', {
    userId,  // ✅ NEW: Include userId
    newLevel,
    rank: newRank,
    // ❌ REMOVED: timestamp
  });
};

/**
 * Notify community of new member - FIXED PAYLOAD
 */
export const notifyCommunityNewMember = (communityId, user) => {
  // ✅ FIX: Add all necessary fields for socket event
  emitToCommunity(communityId, 'community:member_joined', {
    communityId,  // ✅ NEW: Include communityId
    communityName: null,  // Will be populated by community service if needed
    user: {
      id: user._id,
      name: user.name,
      profileImage: user.profileImage,
    },
    points: 5,  // ✅ NEW: Points awarded for joining
    // ❌ REMOVED: timestamp
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
      timestamp: new Date(), // NOTE: This specific broadcast still has a timestamp, as it's part of the data model.
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

/**
 * ✅ UPDATED: Notify user about community manager approval
 * Now sends community ID instead of application ID
 */
export const notifyCommunityManagerApproved = (userId, communityName, communityId) => {
  emitToUser(userId, 'community_manager:approved', {
    communityName,
    communityId, // ✅ NEW: Link to actual community
    message: `🎉 Congratulations! You've been approved as a community manager!`,
    successMessage: `Your community "${communityName}" is now live and verified!`,
    action: {
      label: 'View Your Community',
      link: `/communities/${communityId}`, // ✅ UPDATED: Direct to community
    },
    nextSteps: [
      'Edit your community details',
      'Add a community image',
      'Invite members',
      'Create your first event!',
    ],
  });
};

/**
 * Notify user about community manager rejection
 */
export const notifyCommunityManagerRejected = (userId, communityName, reason) => {
  emitToUser(userId, 'community_manager:rejected', {
    communityName,
    reason,
    message: `Your community manager application for "${communityName}" was not approved.`,
    feedback: reason,
    canReapply: true,
    reapplyAfterDays: 30,
    action: {
      label: 'View Application',
      link: `/community-manager/my-application`,
    },
  });
};

/**
 * ✅ UPDATED: Notify admins of new community manager application
 */
export const notifyAdminsNewCommunityManagerApplication = (
  applicantName,
  communityName,
  applicationId
) => {
  emitToAdmins('admin:new_community_manager_application', {
    applicantName,
    communityName,
    applicationId,
    message: `New community manager application from ${applicantName} for "${communityName}"`,
    action: {
      label: 'Review Application',
      link: `/admin/community-manager-applications/${applicationId}`,
    },
  });
};

export default {
  // Basic emitters
  emitToUser,
  emitToCommunity,
  emitToEvent,
  emitToAdmins,
  broadcastToAll,
  // Specific notifications
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
  notifyCommunityManagerApproved,
  notifyCommunityManagerRejected,
  notifyAdminsNewCommunityManagerApplication,
};