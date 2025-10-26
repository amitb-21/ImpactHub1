import Community from '../models/Community.js';
import Event from '../models/Event.js';
import Resource from '../models/Resource.js';
import Participation from '../models/Participation.js';
import { logger } from '../utils/logger.js';
import { ERROR_MESSAGES } from '../utils/constants.js';

/**
 * Check if user is moderator or admin
 */
export const isModeratorOrAdmin = (req, res, next) => {
  try {
    if (!req.userRole || !['moderator', 'admin'].includes(req.userRole)) {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        error: 'Only moderators and admins can perform this action',
      });
    }
    next();
  } catch (error) {
    logger.error('Moderator check failed', error);
    res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

/**
 * Check if user is community owner/manager
 * Assumes communityId is in req.params or req.body
 */
export const isCommunityManager = async (req, res, next) => {
  try {
    const communityId = req.params.communityId || req.params.id || req.body.communityId;

    if (!communityId) {
      return res.status(400).json({
        success: false,
        message: 'Community ID is required',
      });
    }

    const community = await Community.findById(communityId);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found',
      });
    }

    // Check ownership (allow admin to override)
    if (!community.createdBy.equals(req.userId) && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        error: 'You must be the community manager to perform this action',
      });
    }

    // Attach community to request
    req.community = community;
    next();
  } catch (error) {
    logger.error('Community manager check failed', error);
    res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

/**
 * Check if user is event owner
 * Assumes eventId is in req.params or req.body
 */
export const isEventOwner = async (req, res, next) => {
  try {
    const eventId = req.params.eventId || req.params.id || req.body.eventId;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required',
      });
    }

    const event = await Event.findById(eventId).populate('community');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check ownership (allow admin to override)
    if (!event.createdBy.equals(req.userId) && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        error: 'You must be the event creator to perform this action',
      });
    }

    // Attach event to request
    req.event = event;
    next();
  } catch (error) {
    logger.error('Event owner check failed', error);
    res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

/**
 * Check if user is resource owner
 * Assumes resourceId is in req.params or req.body
 */
export const isResourceOwner = async (req, res, next) => {
  try {
    const resourceId = req.params.id || req.body.resourceId;

    if (!resourceId) {
      return res.status(400).json({
        success: false,
        message: 'Resource ID is required',
      });
    }

    const resource = await Resource.findById(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Check ownership (allow admin to override)
    if (!resource.author.equals(req.userId) && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
        error: 'You can only modify your own resources',
      });
    }

    // Attach resource to request
    req.resource = resource;
    next();
  } catch (error) {
    logger.error('Resource owner check failed', error);
    res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

/**
 * Check if community is verified
 * Assumes req.community is set by isCommunityManager or passed manually
 */
export const requireVerifiedCommunity = async (req, res, next) => {
  try {
    let community = req.community;

    if (!community) {
      const communityId = req.params.communityId || req.params.id || req.body.communityId;
      if (!communityId) {
        return res.status(400).json({
          success: false,
          message: 'Community ID is required',
        });
      }
      community = await Community.findById(communityId);
    }

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found',
      });
    }

    if (community.verificationStatus !== 'verified') {
      return res.status(400).json({
        success: false,
        message: 'Community must be verified to perform this action',
        currentStatus: community.verificationStatus,
      });
    }

    req.community = community;
    next();
  } catch (error) {
    logger.error('Verified community check failed', error);
    res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

/**
 * Check if user can access participation record
 */
export const canAccessParticipation = async (req, res, next) => {
  try {
    const participationId = req.params.participationId || req.params.id;

    if (!participationId) {
      return res.status(400).json({
        success: false,
        message: 'Participation ID is required',
      });
    }

    const participation = await Participation.findById(participationId).populate('event');

    if (!participation) {
      return res.status(404).json({
        success: false,
        message: 'Participation record not found',
      });
    }

    // User can access if:
    // 1. They are the participant
    // 2. They are the event creator (moderator)
    // 3. They are an admin
    const isParticipant = participation.user.equals(req.userId);
    const isEventCreator = participation.event.createdBy.equals(req.userId);
    const isAdmin = req.userRole === 'admin';

    if (!isParticipant && !isEventCreator && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    req.participation = participation;
    next();
  } catch (error) {
    logger.error('Participation access check failed', error);
    res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

/**
 * Ensure user is verified participant before allowing rating
 */
export const requireVerifiedParticipation = async (req, res, next) => {
  try {
    const { eventId } = req.body;

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required',
      });
    }

    const participation = await Participation.findOne({
      user: req.userId,
      event: eventId,
      status: { $in: ['Attended', 'Completed'] },
    });

    if (!participation) {
      return res.status(400).json({
        success: false,
        message: 'You must attend an event before rating it',
      });
    }

    req.participation = participation;
    next();
  } catch (error) {
    logger.error('Verified participation check failed', error);
    res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

/**
 * Check if resource is approved/published
 * Used for public viewing
 */
export const requirePublishedResource = async (req, res, next) => {
  try {
    const resourceId = req.params.id;

    if (!resourceId) {
      return res.status(400).json({
        success: false,
        message: 'Resource ID is required',
      });
    }

    const resource = await Resource.findById(resourceId);

    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    // Resource must be published, unless user is author or admin
    if (
      !resource.isPublished &&
      !resource.author.equals(req.userId) &&
      req.userRole !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'This resource is not yet published',
      });
    }

    req.resource = resource;
    next();
  } catch (error) {
    logger.error('Published resource check failed', error);
    res.status(500).json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
  }
};

export default {
  isModeratorOrAdmin,
  isCommunityManager,
  isEventOwner,
  isResourceOwner,
  requireVerifiedCommunity,
  canAccessParticipation,
  requireVerifiedParticipation,
  requirePublishedResource,
};