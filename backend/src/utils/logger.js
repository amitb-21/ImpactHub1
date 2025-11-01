import { config } from '../config/env.js';

const isDev = config.NODE_ENV === 'development';

export const logger = {
  info: (message, data = '') => {
    if (isDev) {
      console.log(`ℹ️  [INFO] ${message}`, data);
    }
  },

  error: (message, error = '') => {
    console.error(`❌ [ERROR] ${message}`, error instanceof Error ? error.message : error);
  },

  warn: (message, data = '') => {
    console.warn(`⚠️  [WARN] ${message}`, data);
  },

  success: (message, data = '') => {
    console.log(`✅ [SUCCESS] ${message}`, data);
  },

  debug: (message, data = '') => {
    // Only show debug logs if DEBUG=true is set
    if (isDev && process.env.DEBUG === 'true') {
      console.log(`🐛 [DEBUG] ${message}`, data);
    }
  },

  request: (method, endpoint, status = '') => {
    // Suppress request logs unless DEBUG=true
    if (isDev && process.env.DEBUG === 'true') {
      console.log(`📡 [${method}] ${endpoint} ${status ? `[${status}]` : ''}`);
    }
  },
};

export default logger;