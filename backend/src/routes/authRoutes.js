
import express from 'express';
import passport from 'passport';
import * as authController from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { rateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Google OAuth routes
router.get('/google', rateLimiter, passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=true`,
    session: false,
  }),
  asyncHandler(authController.googleAuthCallback)
);

// Manual registration
router.post('/register', rateLimiter, asyncHandler(authController.registerUser));

// Get current user
router.get('/me', verifyToken, asyncHandler(authController.getCurrentUser));

// Logout
router.post('/logout', verifyToken, asyncHandler(authController.logout));

export default router;