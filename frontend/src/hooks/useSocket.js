import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import io from 'socket.io-client';
import { SOCKET_URL } from '../config/constants';
import { toast } from 'react-toastify';

// Notification Slice
import {
  pointsEarned as notifyPointsEarned,
  levelUp as notifyLevelUp,
  attendanceVerified,
  participationRejected,
  communityVerification,
  newParticipant,
  newRating,
  photoUploaded,
  capacityUpdate,
  newMember,
  eventUpdate
} from '../store/slices/notificationSlice';

// ✅ IMPACT SLICE - UPDATED
import { 
  pointsEarned as impactPointsEarned, 
  levelUp as impactLevelUp,
  streakUpdated,
  achievementUnlocked,
  badgeEarned
} from '../store/slices/impactSlice';

// ✅ ACTIVITY SLICE - ADDED
import { addActivity } from '../store/slices/activitySlice';

// Event Slice
import { updateEventCapacity } from '../store/slices/eventSlice';

/**
 * useSocket Hook - ENHANCED
 * Manages WebSocket connection and listens to real-time events
 * Integrates with Redux slices for:
 * - Points and Gamification
 * - Activity Feed
 * - Participation & Events
 * - Communities
 * 
 * Usage:
 * const socket = useSocket();
 * socket?.emit('join:community', communityId);
 * 
 * Socket Emissions:
 * - join:community(communityId)
 * - leave:community(communityId)
 * - join:event(eventId)
 * - leave:event(eventId)
 * - join:admin()
 * - join:leaderboard()
 */
