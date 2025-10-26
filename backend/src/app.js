import express from 'express';
import passport from 'passport';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
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
import resourceRoutes from './routes/resourceRoutes.js';
import realtimeRoutes from './routes/realtimeRoutes.js';
import communityManagerRoutes from './routes/communityManagerRoutes.js';

// Middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';

const app = express();

// =====================
// SECURITY MIDDLEWARE (First!)
// =====================
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(mongoSanitize());
app.use(xss());

// =====================
// CORS CONFIGURATION
// =====================
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// =====================
// BODY PARSING
// =====================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// =====================
// SESSION CONFIGURATION
// =====================
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'impacthub-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    },
  })
);

// =====================
// PASSPORT AUTHENTICATION
// =====================
app.use(passport.initialize());
app.use(passport.session());

// =====================
// RATE LIMITING
// =====================
app.use('/auth', rateLimiter);

// =====================
// HEALTH CHECK
// =====================
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'ImpactHub API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// =====================
// API ROUTES
// =====================
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/communities', communityRoutes);
app.use('/events', eventRoutes);
app.use('/activities', activityRoutes);
app.use('/impact', impactRoutes);
app.use('/ratings', ratingRoutes);
app.use('/verifications', verificationRoutes);
app.use('/participations', participationRoutes);
app.use('/event-photos', eventPhotoRoutes);
app.use('/location', locationCalendarRoutes);
app.use('/points', pointsRoutes);
app.use('/resources', resourceRoutes);
app.use('/realtime', realtimeRoutes);

// ADMIN ROUTES (Must be separate for security)
app.use('/admin', adminRoutes);

// COMMUNITY MANAGER APPLICATION ROUTES
app.use('/community-manager', communityManagerRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;