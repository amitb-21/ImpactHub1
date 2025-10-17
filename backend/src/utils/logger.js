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
    if (isDev) {
      console.log(`✅ [SUCCESS] ${message}`, data);
    }
  },

  debug: (message, data = '') => {
    if (isDev) {
      console.log(`🐛 [DEBUG] ${message}`, data);
    }
  },

  request: (method, endpoint, status = '') => {
    if (isDev) {
      console.log(`📡 [${method}] ${endpoint} ${status ? `[${status}]` : ''}`);
    }
  },
};

export default logger;