import express from 'express';
import * as resourceController from '../controllers/resourceController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validator.js';
import { validateCreateResource, validateUpdateResource } from '../middleware/resourceValidator.js';

const router = express.Router();

// Get featured resources (must be before /:id)
router.get('/featured', resourceController.getFeaturedResources);

// Get resource stats (admin only, but must be before /:id)
router.get('/stats', verifyToken, isAdmin, resourceController.getResourceStats);

// Search resources (must be before /:id)
router.get('/search', validatePagination, resourceController.searchResources);

// Get resources by category (must be before /:id)
router.get(
  '/category/:category',
  validatePagination,
  resourceController.getResourcesByCategory
);

// Get all resources with filters
router.get('/', validatePagination, resourceController.getResources);

// Get single resource by ID (must be after specific routes)
router.get('/:id', validateId('id'), resourceController.getResourceById);

// Like/Unlike resource
router.post('/:id/like', verifyToken, validateId('id'), resourceController.likeResource);
router.post('/:id/unlike', verifyToken, validateId('id'), resourceController.unlikeResource);

// Create resource (authenticated users can create)
router.post('/', verifyToken, validateCreateResource, resourceController.createResource);

// Update resource (author or admin only)
router.put('/:id', verifyToken, validateId('id'), validateUpdateResource, resourceController.updateResource);

// Delete resource (author or admin only)
router.delete('/:id', verifyToken, validateId('id'), resourceController.deleteResource);


// Toggle featured status
router.post(
  '/:id/feature',
  verifyToken,
  isAdmin,
  validateId('id'),
  resourceController.toggleFeatured
);

export default router;