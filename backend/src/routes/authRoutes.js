import express from 'express';
import passport from 'passport';
import * as authController from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// =====================
// GOOGLE OAUTH ROUTES
// =====================

// Initiate Google OAuth
router.get(
  '/google',
  rateLimiter,
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=true`,
    session: false,
  }),
  asyncHandler(authController.googleAuthCallback)
);

// =====================
// EMAIL/PASSWORD ROUTES
// =====================

// Login with email and password
router.post(
  '/login',
  rateLimiter,
  passport.authenticate('local', { session: false }),
  asyncHandler(authController.loginUser)
);

// Register new user
router.post('/register', rateLimiter, asyncHandler(authController.registerUser));

// =====================
// PROTECTED ROUTES
// =====================

// Get current user
router.get('/me', verifyToken, asyncHandler(authController.getCurrentUser));

// Logout
router.post('/logout', verifyToken, asyncHandler(authController.logout));

export default router;