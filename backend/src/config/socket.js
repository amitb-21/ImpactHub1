import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: config.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        logger.warn('Socket connection attempt without token');
        return next();
      }

      const decoded = jwt.verify(token, config.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userEmail = decoded.email;
      
      logger.success(`Socket authenticated: ${socket.userId}`);
      next();
    } catch (error) {
      logger.error('Socket authentication failed', error);
      next();
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id} (User: ${socket.userId || 'Guest'})`);

    // Join user's personal room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
      logger.debug(`User ${socket.userId} joined personal room`);
    }

    // Join community room
    socket.on('join:community', (communityId) => {
      if (!communityId) return;
      socket.join(`community:${communityId}`);
      logger.debug(`Socket ${socket.id} joined community:${communityId}`);
    });

    // Leave community room
    socket.on('leave:community', (communityId) => {
      if (!communityId) return;
      socket.leave(`community:${communityId}`);
      logger.debug(`Socket ${socket.id} left community:${communityId}`);
    });

    // Join event room
    socket.on('join:event', (eventId) => {
      if (!eventId) return;
      socket.join(`event:${eventId}`);
      logger.debug(`Socket ${socket.id} joined event:${eventId}`);
    });

    // Leave event room
    socket.on('leave:event', (eventId) => {
      if (!eventId) return;
      socket.leave(`event:${eventId}`);
      logger.debug(`Socket ${socket.id} left event:${eventId}`);
    });

    // Admin room
    socket.on('join:admin', async () => {
      if (!socket.userId) return;
      
      try {
        const User = (await import('../models/User.js')).default;
        const user = await User.findById(socket.userId);
        
        if (user?.role === 'admin') {
          socket.join('admin');
          logger.success(`Admin ${socket.userId} joined admin room`);
        }
      } catch (error) {
        logger.error('Error joining admin room', error);
      }
    });

    // Leaderboard room
    socket.on('join:leaderboard', () => {
      socket.join('leaderboard');
      logger.debug(`Socket ${socket.id} joined leaderboard room`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });

    socket.on('error', (error) => {
      logger.error('Socket error', error);
    });
  });

  logger.success('✅ Socket.IO initialized');
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocket first.');
  }
  return io;
};

export default { initializeSocket, getIO };