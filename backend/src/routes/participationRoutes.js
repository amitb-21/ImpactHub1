import express from 'express';
import * as participationController from '../controllers/participationController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validator.js';

const router = express.Router();

// Wishlist endpoints
router.post('/:eventId/wishlist/save', verifyToken, validateId('eventId'), participationController.saveEventToWishlist);

router.delete('/:eventId/wishlist/remove', verifyToken, validateId('eventId'), participationController.removeEventFromWishlist);

router.get('/wishlist/:userId', validateId('userId'), validatePagination, participationController.getUserWishlist);

// Attendance verification (event organizer)
router.post('/:participationId/mark-attended', verifyToken, validateId('participationId'), participationController.markAttendance);

// Reject participant (event organizer)
router.post('/:participationId/reject', verifyToken, validateId('participationId'), participationController.rejectParticipant);

// Get pending/unverified participants for an event
router.get('/event/:eventId/pending', validateId('eventId'), validatePagination, participationController.getPendingParticipants);

// Get verified/attended participants for an event
router.get('/event/:eventId/verified', validateId('eventId'), validatePagination, participationController.getVerifiedParticipants);

// Get participation details
router.get('/:participationId', validateId('participationId'), participationController.getParticipationDetails);

export default router;