import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import * as socketService from '../services/socketService.js';
import { getIO } from '../config/socket.js';
import { logger } from '../utils/logger.js'; 

const router = express.Router();

// Send test notification
router.post('/test-notification', verifyToken, (req, res) => {
  const { userId, message } = req.body;
  
  socketService.sendSystemNotification(userId, {
    title: 'Test Notification',
    message: message || 'This is a test notification',
    type: 'info',
  });
  
  res.json({ success: true, message: 'Notification sent' });
});

// Get online users count (if needed)
router.get('/online-count', (req, res) => {
  try {
    const io = getIO();
    const sockets = io.sockets.sockets;
    res.json({ 
      success: true, 
      onlineUsers: sockets.size,
    });
  } catch (error) {
    logger.error('Error getting online count', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error getting online count' 
    });
  }
});

export default router;