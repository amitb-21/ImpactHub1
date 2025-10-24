import User from '../models/User.js';
import ImpactMetric from '../models/ImpactMetric.js';
import { logger } from '../utils/logger.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants.js';
import { config } from '../config/env.js';

// =====================
// LOGIN WITH EMAIL/PASSWORD
// =====================
export const loginUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = req.user.generateJWT();
    const user = req.user.toJSON();

    // Update last login
    await User.findByIdAndUpdate(req.user._id, { lastLogin: new Date() });

    logger.success(`User ${user.email} logged in via email/password`);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user,
    });
  } catch (error) {
    logger.error('Login error', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// =====================
// GOOGLE AUTH CALLBACK
// =====================
export const googleAuthCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed',
      });
    }

    const token = req.user.generateJWT();
    const user = req.user.toJSON();

    logger.success(`User ${user.email} authenticated via Google`);

      // Redirect to frontend with token so client can store it and continue
      const redirectUrl = `${config.CLIENT_URL}/login?token=${encodeURIComponent(token)}`;
      return res.redirect(redirectUrl);
  } catch (error) {
    logger.error('Google auth callback error', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// =====================
// REGISTER USER
// =====================
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, location } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (user) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
      });
    }

    // Create new user
    user = await User.create({
      name,
      email,
      password, // Will be hashed by pre-save middleware
      location,
      points: 0,
      level: 1,
    });

    // Create initial impact metrics
    await ImpactMetric.create({ user: user._id });

    const token = user.generateJWT();

    logger.success(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATED,
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    logger.error('Registration error', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// =====================
// GET CURRENT USER
// =====================
export const getCurrentUser = async (req, res) => {
  try {
    // verifyToken middleware attaches decoded id to req.auth.id
    const userId = req.userId || req.auth?.id;
    const user = await User.findById(userId).select('-googleId');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    res.json({
      success: true,
      user: user.toJSON(),
    });
  } catch (error) {
    logger.error('Error fetching current user', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// =====================
// LOGOUT
// =====================
export const logout = (req, res) => {
  try {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: ERROR_MESSAGES.SERVER_ERROR,
        });
      }

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    });
  } catch (error) {
    logger.error('Logout error', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export default {
  loginUser,
  googleAuthCallback,
  registerUser,
  getCurrentUser,
  logout,
};