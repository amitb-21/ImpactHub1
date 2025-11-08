import mongoose from 'mongoose';
import Rating from '../models/Rating.js';
import User from '../models/User.js';
import Participation from '../models/Participation.js';
import Community from '../models/Community.js';
import Event from '../models/Event.js';
import Activity from '../models/Activity.js';
import { logger } from '../utils/logger.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants.js';
import { parseQueryParams } from '../utils/helpers.js';
import * as socketService from '../services/socketService.js';

export const createRating = async (req, res) => {
  try {
    const { entityType, entityId, rating, review } = req.body;
    const userId = req.userId;

    // Validate rating value
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    // Check if entity exists
    const entity = await (entityType === 'Community' ? Community : Event).findById(entityId);
    if (!entity) {
      return res.status(404).json({
        success: false,
        message: `${entityType} not found`,
      });
    }

    // Check if user is verified participant
    let isVerifiedParticipant = false;
    if (entityType === 'Event') {
      const participation = await Participation.findOne({
        user: userId,
        event: entityId,
        status: { $in: ['Attended', 'Completed'] },
      });
      isVerifiedParticipant = !!participation;
    } else if (entityType === 'Community') {
      // User must be member of community or have attended events
      const isMember = entity.members.includes(userId);
      const hasAttended = await Participation.findOne({
        user: userId,
        community: entityId,
        status: { $in: ['Attended', 'Completed'] },
      });
      isVerifiedParticipant = isMember || !!hasAttended;
    }

    // Check if user already rated
    const existingRating = await Rating.findOne({
      ratedBy: userId,
      'ratedEntity.entityType': entityType,
      'ratedEntity.entityId': entityId,
    });

    if (existingRating) {
      return res.status(409).json({
        success: false,
        message: 'You have already rated this ' + entityType.toLowerCase(),
      });
    }

    // ✅ FIXED: Fetch user before socket notification
    const user = await User.findById(userId).select('name profileImage');

    const newRating = await Rating.create({
      ratedBy: userId,
      ratedEntity: {
        entityType,
        entityId,
      },
      rating,
      review: review || null,
      isVerifiedParticipant,
    });

    // ✅ FIXED: Now socket notification has proper user data
    socketService.notifyNewRating(entityType, entityId, {
      rating: newRating.rating,
      review: newRating.review,
      ratedBy: {
        name: user.name,
        profileImage: user.profileImage,
      },
    });

    // Create activity record
    await Activity.create({
      user: userId,
      type: 'rating_created',
      description: `Rated ${entityType.toLowerCase()}: ${rating} stars`,
      relatedEntity: {
        entityType,
        entityId,
      },
      metadata: {
        rating,
      },
    });

    const populatedRating = await newRating.populate('ratedBy', 'name profileImage');

    logger.success(`Rating created by user ${userId} for ${entityType} ${entityId}`);

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATED,
      rating: populatedRating,
    });
  } catch (error) {
    logger.error('Error creating rating', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// ✅ FIXED: Now returns avgRating and totalRatings
export const getRatings = async (req, res) => {
  try {
    const { entityType, entityId, page = 1, limit = 10, sortBy = 'recent' } = req.query;

    if (!entityType || !entityId) {
      return res.status(400).json({
        success: false,
        message: 'entityType and entityId are required',
      });
    }

    const { skip } = parseQueryParams({ page, limit });

    let sortQuery = { createdAt: -1 };
    if (sortBy === 'highest') {
      sortQuery = { rating: -1 };
    } else if (sortBy === 'lowest') {
      sortQuery = { rating: 1 };
    } else if (sortBy === 'helpful') {
      sortQuery = { helpfulCount: -1 };
    }

    const ratings = await Rating.find({
      'ratedEntity.entityType': entityType,
      'ratedEntity.entityId': entityId,
    })
      .populate('ratedBy', 'name profileImage')
      .sort(sortQuery)
      .limit(limit)
      .skip(skip);

    const total = await Rating.countDocuments({
      'ratedEntity.entityType': entityType,
      'ratedEntity.entityId': entityId,
    });

    // ✅ NEW: Calculate average rating from all ratings
    const allRatings = await Rating.find({
      'ratedEntity.entityType': entityType,
      'ratedEntity.entityId': entityId,
    });

    const avgRating = allRatings.length > 0
      ? parseFloat((allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length).toFixed(1))
      : 0;

    const totalRatings = allRatings.length;

    // Calculate rating distribution
    const distribution = await Rating.aggregate([
      {
        $match: {
          'ratedEntity.entityType': entityType,
          'ratedEntity.entityId': new mongoose.Types.ObjectId(entityId),
        },
      },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    res.json({
      success: true,
      data: ratings,
      distribution,
      avgRating,        // ✅ NEW
      totalRatings,     // ✅ NEW
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching ratings', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const updateRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;
    const userId = req.userId;

    const ratingDoc = await Rating.findById(id);

    if (!ratingDoc) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    if (!ratingDoc.ratedBy.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
      });
    }

    const updateData = {};
    if (rating) updateData.rating = rating;
    if (review !== undefined) updateData.review = review;

    const updated = await Rating.findByIdAndUpdate(id, updateData, { new: true }).populate(
      'ratedBy',
      'name profileImage'
    );

    logger.success(`Rating updated: ${id}`);

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.UPDATED,
      rating: updated,
    });
  } catch (error) {
    logger.error('Error updating rating', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const deleteRating = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const ratingDoc = await Rating.findById(id);

    if (!ratingDoc) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    if (!ratingDoc.ratedBy.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    await Rating.findByIdAndDelete(id);

    logger.success(`Rating deleted: ${id}`);

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.DELETED,
    });
  } catch (error) {
    logger.error('Error deleting rating', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const markHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const { helpful } = req.body;

    const ratingDoc = await Rating.findById(id);

    if (!ratingDoc) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    if (helpful) {
      await Rating.findByIdAndUpdate(id, { $inc: { helpfulCount: 1 } });
    } else {
      await Rating.findByIdAndUpdate(id, { $inc: { unhelpfulCount: 1 } });
    }

    const updated = await Rating.findById(id);

    res.json({
      success: true,
      message: 'Rating marked',
      rating: updated,
    });
  } catch (error) {
    logger.error('Error marking rating helpful', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export default {
  createRating,
  getRatings,
  updateRating,
  deleteRating,
  markHelpful,
};