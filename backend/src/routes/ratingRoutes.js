import express from 'express';
import * as ratingController from '../controllers/ratingController.js';
import { verifyToken } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validator.js';

const router = express.Router();

// Create rating (authenticated)
router.post('/', verifyToken, ratingController.createRating);

// Get ratings for an entity
router.get('/', validatePagination, ratingController.getRatings);

// Update rating (owner only)
router.put('/:id', verifyToken, validateId('id'), ratingController.updateRating);

// Delete rating (owner only)
router.delete('/:id', verifyToken, validateId('id'), ratingController.deleteRating);

// Mark rating as helpful/unhelpful
router.post('/:id/helpful', validateId('id'), ratingController.markHelpful);

export default router;