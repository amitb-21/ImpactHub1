import Resource from '../models/Resource.js';
import Activity from '../models/Activity.js';
import { logger } from '../utils/logger.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants.js';
import { parseQueryParams } from '../utils/helpers.js';

/**
 * Get all published resources with filters
 * Regular users only see published resources
 * Admins can see all resources
 */
export const getResources = async (req, res) => {
  try {
    const {
      category,
      type,
      tags,
      search,
      difficulty,
      featured,
      page = 1,
      limit = 10,
      sortBy = 'recent',
    } = req.query;

    const { skip } = parseQueryParams({ page, limit });

    let query = {};

    // ✅ CORRECTED: Only show published resources to non-admins
    if (req.userRole !== 'admin') {
      query.isPublished = true;
    }

    // Filters
    if (category) query.category = category;
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    if (featured === 'true') query.isFeatured = true;

    if (tags) {
      const tagArray = tags.split(',').map((t) => t.trim());
      query.tags = { $in: tagArray };
    }

    // Search
    if (search) {
      query.$text = { $search: search };
    }

    // Sorting
    let sortQuery = { createdAt: -1 };
    if (sortBy === 'popular') sortQuery = { views: -1 };
    if (sortBy === 'liked') sortQuery = { likes: -1 };
    if (sortBy === 'featured') sortQuery = { isFeatured: -1, views: -1 };

    const resources = await Resource.find(query)
      .populate('author', 'name profileImage')
      .select('-content') // Don't send full content in list view
      .sort(sortQuery)
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Resource.countDocuments(query);

    res.json({
      success: true,
      data: resources,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Error fetching resources', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Get single resource by ID
 * Regular users can only see published resources
 * Authors and admins can see their own resources
 */
export const getResourceById = async (req, res) => {
  try {
    const { id } = req.params;

    const resource = await Resource.findById(id)
      .populate('author', 'name profileImage bio')
      .populate('relatedResources', 'title description thumbnailImage category');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    // ✅ CORRECTED: Check if user can access unpublished resource
    if (
      !resource.isPublished &&
      !resource.author._id.equals(req.userId) &&
      req.userRole !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'This resource is not yet published',
      });
    }

    // Increment view count
    await resource.incrementViews();

    res.json({
      success: true,
      resource,
    });
  } catch (error) {
    logger.error('Error fetching resource', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Get featured resources (only published)
 */
export const getFeaturedResources = async (req, res) => {
  try {
    const resources = await Resource.find({
      isFeatured: true,
      isPublished: true,
    })
      .populate('author', 'name profileImage')
      .select('-content')
      .sort({ views: -1 })
      .limit(6);

    res.json({
      success: true,
      data: resources,
    });
  } catch (error) {
    logger.error('Error fetching featured resources', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Get resources by category (only published)
 */
export const getResourcesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const { skip } = parseQueryParams({ page, limit });

    const resources = await Resource.find({
      category,
      isPublished: true,
    })
      .populate('author', 'name profileImage')
      .select('-content')
      .sort({ views: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Resource.countDocuments({ category, isPublished: true });

    res.json({
      success: true,
      data: resources,
      category,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Error fetching resources by category', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Like a resource
 */
export const likeResource = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    // Check if already liked
    if (resource.likedBy.includes(userId)) {
      return res.status(409).json({
        success: false,
        message: 'You already liked this resource',
      });
    }

    // Add like
    resource.likedBy.push(userId);
    resource.likes = resource.likedBy.length;
    await resource.save();

    logger.success(`User ${userId} liked resource ${id}`);

    res.json({
      success: true,
      message: 'Resource liked',
      likes: resource.likes,
    });
  } catch (error) {
    logger.error('Error liking resource', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Unlike a resource
 */
export const unlikeResource = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    // Check if not liked
    if (!resource.likedBy.includes(userId)) {
      return res.status(409).json({
        success: false,
        message: "You haven't liked this resource",
      });
    }

    // Remove like
    resource.likedBy = resource.likedBy.filter((id) => !id.equals(userId));
    resource.likes = resource.likedBy.length;
    await resource.save();

    logger.success(`User ${userId} unliked resource ${id}`);

    res.json({
      success: true,
      message: 'Resource unliked',
      likes: resource.likes,
    });
  } catch (error) {
    logger.error('Error unliking resource', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Search resources (only published)
 */
export const searchResources = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
      });
    }

    const { skip } = parseQueryParams({ page, limit });

    const resources = await Resource.find({
      $text: { $search: q },
      isPublished: true,
    })
      .populate('author', 'name profileImage')
      .select('-content')
      .sort({ score: { $meta: 'textScore' } })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Resource.countDocuments({
      $text: { $search: q },
      isPublished: true,
    });

    res.json({
      success: true,
      data: resources,
      query: q,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Error searching resources', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// =====================
// AUTHOR/ADMIN ENDPOINTS
// =====================

/**
 * Create new resource (starts as unpublished - pending approval)
 * ✅ CORRECTED: Automatically set to isPublished: false
 */
export const createResource = async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      category,
      type,
      tags,
      thumbnailImage,
      downloadUrl,
      videoUrl,
      difficulty,
      estimatedReadTime,
      relatedResources,
    } = req.body;

    const userId = req.userId;

    // ✅ CORRECTED: Create as unpublished (pending admin approval)
    const resource = await Resource.create({
      title,
      description,
      content,
      category,
      type: type || 'article',
      tags: tags || [],
      thumbnailImage,
      downloadUrl,
      videoUrl,
      author: userId,
      difficulty: difficulty || 'Beginner',
      estimatedReadTime: estimatedReadTime || 5,
      relatedResources: relatedResources || [],
      isPublished: false, // ✅ CORRECTED: Pending approval
    });

    // Create activity
    await Activity.create({
      user: userId,
      type: 'resource_created',
      description: `Created resource: ${title} (Pending approval)`,
      relatedEntity: {
        entityType: 'Resource',
        entityId: resource._id,
      },
    });

    logger.success(`Resource created (pending approval): ${resource._id}`);

    const populatedResource = await resource.populate('author', 'name profileImage');

    res.status(201).json({
      success: true,
      message: 'Resource created and submitted for admin approval',
      resource: populatedResource,
    });
  } catch (error) {
    logger.error('Error creating resource', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Update resource (author or admin)
 * If published, requires re-approval to maintain quality
 */
export const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    // Check authorization (author or admin)
    if (!resource.author.equals(userId) && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    const updateData = {};
    const allowedFields = [
      'title',
      'description',
      'content',
      'category',
      'type',
      'tags',
      'thumbnailImage',
      'downloadUrl',
      'videoUrl',
      'difficulty',
      'estimatedReadTime',
      'relatedResources',
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // ✅ CORRECTED: If published resource is updated, set to unpublished for re-approval
    if (resource.isPublished && Object.keys(updateData).length > 0) {
      updateData.isPublished = false;
      logger.info(`Published resource updated - requires re-approval: ${id}`);
    }

    const updated = await Resource.findByIdAndUpdate(id, updateData, {
      new: true,
    }).populate('author', 'name profileImage');

    logger.success(`Resource updated: ${id}`);

    res.json({
      success: true,
      message: resource.isPublished 
        ? 'Resource updated and set to pending approval'
        : SUCCESS_MESSAGES.UPDATED,
      resource: updated,
    });
  } catch (error) {
    logger.error('Error updating resource', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Delete resource (author or admin)
 */
export const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    // Check authorization (author or admin)
    if (!resource.author.equals(userId) && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    await Resource.findByIdAndDelete(id);

    logger.success(`Resource deleted: ${id}`);

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.DELETED,
    });
  } catch (error) {
    logger.error('Error deleting resource', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// =====================
// ADMIN ENDPOINTS
// =====================

/**
 * Get pending resources (admin only)
 * ✅ NEW: View resources awaiting approval
 */
export const getPendingResources = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    const { page = 1, limit = 20 } = req.query;
    const { skip } = parseQueryParams({ page, limit });

    const resources = await Resource.find({ isPublished: false })
      .populate('author', 'name profileImage email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Resource.countDocuments({ isPublished: false });

    res.json({
      success: true,
      data: resources,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error('Error fetching pending resources', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Approve resource (admin only)
 * ✅ NEW: Publish resource after review
 */
export const approveResource = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    const { id } = req.params;
    const { notes } = req.body;

    const resource = await Resource.findByIdAndUpdate(
      id,
      {
        isPublished: true,
        adminApprovedAt: new Date(),
        adminNotes: notes || null,
      },
      { new: true }
    ).populate('author', 'name profileImage');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    // Create activity
    await Activity.create({
      user: req.userId,
      type: 'resource_approved',
      description: `Approved resource: ${resource.title}`,
      relatedEntity: {
        entityType: 'Resource',
        entityId: resource._id,
      },
    });

    logger.success(`Resource approved: ${id}`);

    res.json({
      success: true,
      message: 'Resource approved and published',
      resource,
    });
  } catch (error) {
    logger.error('Error approving resource', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Reject resource (admin only)
 * ✅ NEW: Reject resource with feedback
 */
export const rejectResource = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason || rejectionReason.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required',
      });
    }

    const resource = await Resource.findByIdAndUpdate(
      id,
      {
        isPublished: false,
        rejectionReason,
        rejectedAt: new Date(),
      },
      { new: true }
    ).populate('author', 'name profileImage');

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    // Create activity
    await Activity.create({
      user: req.userId,
      type: 'resource_rejected',
      description: `Rejected resource: ${resource.title}. Reason: ${rejectionReason}`,
      relatedEntity: {
        entityType: 'Resource',
        entityId: resource._id,
      },
    });

    logger.success(`Resource rejected: ${id}`);

    res.json({
      success: true,
      message: 'Resource rejected',
      resource,
    });
  } catch (error) {
    logger.error('Error rejecting resource', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Toggle featured status (admin only)
 */
export const toggleFeatured = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    const { id } = req.params;

    const resource = await Resource.findById(id);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    resource.isFeatured = !resource.isFeatured;
    await resource.save();

    logger.success(`Resource ${id} featured status: ${resource.isFeatured}`);

    res.json({
      success: true,
      message: resource.isFeatured
        ? 'Resource marked as featured'
        : 'Resource removed from featured',
      isFeatured: resource.isFeatured,
    });
  } catch (error) {
    logger.error('Error toggling featured status', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Get resource statistics (admin only)
 */
export const getResourceStats = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    const totalResources = await Resource.countDocuments({ isPublished: true });
    const pendingResources = await Resource.countDocuments({ isPublished: false });
    
    const totalViews = await Resource.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: null, total: { $sum: '$views' } } },
    ]);

    const byCategory = await Resource.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const byType = await Resource.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]);

    const topResources = await Resource.find({ isPublished: true })
      .populate('author', 'name')
      .select('title views likes category')
      .sort({ views: -1 })
      .limit(10);

    res.json({
      success: true,
      stats: {
        totalResources,
        pendingResources,
        totalViews: totalViews[0]?.total || 0,
        byCategory,
        byType,
        topResources,
      },
    });
  } catch (error) {
    logger.error('Error fetching resource stats', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export default {
  getResources,
  getResourceById,
  getFeaturedResources,
  getResourcesByCategory,
  likeResource,
  unlikeResource,
  searchResources,
  createResource,
  updateResource,
  deleteResource,
  getPendingResources,
  approveResource,
  rejectResource,
  toggleFeatured,
  getResourceStats,
};