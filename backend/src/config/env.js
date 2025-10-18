import dotenv from 'dotenv';

dotenv.config();

export const config = {
  PORT: process.env.PORT || 5050,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/impacthub',
  JWT_SECRET: process.env.JWT_SECRET || 'your-jwt-secret-key-change-in-production',
  SESSION_SECRET: process.env.SESSION_SECRET || 'impacthub-session-secret',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
   CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
   CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

export default config;