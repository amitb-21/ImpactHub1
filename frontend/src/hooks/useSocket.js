import React, { useEffect, useRef, useCallback } from 'react'; // ✅ FIX: Added 'React' import
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
  eventUpdate,
  // ✅ ADDED THESE
  communityManagerApproved,
  communityManagerRejected,
  resourceApproved,
  resourceRejected
} from '../store/slices/notificationSlice';

// ✅ IMPACT SLICE
import { 
  pointsEarned as impactPointsEarned, 
  levelUp as impactLevelUp,
  streakUpdated,
  achievementUnlocked,
  badgeEarned
} from '../store/slices/impactSlice';

// ✅ ACTIVITY SLICE
import { addActivity } from '../store/slices/activitySlice';

// Event Slice
import { updateEventCapacity } from '../store/slices/eventSlice';

/**
 * useSocket Hook - ENHANCED & FIXED
 * Manages WebSocket connection and listeners.
 * Creates a single, persistent socket connection.
 * Re-attaches listeners on re-render to get the latest `dispatch`.
 */

let socketErrorToastShown = false;
const socketRef = React.createRef(null); // ✅ Use React.createRef to persist socket across all hook calls

export const useSocket = () => {
  const dispatch = useDispatch();

  // Initialize socket connection ONCE
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('🔓 No token available for socket connection');
      return;
    }

    // ✅ FIX: Only create the socket if it doesn't exist
    if (!socketRef.current) {
      console.log('🔌 Attempting FIRST socket connection to:', SOCKET_URL);
      
      socketRef.current = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        timeout: 10000
      });
    }

    // This effect handles attaching listeners and depends on `dispatch`
    // It will re-run if dispatch changes (it won't) or in StrictMode,
    // but it will *not* create a new socket.

    const socket = socketRef.current;

    // --- CLEAN UP ALL PREVIOUS LISTENERS ---
    // This prevents duplicate listeners on re-renders
    socket.off('connect');
    socket.off('disconnect');
    socket.off('connect_error');
    socket.off('points:earned');
    socket.off('user:levelup');
    socket.off('user:streak_updated');
    socket.off('user:achievement_unlocked');
    socket.off('user:badge_earned');
    socket.off('activity:created');
    socket.off('community:member_joined');
    socket.off('participation:verified');
    socket.off('participation:rejected');
    socket.off('community:verification_update');
    socket.off('verification_requested');
    socket.off('community_manager:approved'); // ✅ ADDED
    socket.off('community_manager:rejected'); // ✅ ADDED
    socket.off('resource:approved'); // ✅ ADDED
    socket.off('resource:rejected'); // ✅ ADDED
    socket.off('event:new_participant');
    socket.off('event:new_rating');
    socket.off('event:photo_uploaded');
    socket.off('event:capacity_update');
    socket.off('event:update');
    socket.off('event:cancelled');
    socket.off('event:started');
    socket.off('community:verified');
    socket.off('community:updated');
    socket.off('error');

    // --- ATTACH NEW LISTENERS ---

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      console.log('🎯 Ready to receive real-time updates');
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (error) => {
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
    socket.on('points:earned', (data) => {
      console.log('💎 Points earned from socket:', data);
      dispatch(notifyPointsEarned(data));
      dispatch(impactPointsEarned(data));
    });
    socket.on('user:levelup', (data) => {
      console.log('🎉 Level up from socket:', data);
      dispatch(notifyLevelUp(data));
      dispatch(impactLevelUp(data));
      toast.success(`🎉 Congratulations! You reached level ${data.newLevel}!`);
    });
    socket.on('user:streak_updated', (data) => {
      console.log('🔥 Streak updated:', data);
      dispatch(streakUpdated(data));
    });
    socket.on('user:achievement_unlocked', (data) => {
      console.log('🏆 Achievement unlocked:', data);
      dispatch(achievementUnlocked(data));
      toast.success(`🏆 Achievement Unlocked: ${data.achievement?.title || 'New Achievement'}!`);
    });
    socket.on('user:badge_earned', (data) => {
      console.log('🎖️ Badge earned:', data);
      dispatch(badgeEarned(data));
      toast.success(`🎖️ You earned a badge: ${data.badge?.title || 'New Badge'}!`);
    });

    // =====================
    // ACTIVITY EVENTS
    // =====================
    socket.on('activity:created', (data) => {
      console.log('📝 New activity:', data);
      dispatch(addActivity(data));
    });
    socket.on('community:member_joined', (data) => {
      console.log('👥 New community member joined:', data);
      dispatch(newMember(data));
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
    socket.on('participation:verified', (data) => {
      console.log('✅ Attendance verified:', data);
      dispatch(attendanceVerified(data));
      toast.success('Your attendance has been verified!');
    });
    socket.on('participation:rejected', (data) => {
      console.log('❌ Participation rejected:', data);
      dispatch(participationRejected(data));
      toast.error('Your participation was rejected');
    });

    // =====================
    // VERIFICATION EVENTS
    // =====================
    socket.on('community:verification_update', (data) => {
      console.log('🔍 Community verification update:', data);
      dispatch(communityVerification(data));
      if (data.status === 'verified') {
        toast.success('🎉 Your community has been verified!');
      } else if (data.status === 'rejected') {
        toast.error('❌ Your community verification was rejected');
      }
    });
    socket.on('verification_requested', (data) => {
      console.log('🔍 Verification requested:', data);
      dispatch(communityVerification(data));
    });
    
    // ✅ ADDED: Listen for CM application updates
    socket.on('community_manager:approved', (data) => {
      console.log('✅ CM Application approved:', data);
      dispatch(communityManagerApproved(data));
    });
    socket.on('community_manager:rejected', (data) => {
      console.log('❌ CM Application rejected:', data);
      dispatch(communityManagerRejected(data));
    });

    // ✅ ADDED: Listen for Resource updates
    socket.on('resource:approved', (data) => {
      console.log('✅ Resource approved:', data);
      dispatch(resourceApproved(data));
    });
    socket.on('resource:rejected', (data) => {
      console.log('❌ Resource rejected:', data);
      dispatch(resourceRejected(data));
    });

    // =====================
    // EVENT EVENTS
    // =====================
    socket.on('event:new_participant', (data) => {
      console.log('👤 New event participant:', data);
      dispatch(newParticipant(data));
      toast.info(`${data.participantName} joined the event!`);
    });
    socket.on('event:new_rating', (data) => {
      console.log('⭐ New event rating:', data);
      dispatch(newRating(data));
    });
    socket.on('event:photo_uploaded', (data) => {
      console.log('📸 Event photo uploaded:', data);
      dispatch(photoUploaded(data));
    });
    socket.on('event:capacity_update', (data) => {
      console.log('📊 Event capacity update:', data);
      dispatch(updateEventCapacity(data));
      dispatch(capacityUpdate(data));
    });
    socket.on('event:update', (data) => {
      console.log('📅 Event update:', data);
      dispatch(eventUpdate(data));
    });
    socket.on('event:cancelled', (data) => {
      console.log('❌ Event cancelled:', data);
      toast.error(`Event "${data.eventName}" has been cancelled`);
      dispatch(eventUpdate({ ...data, status: 'Cancelled' }));
    });
    socket.on('event:started', (data) => {
      console.log('▶️ Event started:', data);
      toast.success(`Event "${data.eventName}" has started!`);
      dispatch(eventUpdate({ ...data, status: 'Ongoing' }));
    });

    // =====================
    // COMMUNITY EVENTS
    // =====================
    socket.on('community:verified', (data) => {
      console.log('✅ Community verified:', data);
      dispatch(communityVerification(data));
    });
    socket.on('community:updated', (data) => {
      console.log('📝 Community updated:', data);
    });

    // General error handling
    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    // Cleanup: This will run when the component that *first* called useSocket (e.g., App) unmounts
    return () => {
      console.log('🧹 Cleaning up ALL socket listeners...');
      // We only disconnect if the main App component unmounts
      // socket.disconnect();
      // socketRef.current = null;
      
      // ✅ FIX: Just remove listeners, don't disconnect.
      // This ensures that if StrictMode re-mounts, we just re-attach listeners
      // to the *existing* socket.
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('points:earned');
      socket.off('user:levelup');
      socket.off('user:streak_updated');
      socket.off('user:achievement_unlocked');
      socket.off('user:badge_earned');
      socket.off('activity:created');
      socket.off('community:member_joined');
      socket.off('participation:verified');
      socket.off('participation:rejected');
      socket.off('community:verification_update');
      socket.off('verification_requested');
      socket.off('community_manager:approved');
      socket.off('community_manager:rejected');
      socket.off('resource:approved');
      socket.off('resource:rejected');
      socket.off('event:new_participant');
      socket.off('event:new_rating');
      socket.off('event:photo_uploaded');
      socket.off('event:capacity_update');
      socket.off('event:update');
      socket.off('event:cancelled');
      socket.off('event:started');
      socket.off('community:verified');
      socket.off('community:updated');
      socket.off('error');
    };
  }, [dispatch]); // ✅ Run this effect only when `dispatch` changes (which it won't)

  // =====================
  // SOCKET EMIT METHODS
  // =====================
  // These are stable callbacks that can be called from any component
  
  const joinCommunity = useCallback((communityId) => {
    console.log('📢 Emitting join:community:', communityId);
    socketRef.current?.emit('join:community', communityId);
  }, []);

  const leaveCommunity = useCallback((communityId) => {
    console.log('📢 Emitting leave:community:', communityId);
    socketRef.current?.emit('leave:community', communityId);
  }, []);

  const joinEvent = useCallback((eventId) => {
    console.log('📢 Emitting join:event:', eventId);
    socketRef.current?.emit('join:event', eventId);
  }, []);

  const leaveEvent = useCallback((eventId) => {
    console.log('📢 Emitting leave:event:', eventId);
    socketRef.current?.emit('leave:event', eventId);
  }, []);

  const joinAdmin = useCallback(() => {
    console.log('📢 Emitting join:admin');
    socketRef.current?.emit('join:admin');
  }, []);

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