import { createServer } from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';
import { initializeSocket } from './config/socket.js';
import { startEventReminderService, stopEventReminderService } from './services/eventReminderService.js';
import { logger } from './utils/logger.js';

const PORT = config.PORT;

// ✅ Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function start() {
  try {
    logger.info(`Starting ImpactHub server in ${config.NODE_ENV} mode`);

    // ✅ Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      logger.info(`📁 Created uploads directory: ${uploadsDir}`);
    } else {
      logger.info(`📁 Uploads directory exists: ${uploadsDir}`);
    }

    // Connect to MongoDB
    await connectDB();
    logger.success('✅ Connected to MongoDB');

    // Create HTTP server
    const httpServer = createServer(app);
    logger.info('✅ HTTP server created');

    // Initialize Socket.IO
    initializeSocket(httpServer);
    logger.success('✅ Socket.IO initialized');

    // Start event reminder service (checks every 15 minutes)
    if (config.NODE_ENV !== 'test') {
      startEventReminderService();
      logger.info('✅ Event reminder service started');
    }

    // Start server
    httpServer.listen(PORT, () => {
      logger.success(`🚀 Server running on http://localhost:${PORT}`);
      logger.success(`🔌 WebSocket ready on ws://localhost:${PORT}`);
      logger.info(`📡 Client URL: ${config.CLIENT_URL}`);
      logger.info(`📁 Uploads URL: http://localhost:${PORT}/uploads`);
    });

    // Graceful shutdown
    const shutdown = () => {
      logger.warn('Shutting down gracefully...');
      
      // Stop reminder service
      stopEventReminderService();
      logger.info('Event reminder service stopped');
      
      httpServer.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });

      // Force close after 10 seconds
      setTimeout(() => {
        logger.error('Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (err) {
    logger.error('Failed to start server', err);
    console.error(err);
    process.exit(1);
  }
}

start();