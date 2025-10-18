import express from 'express';
import * as adminController from '../controllers/adminController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validator.js';

const router = express.Router();

// Apply admin middleware to all admin routes
router.use(verifyToken, isAdmin);

// =====================
// USER MANAGEMENT
// =====================

// Get all users
router.get('/users', validatePagination, adminController.getAllUsers);

// Get user details
router.get('/users/:userId', validateId('userId'), adminController.getUserDetails);

// Update user role
router.put('/users/:userId/role', validateId('userId'), adminController.updateUserRole);

// Deactivate user
router.post('/users/:userId/deactivate', validateId('userId'), adminController.deactivateUser);

// Reactivate user
router.post('/users/:userId/reactivate', validateId('userId'), adminController.reactivateUser);

// =====================
// COMMUNITY MANAGEMENT
// =====================

// Get all communities
router.get('/communities', validatePagination, adminController.getAllCommunities);

// Get community analytics
router.get('/communities/:communityId/analytics', validateId('communityId'), adminController.getCommunityAnalytics);

// Deactivate community
router.post('/communities/:communityId/deactivate', validateId('communityId'), adminController.deactivateCommunity);

// Reactivate community
router.post('/communities/:communityId/reactivate', validateId('communityId'), adminController.reactivateCommunity);

// =====================
// COMMUNITY MANAGER (for event creators)
// =====================

// Get event participants (detailed)
router.get('/events/:eventId/participants', validateId('eventId'), validatePagination, adminController.getEventParticipantsDetailed);

// Export participants to CSV
router.get('/events/:eventId/participants/export/csv', validateId('eventId'), adminController.exportParticipantsCSV);

// =====================
// ANALYTICS & DASHBOARD
// =====================

// Get dashboard stats
router.get('/dashboard', adminController.getDashboardStats);

// Get system analytics
router.get('/analytics', adminController.getSystemAnalytics);

export default router;