export const useSocket = () => {
  const socketRef = useRef(null);
  const dispatch = useDispatch();

  // Prevent spamming socket-related error toasts
  let socketErrorToastShown = false;

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('🔓 No token available for socket connection');
      return;
    }

    if (socketRef.current?.connected) {
      console.log('🔗 Socket already connected:', socketRef.current.id);
      return;
    }

    // Create socket connection
    console.log('🔌 Attempting socket connection to:', SOCKET_URL);
    
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 10000
    });

    // Connection event
    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected:', socketRef.current.id);
      console.log('🎯 Ready to receive real-time updates');
    });

    // Disconnection event
    socketRef.current.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    // Connection error handler
    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      if (!socketErrorToastShown) {
        socketErrorToastShown = true;
        toast.error(`Socket connection failed: ${error.message}`);
        setTimeout(() => {
          socketErrorToastShown = false;
        }, 30000);
      }
    });

    // =====================
    // POINTS & GAMIFICATION
    // =====================

    // ✅ POINTS EARNED - Real-time update
    socketRef.current.on('points:earned', (data) => {
      console.log('💎 Points earned from socket:', data);
      dispatch(notifyPointsEarned(data)); // Toast notification
      dispatch(impactPointsEarned(data)); // Update impact slice
    });

    // ✅ LEVEL UP - Real-time update
    socketRef.current.on('user:levelup', (data) => {
      console.log('🎉 Level up from socket:', data);
      dispatch(notifyLevelUp(data)); // Toast notification
      dispatch(impactLevelUp(data)); // Update impact slice
      toast.success(`🎉 Congratulations! You reached level ${data.newLevel}!`);
    });

    // ✅ STREAK UPDATED - NEW
    socketRef.current.on('user:streak_updated', (data) => {
      console.log('🔥 Streak updated:', data);
      dispatch(streakUpdated(data));
    });

    // ✅ ACHIEVEMENT UNLOCKED - NEW
    socketRef.current.on('user:achievement_unlocked', (data) => {
      console.log('🏆 Achievement unlocked:', data);
      dispatch(achievementUnlocked(data));
      toast.success(`🏆 Achievement Unlocked: ${data.achievement?.title || 'New Achievement'}!`);
    });

    // ✅ BADGE EARNED - NEW
    socketRef.current.on('user:badge_earned', (data) => {
      console.log('🎖️ Badge earned:', data);
      dispatch(badgeEarned(data));
      toast.success(`🎖️ You earned a badge: ${data.badge?.title || 'New Badge'}!`);
    });

    // =====================
    // ACTIVITY EVENTS - ADDED
    // =====================

    // ✅ ACTIVITY CREATED - NEW
    socketRef.current.on('activity:created', (data) => {
      console.log('📝 New activity:', data);
      dispatch(addActivity(data)); // Add to activity feed
    });

    // ✅ COMMUNITY MEMBER JOINED - ENHANCED
    socketRef.current.on('community:member_joined', (data) => {
      console.log('👥 New community member joined:', data);
      dispatch(newMember(data));
      
      // Also create activity record
      dispatch(addActivity({
        type: 'community_joined',
        description: `Joined community: ${data.communityName}`,
        user: data.user,
        relatedEntity: {
          entityType: 'Community',
          entityId: data.communityId,
          title: data.communityName
        },
        metadata: {
          pointsEarned: data.points || 10
        },
        createdAt: new Date().toISOString()
      }));
    });

    // =====================
    // PARTICIPATION EVENTS
    // =====================

    socketRef.current.on('participation:verified', (data) => {
      console.log('✅ Attendance verified:', data);
      dispatch(attendanceVerified(data));
      toast.success('Your attendance has been verified!');
    });

    socketRef.current.on('participation:rejected', (data) => {
      console.log('❌ Participation rejected:', data);
      dispatch(participationRejected(data));
      toast.error('Your participation was rejected');
    });

    // =====================
    // VERIFICATION EVENTS
    // =====================

    socketRef.current.on('community:verification_update', (data) => {
      console.log('🔍 Community verification update:', data);
      dispatch(communityVerification(data));
      
      if (data.status === 'verified') {
        toast.success('🎉 Your community has been verified!');
      } else if (data.status === 'rejected') {
        toast.error('❌ Your community verification was rejected');
      }
    });

    socketRef.current.on('verification_requested', (data) => {
      console.log('🔍 Verification requested:', data);
      dispatch(communityVerification(data));
    });

    // =====================
    // EVENT EVENTS
    // =====================

    socketRef.current.on('event:new_participant', (data) => {
      console.log('👤 New event participant:', data);
      dispatch(newParticipant(data));
      toast.info(`${data.participantName} joined the event!`);
    });

    socketRef.current.on('event:new_rating', (data) => {
      console.log('⭐ New event rating:', data);
      dispatch(newRating(data));
    });

    socketRef.current.on('event:photo_uploaded', (data) => {
      console.log('📸 Event photo uploaded:', data);
      dispatch(photoUploaded(data));
    });

    socketRef.current.on('event:capacity_update', (data) => {
      console.log('📊 Event capacity update:', data);
      dispatch(updateEventCapacity(data));
      dispatch(capacityUpdate(data));
    });

    socketRef.current.on('event:update', (data) => {
      console.log('📅 Event update:', data);
      dispatch(eventUpdate(data));
    });

    // ✅ EVENT CANCELLED - NEW
    socketRef.current.on('event:cancelled', (data) => {
      console.log('❌ Event cancelled:', data);
      toast.error(`Event "${data.eventName}" has been cancelled`);
      dispatch(eventUpdate({ ...data, status: 'Cancelled' }));
    });

    // ✅ EVENT STARTED - NEW
    socketRef.current.on('event:started', (data) => {
      console.log('▶️ Event started:', data);
      toast.success(`Event "${data.eventName}" has started!`);
      dispatch(eventUpdate({ ...data, status: 'Ongoing' }));
    });

    // =====================
    // COMMUNITY EVENTS
    // =====================

    socketRef.current.on('community:verified', (data) => {
      console.log('✅ Community verified:', data);
      dispatch(communityVerification(data));
    });

    // ✅ COMMUNITY UPDATED - NEW
    socketRef.current.on('community:updated', (data) => {
      console.log('📝 Community updated:', data);
      // Optionally refetch community if needed
    });

    // General error handling
    socketRef.current.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current?.connected) {
        console.log('🧹 Cleaning up socket connection');
        socketRef.current.disconnect();
      }
    };
  }, [dispatch]);

  // =====================
  // SOCKET EMIT METHODS
  // =====================

  // Join community room
  const joinCommunity = useCallback((communityId) => {
    console.log('📢 Emitting join:community:', communityId);
    socketRef.current?.emit('join:community', communityId);
  }, []);

  // Leave community room
  const leaveCommunity = useCallback((communityId) => {
    console.log('📢 Emitting leave:community:', communityId);
    socketRef.current?.emit('leave:community', communityId);
  }, []);

  // Join event room
  const joinEvent = useCallback((eventId) => {
    console.log('📢 Emitting join:event:', eventId);
    socketRef.current?.emit('join:event', eventId);
  }, []);

  // Leave event room
  const leaveEvent = useCallback((eventId) => {
    console.log('📢 Emitting leave:event:', eventId);
    socketRef.current?.emit('leave:event', eventId);
  }, []);

  // Join admin room
  const joinAdmin = useCallback(() => {
    console.log('📢 Emitting join:admin');
    socketRef.current?.emit('join:admin');
  }, []);

  // Join leaderboard room
  const joinLeaderboard = useCallback(() => {
    console.log('📢 Emitting join:leaderboard');
    socketRef.current?.emit('join:leaderboard');
  }, []);

  return {
    socket: socketRef.current,
    joinCommunity,
    leaveCommunity,
    joinEvent,
    leaveEvent,
    joinAdmin,
    joinLeaderboard,
    isConnected: socketRef.current?.connected || false
  };
};

export default useSocket;