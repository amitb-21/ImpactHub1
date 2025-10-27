import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  notifications: [], // Array of notification objects
  unreadCount: 0,
  realtimeEvents: {
    pointsEarned: null,
    levelUp: null,
    attendanceVerified: null,
    participationRejected: null,
    communityVerification: null,
    communityManagerApproved: null,
    communityManagerRejected: null,
    resourceApproved: null,
    resourceRejected: null,
    newParticipant: null,
    newRating: null,
    photoUploaded: null,
    capacityUpdate: null,
    newMember: null,
    eventUpdate: null
  }
};

// Slice
const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    // =====================
    // BASIC OPERATIONS
    // =====================

    // Add a new notification to queue
    addNotification: (state, action) => {
      const notification = {
        id: Date.now(),
        timestamp: new Date(),
        ...action.payload
      };
      state.notifications.unshift(notification);
      if (!action.payload.dismissed) {
        state.unreadCount += 1;
      }
    },

    // Remove notification by ID
    removeNotification: (state, action) => {
      const index = state.notifications.findIndex(n => n.id === action.payload);
      if (index !== -1) {
        state.notifications.splice(index, 1);
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    // Clear all notifications
    clearAllNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },

    // Mark notification as read
    markAsRead: (state, action) => {
      const notification = state.notifications.find(n => n.id === action.payload);
      if (notification && !notification.read) {
        notification.read = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },

    // Mark all as read
    markAllAsRead: (state) => {
      state.notifications.forEach(n => (n.read = true));
      state.unreadCount = 0;
    },

    // =====================
    // REAL-TIME SOCKET EVENTS
    // =====================

    // Points earned notification
    pointsEarned: (state, action) => {
      const { points, reason, relatedEntity } = action.payload;
      state.realtimeEvents.pointsEarned = action.payload;
      
      state.notifications.unshift({
        id: Date.now(),
        timestamp: new Date(),
        title: '🎉 Points Earned!',
        message: `You earned ${points} points for ${reason}`,
        type: 'success',
        icon: '⭐',
        read: false,
        relatedEntity
      });
      state.unreadCount += 1;
    },

    // Level up notification
    levelUp: (state, action) => {
      const { level, rank } = action.payload;
      state.realtimeEvents.levelUp = action.payload;
      
      state.notifications.unshift({
        id: Date.now(),
        timestamp: new Date(),
        title: '🚀 Level Up!',
        message: `Congratulations! You reached Level ${level}${rank ? ` (${rank})` : ''}`,
        type: 'success',
        icon: '🏆',
        read: false,
        duration: 5000
      });
      state.unreadCount += 1;
    },

    // Attendance verified notification
    attendanceVerified: (state, action) => {
      const { eventId, points, hours } = action.payload;
      state.realtimeEvents.attendanceVerified = action.payload;
      
      state.notifications.unshift({
        id: Date.now(),
        timestamp: new Date(),
        title: '✅ Attendance Verified!',
        message: `Your attendance has been verified! You earned ${points} points${hours > 0 ? ` (${hours} hours)` : ''}`,
        type: 'success',
        icon: '✓',
        read: false,
        relatedEntity: { entityType: 'Event', entityId }
      });
      state.unreadCount += 1;
    },

    // Participation rejected notification
    participationRejected: (state, action) => {
      const { eventId, reason } = action.payload;
      state.realtimeEvents.participationRejected = action.payload;
      
      state.notifications.unshift({
        id: Date.now(),
        timestamp: new Date(),
        title: '❌ Participation Rejected',
        message: `Your participation was rejected. Reason: ${reason}`,
        type: 'error',
        icon: '✗',
        read: false,
        relatedEntity: { entityType: 'Event', entityId }
      });
      state.unreadCount += 1;
    },

    // Community verification update
    communityVerification: (state, action) => {
      const { communityId, status, message } = action.payload;
      state.realtimeEvents.communityVerification = action.payload;
      
      const statusEmoji = status === 'verified' ? '✅' : status === 'rejected' ? '❌' : '⏳';
      const typeMap = { verified: 'success', rejected: 'error', pending: 'info' };
      
      state.notifications.unshift({
        id: Date.now(),
        timestamp: new Date(),
        title: `${statusEmoji} Community Verification ${status}`,
        message: message || `Your community verification status is now ${status}`,
        type: typeMap[status] || 'info',
        read: false,
        relatedEntity: { entityType: 'Community', entityId: communityId }
      });
      state.unreadCount += 1;
    },

    // ===== NEW: Community Manager Approved =====
    communityManagerApproved: (state, action) => {
      const { communityName, communityId } = action.payload;
      state.realtimeEvents.communityManagerApproved = action.payload;
      
      state.notifications.unshift({
        id: Date.now(),
        timestamp: new Date(),
        title: '🎉 Application Approved!',
        message: `Congratulations! You've been approved as a community manager. Your community "${communityName}" is now live and verified!`,
        type: 'success',
        icon: '🏆',
        read: false,
        duration: 5000,
        relatedEntity: { entityType: 'Community', entityId: communityId },
        action: {
          label: 'View Community',
          link: `/communities/${communityId}`
        }
      });
      state.unreadCount += 1;
    },

    // ===== NEW: Community Manager Rejected =====
    communityManagerRejected: (state, action) => {
      const { communityName, reason } = action.payload;
      state.realtimeEvents.communityManagerRejected = action.payload;
      
      state.notifications.unshift({
        id: Date.now(),
        timestamp: new Date(),
        title: '❌ Application Not Approved',
        message: `Your community manager application for "${communityName}" was not approved.\n\nReason: ${reason}\n\nYou can reapply in 30 days.`,
        type: 'error',
        icon: '📋',
        read: false,
        relatedEntity: { entityType: 'Community', entityName: communityName },
        action: {
          label: 'View Application',
          link: '/community-manager/my-application'
        }
      });
      state.unreadCount += 1;
    },

    // ===== NEW: Resource Approved =====
    resourceApproved: (state, action) => {
      const { resourceId, resourceTitle } = action.payload;
      state.realtimeEvents.resourceApproved = action.payload;
      
      state.notifications.unshift({
        id: Date.now(),
        timestamp: new Date(),
        title: '✅ Resource Published!',
        message: `Your resource "${resourceTitle}" has been approved and published!`,
        type: 'success',
        icon: '📖',
        read: false,
        relatedEntity: { entityType: 'Resource', entityId: resourceId },
        action: {
          label: 'View Resource',
          link: `/resources/${resourceId}`
        }
      });
      state.unreadCount += 1;
    },

    // ===== NEW: Resource Rejected =====
    resourceRejected: (state, action) => {
      const { resourceId, resourceTitle, reason } = action.payload;
      state.realtimeEvents.resourceRejected = action.payload;
      
      state.notifications.unshift({
        id: Date.now(),
        timestamp: new Date(),
        title: '❌ Resource Rejected',
        message: `Your resource "${resourceTitle}" was not approved.\n\nReason: ${reason}`,
        type: 'error',
        icon: '📋',
        read: false,
        relatedEntity: { entityType: 'Resource', entityId: resourceId }
      });
      state.unreadCount += 1;
    },

    // New event participant notification
    newParticipant: (state, action) => {
      const { eventId, participant } = action.payload;
      state.realtimeEvents.newParticipant = action.payload;
      
      state.notifications.unshift({
        id: Date.now(),
        timestamp: new Date(),
        title: '👥 New Participant',
        message: `${participant.name} joined your event`,
        type: 'info',
        icon: '👤',
        read: false,
        relatedEntity: { entityType: 'Event', entityId }
      });
      state.unreadCount += 1;
    },

    // New rating notification
    newRating: (state, action) => {
      const { entityType, entityId, rating } = action.payload;
      state.realtimeEvents.newRating = action.payload;
      
      state.notifications.unshift({
        id: Date.now(),
        timestamp: new Date(),
        title: '⭐ New Rating',
        message: `Your ${entityType.toLowerCase()} received a ${rating.rating}-star rating${rating.review ? ': ' + rating.review.substring(0, 50) + '...' : ''}`,
        type: 'info',
        icon: '⭐',
        read: false,
        relatedEntity: { entityType, entityId }
      });
      state.unreadCount += 1;
    },

    // Photo uploaded notification
    photoUploaded: (state, action) => {
      const { eventId } = action.payload;
      state.realtimeEvents.photoUploaded = action.payload;
      
      state.notifications.unshift({
        id: Date.now(),
        timestamp: new Date(),
        title: '📸 Photo Uploaded',
        message: 'A new photo has been added to your event',
        type: 'info',
        icon: '📷',
        read: false,
        relatedEntity: { entityType: 'Event', entityId }
      });
      state.unreadCount += 1;
    },

    // Event capacity update
    capacityUpdate: (state, action) => {
      const { eventId, registered, available, isFull } = action.payload;
      state.realtimeEvents.capacityUpdate = action.payload;
      
      if (isFull) {
        state.notifications.unshift({
          id: Date.now(),
          timestamp: new Date(),
          title: '🔴 Event Full',
          message: `Your event has reached maximum capacity (${registered}/${registered + available})`,
          type: 'warning',
          icon: '🔴',
          read: false,
          relatedEntity: { entityType: 'Event', entityId }
        });
        state.unreadCount += 1;
      }
    },

    // New community member notification
    newMember: (state, action) => {
      const { communityId, user } = action.payload;
      state.realtimeEvents.newMember = action.payload;
      
      state.notifications.unshift({
        id: Date.now(),
        timestamp: new Date(),
        title: '👥 New Community Member',
        message: `${user.name} joined your community`,
        type: 'info',
        icon: '👤',
        read: false,
        relatedEntity: { entityType: 'Community', entityId: communityId }
      });
      state.unreadCount += 1;
    },

    // Event update notification
    eventUpdate: (state, action) => {
      const { eventId, updateType, data } = action.payload;
      state.realtimeEvents.eventUpdate = action.payload;
      
      const updateMessages = {
        status_changed: 'Event status has changed',
        details_updated: 'Event details have been updated',
        cancelled: 'Event has been cancelled',
        time_changed: 'Event time has been changed'
      };
      
      state.notifications.unshift({
        id: Date.now(),
        timestamp: new Date(),
        title: 'ℹ️ Event Update',
        message: updateMessages[updateType] || 'Event has been updated',
        type: 'info',
        read: false,
        relatedEntity: { entityType: 'Event', entityId: eventId }
      });
      state.unreadCount += 1;
    },

    // System notification (generic)
    systemNotification: (state, action) => {
      const { title, message, type = 'info', icon } = action.payload;
      
      state.notifications.unshift({
        id: Date.now(),
        timestamp: new Date(),
        title: title || 'Notification',
        message: message || '',
        type: type,
        icon: icon || '📢',
        read: false
      });
      state.unreadCount += 1;
    },

    // Error notification
    errorNotification: (state, action) => {
      state.notifications.unshift({
        id: Date.now(),
        timestamp: new Date(),
        title: '❌ Error',
        message: action.payload || 'An error occurred',
        type: 'error',
        icon: '❌',
        read: false
      });
      state.unreadCount += 1;
    },

    // Clear real-time event
    clearRealtimeEvent: (state, action) => {
      const eventKey = action.payload;
      if (state.realtimeEvents[eventKey]) {
        state.realtimeEvents[eventKey] = null;
      }
    }
  }
});

// ===== EXPORTS =====

export const {
  addNotification,
  removeNotification,
  clearAllNotifications,
  markAsRead,
  markAllAsRead,
  pointsEarned,
  levelUp,
  attendanceVerified,
  participationRejected,
  communityVerification,
  communityManagerApproved,
  communityManagerRejected,
  resourceApproved,
  resourceRejected,
  newParticipant,
  newRating,
  photoUploaded,
  capacityUpdate,
  newMember,
  eventUpdate,
  systemNotification,
  errorNotification,
  clearRealtimeEvent
} = notificationSlice.actions;

export default notificationSlice.reducer;