import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import app from './app.js';

const PORT = process.env.PORT || 5050;

async function start() {
  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI, { dbName: 'impacthub' });
      console.log('Connected to MongoDB');
    } else {
      console.log('MONGO_URI not set; skipping MongoDB connection');
    }

    app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
