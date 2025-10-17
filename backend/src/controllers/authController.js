import User from '../models/User.js';
import ImpactMetric from '../models/ImpactMetric.js';
import { logger } from '../utils/logger.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants.js';

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

    res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user,
    });
  } catch (error) {
    logger.error('Google auth callback error', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, location } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required',
      });
    }

    let user = await User.findOne({ email });

    if (user) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
      });
    }

    user = await User.create({
      name,
      email,
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

export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-googleId');

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
  googleAuthCallback,
  registerUser,
  getCurrentUser,
  logout,
};