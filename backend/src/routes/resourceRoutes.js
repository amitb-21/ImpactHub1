import express from 'express';
import * as resourceController from '../controllers/resourceController.js';
import { verifyToken, isAdmin } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validator.js';
import { validateCreateResource, validateUpdateResource } from '../middleware/resourceValidator.js';

const router = express.Router();

// Get featured resources (public)
router.get('/featured', resourceController.getFeaturedResources);

// Get pending resources (admin only)
router.get(
  '/admin/pending',
  verifyToken,
  isAdmin,
  validatePagination,
  resourceController.getPendingResources
);

// Get resource stats (admin only)
router.get(
  '/admin/stats',
  verifyToken,
  isAdmin,
  resourceController.getResourceStats
);

// Search resources (public)
router.get('/search', validatePagination, resourceController.searchResources);

// Get resources by category (public)
router.get(
  '/category/:category',
  validatePagination,
  resourceController.getResourcesByCategory
);

// Get all resources (public)
router.get('/', validatePagination, resourceController.getResources);

// Get single resource by ID
router.get('/:id', validateId('id'), resourceController.getResourceById);

// Like/Unlike resource
router.post('/:id/like', verifyToken, validateId('id'), resourceController.likeResource);
router.post('/:id/unlike', verifyToken, validateId('id'), resourceController.unlikeResource);

// Create resource (user - unpublished initially)
router.post('/', verifyToken, validateCreateResource, resourceController.createResource);

// Approve resource (admin)
router.post(
  '/:id/approve',
  verifyToken,
  isAdmin,
  validateId('id'),
  resourceController.approveResource
);

// Reject resource (admin)
router.post(
  '/:id/reject',
  verifyToken,
  isAdmin,
  validateId('id'),
  resourceController.rejectResource
);

// Update resource
router.put(
  '/:id',
  verifyToken,
  validateId('id'),
  validateUpdateResource,
  resourceController.updateResource
);

// Delete resource
router.delete('/:id', verifyToken, validateId('id'), resourceController.deleteResource);

// Toggle featured (admin)
router.post(
  '/:id/feature',
  verifyToken,
  isAdmin,
  validateId('id'),
  resourceController.toggleFeatured
);

export default router;
