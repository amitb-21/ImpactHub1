import express from 'express';
import passport from 'passport';
import * as authController from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=true`,
    session: false,
  }),
  authController.googleAuthCallback
);

// Manual registration
router.post('/register', authController.registerUser);

// Get current user
router.get('/me', verifyToken, authController.getCurrentUser);

// Logout
router.post('/logout', verifyToken, authController.logout);

export default router;