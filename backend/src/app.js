import express from 'express';
import passport from 'passport';
import session from 'express-session';
import cors from 'cors';
import './config/passport.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import impactRoutes from './routes/impactRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import verificationRoutes from './routes/verificationRoutes.js';
import participationRoutes from './routes/participationRoutes.js';
import eventPhotoRoutes from './routes/eventPhotoRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import locationCalendarRoutes from './routes/locationCalendarRoutes.js';
import pointsRoutes from './routes/pointsRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js'; // ✅ NEW
import realtimeRoutes from './routes/realtimeRoutes.js';

// Middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'impacthub-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

// Passport authentication
app.use(passport.initialize());
app.use(passport.session());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/communities', communityRoutes);
app.use('/events', eventRoutes);
app.use('/activities', activityRoutes);
app.use('/impact', impactRoutes);
app.use('/ratings', ratingRoutes);
app.use('/admin', adminRoutes);
app.use('/verifications', verificationRoutes);
app.use('/participations', participationRoutes);
app.use('/event-photos', eventPhotoRoutes);
app.use('/location', locationCalendarRoutes);
app.use('/points', pointsRoutes);
app.use('/resources', resourceRoutes); // ✅ NEW
app.use('/realtime', realtimeRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;