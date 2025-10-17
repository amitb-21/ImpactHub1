import mongoose from 'mongoose';
import { config } from './env.js';

export async function connectDB() {
  try {
    if (!config.MONGO_URI) {
      console.warn('⚠️  MONGO_URI not set; skipping MongoDB connection');
      return null;
    }

    await mongoose.connect(config.MONGO_URI, {
      dbName: 'impacthub',
      serverSelectionTimeoutMS: 5000,
    });

    console.log('✅ Connected to MongoDB successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}

export default connectDB;