import express from 'express';
import passport from 'passport';
import session from 'express-session';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
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

// ✅ Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =====================
// SECURITY MIDDLEWARE (First!)
// =====================
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// =====================
// CORS CONFIGURATION - ✅ FIXED
// =====================
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-JSON-Response-Size'],
  optionsSuccessStatus: 200,
};

// ✅ Apply CORS globally (NOT using app.options('*', ...))
app.use(cors(corsOptions));

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

// ✅ CRITICAL: Serve static files (uploads folder) with proper CORS headers
const uploadsPath = path.join(__dirname, '../uploads');

// ✅ FIX: Add CORS headers middleware for uploads BEFORE serving static files
app.use('/uploads', (req, res, next) => {
  // Allow cross-origin requests for images
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Range');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Timing-Allow-Origin', '*');
  
  // Prevent caching issues
  res.header('Cache-Control', 'public, max-age=86400');
  res.header('Pragma', 'public');
  res.header('Expires', new Date(Date.now() + 86400000).toUTCString());
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// ✅ Serve static files from uploads directory
app.use(
  '/uploads',
  express.static(uploadsPath, {
    dotfiles: 'deny',
    index: false,
  })
);

console.log('📁 Serving uploads from:', uploadsPath);

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

// =====================
// ERROR HANDLING (MUST BE LAST!)
// =====================
app.use(notFoundHandler);
app.use(errorHandler);

export default app;