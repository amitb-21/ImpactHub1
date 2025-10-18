import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { config } from '../config/env.js';
import { ERROR_MESSAGES } from '../utils/constants.js';
import { logger } from '../utils/logger.js';

export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    logger.error('Token verification failed', error);
    return res.status(401).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_TOKEN,
    });
  }
};

export const isAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }

    const decoded = jwt.verify(token, config.JWT_SECRET);
    req.userId = decoded.id;
    req.userEmail = decoded.email;

    // Fetch user and check role
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    req.userRole = user.role;
    next();
  } catch (error) {
    logger.error('Admin verification failed', error);
    return res.status(403).json({
      success: false,
      message: ERROR_MESSAGES.UNAUTHORIZED,
    });
  }
};

export const optional = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      req.userId = decoded.id;
      req.userEmail = decoded.email;
    }
    next();
  } catch (error) {
    next(); // Continue without auth
  }
};

export default { verifyToken, isAdmin, optional };