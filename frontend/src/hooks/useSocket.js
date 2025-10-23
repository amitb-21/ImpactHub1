import { useEffect, useRef, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import io from 'socket.io-client';
import { SOCKET_URL } from '../config/constants';
import {
  pointsEarned,
  levelUp,
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
import { updateEventCapacity } from '../store/slices/eventSlice';

/**
 * useSocket Hook
 * Manages WebSocket connection and listens to real-time events
 * 
 * Usage:
 * const socket = useSocket();
 * socket?.emit('join:community', communityId);
 * 
 * Emits:
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

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token || socketRef.current?.connected) {
      return;
    }

    // Create socket connection
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Connection event
    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected:', socketRef.current.id);
    });

    // Disconnection event
    socketRef.current.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    // =====================
    // POINTS & GAMIFICATION
    // =====================

    socketRef.current.on('points:earned', (data) => {
      dispatch(pointsEarned(data));
    });

    socketRef.current.on('user:levelup', (data) => {
      dispatch(levelUp(data));
    });

    // =====================
    // PARTICIPATION EVENTS
    // =====================

    socketRef.current.on('participation:verified', (data) => {
      dispatch(attendanceVerified(data));
    });

    socketRef.current.on('participation:rejected', (data) => {
      dispatch(participationRejected(data));
    });

    // =====================
    // VERIFICATION EVENTS
    // =====================

    socketRef.current.on('community:verification_update', (data) => {
      dispatch(communityVerification(data));
    });

    // =====================
    // EVENT EVENTS
    // =====================

    socketRef.current.on('event:new_participant', (data) => {
      dispatch(newParticipant(data));
    });

    socketRef.current.on('event:new_rating', (data) => {
      dispatch(newRating(data));
    });

    socketRef.current.on('event:photo_uploaded', (data) => {
      dispatch(photoUploaded(data));
    });

    socketRef.current.on('event:capacity_update', (data) => {
      dispatch(updateEventCapacity(data));
      dispatch(capacityUpdate(data));
    });

    socketRef.current.on('event:update', (data) => {
      dispatch(eventUpdate(data));
    });

    // =====================
    // COMMUNITY EVENTS
    // =====================

    socketRef.current.on('community:member_joined', (data) => {
      dispatch(newMember(data));
    });

    socketRef.current.on('community:verified', (data) => {
      dispatch(communityVerification(data));
    });

    // Error handling
    socketRef.current.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current?.connected) {
        socketRef.current.disconnect();
      }
    };
  }, [dispatch]);

  // Methods to join/leave rooms
  const joinCommunity = useCallback((communityId) => {
    socketRef.current?.emit('join:community', communityId);
  }, []);

  const leaveCommunity = useCallback((communityId) => {
    socketRef.current?.emit('leave:community', communityId);
  }, []);

  const joinEvent = useCallback((eventId) => {
    socketRef.current?.emit('join:event', eventId);
  }, []);

  const leaveEvent = useCallback((eventId) => {
    socketRef.current?.emit('leave:event', eventId);
  }, []);

  const joinAdmin = useCallback(() => {
    socketRef.current?.emit('join:admin');
  }, []);

  const joinLeaderboard = useCallback(() => {
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