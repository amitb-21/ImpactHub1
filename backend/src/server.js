import 'dotenv/config';
import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';
import { logger } from './utils/logger.js';

const PORT = config.PORT;

async function start() {
  try {
    logger.info(`Starting ImpactHub server in ${config.NODE_ENV} mode`);

    // Connect to MongoDB
    await connectDB();

    // Start server
    app.listen(PORT, () => {
      logger.success(`🚀 Server running on http://localhost:${PORT}`);
      logger.info(`📡 Client URL: ${config.CLIENT_URL}`);
      logger.info(`🔐 JWT Secret configured: ${config.JWT_SECRET ? 'Yes' : 'No'}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.warn('SIGTERM signal received: closing HTTP server');
      process.exit(0);
    });

    process.on('SIGINT', () => {
      logger.warn('SIGINT signal received: closing HTTP server');
      process.exit(0);
    });
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
}

start();