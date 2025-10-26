// backend/src/server.js - UPDATED
import 'dotenv/config';
import { createServer } from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';
import { initializeSocket } from './config/socket.js';
import { startEventReminderService, stopEventReminderService } from './services/eventReminderService.js';
import { logger } from './utils/logger.js';

const PORT = config.PORT;

async function start() {
  try {
    logger.info(`Starting ImpactHub server in ${config.NODE_ENV} mode`);

    // Connect to MongoDB
    await connectDB();

    // Create HTTP server
    const httpServer = createServer(app);

    // Initialize Socket.IO
    initializeSocket(httpServer);

    // ✅ NEW: Start event reminder service (checks every 15 minutes)
    if (config.NODE_ENV !== 'test') {
      startEventReminderService();
    }

    // Start server
    httpServer.listen(PORT, () => {
      logger.success(`🚀 Server running on http://localhost:${PORT}`);
      logger.success(`🔌 WebSocket ready on ws://localhost:${PORT}`);
      logger.info(`📡 Client URL: ${config.CLIENT_URL}`);
      logger.info(`🔐 JWT Secret configured: ${config.JWT_SECRET ? 'Yes' : 'No'}`);
      logger.info(`🔔 Event reminders: ${config.NODE_ENV !== 'test' ? 'Enabled' : 'Disabled (test mode)'}`);
    });

    // Graceful shutdown
    const shutdown = () => {
      logger.warn('Shutting down gracefully...');
      
      // Stop reminder service
      stopEventReminderService();
      
      httpServer.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forcing shutdown');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
}

start();