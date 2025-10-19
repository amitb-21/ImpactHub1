import Participation from '../models/Participation.js';
import Event from '../models/Event.js';
import User from '../models/User.js';
import Activity from '../models/Activity.js';
import { awardEventParticipation } from '../services/impactService.js';
import { logger } from '../utils/logger.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, POINTS_CONFIG } from '../utils/constants.js';
import { parseQueryParams } from '../utils/helpers.js';
import * as pointsService from '../services/pointsService.js';

// Save event to wishlist
export const saveEventToWishlist = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId;

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if participation exists (registered)
    let participation = await Participation.findOne({
      user: userId,
      event: eventId,
    });

    if (!participation) {
      // Create new participation with wishlist
      participation = await Participation.create({
        user: userId,
        event: eventId,
        community: event.community,
        status: 'Registered',
        wishlist: {
          isSaved: true,
          savedAt: new Date(),
        },
      });
    } else {
      // Update existing participation
      participation.wishlist.isSaved = true;
      participation.wishlist.savedAt = new Date();
      await participation.save();
    }

    // Create activity record
    await Activity.create({
      user: userId,
      type: 'event_saved',
      description: `Saved event to wishlist: ${event.title}`,
      relatedEntity: {
        entityType: 'Event',
        entityId: eventId,
      },
    });

    logger.success(`User ${userId} saved event ${eventId} to wishlist`);

    res.json({
      success: true,
      message: 'Event saved to wishlist',
      participation: await participation.populate('event', 'title image'),
    });
  } catch (error) {
    logger.error('Error saving event to wishlist', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// Remove event from wishlist
export const removeEventFromWishlist = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.userId;

    const participation = await Participation.findOne({
      user: userId,
      event: eventId,
    });

    if (!participation) {
      return res.status(404).json({
        success: false,
        message: 'Event not found in wishlist',
      });
    }

    participation.wishlist.isSaved = false;
    participation.wishlist.savedAt = null;
    await participation.save();

    logger.success(`User ${userId} removed event ${eventId} from wishlist`);

    res.json({
      success: true,
      message: 'Event removed from wishlist',
    });
  } catch (error) {
    logger.error('Error removing event from wishlist', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// Get user's wishlist
export const getUserWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const { skip } = parseQueryParams({ page, limit });

    const participations = await Participation.find({
      user: userId,
      'wishlist.isSaved': true,
    })
      .populate('event', 'title image startDate location')
      .populate('community', 'name')
      .sort({ 'wishlist.savedAt': -1 })
      .limit(limit)
      .skip(skip);

    const total = await Participation.countDocuments({
      user: userId,
      'wishlist.isSaved': true,
    });

    res.json({
      success: true,
      data: participations,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching user wishlist', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// Mark attendance (community organizer verifies)
export const markAttendance = async (req, res) => {
  try {
    const { participationId } = req.params;
    const { hoursContributed } = req.body;
    const organizerId = req.userId;

    const participation = await Participation.findById(participationId)
      .populate('event')
      .populate('user');

    if (!participation) {
      return res.status(404).json({
        success: false,
        message: 'Participation record not found',
      });
    }

    // Verify that organizer is the event creator
    if (!participation.event.createdBy.equals(organizerId)) {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    // Update participation status
    participation.status = 'Attended';
    participation.verifiedAt = new Date();
    participation.verifiedBy = organizerId;
    participation.hoursContributed = hoursContributed || 0;

    // Calculate points earned
    let pointsEarned = POINTS_CONFIG.EVENT_PARTICIPATED;
    if (hoursContributed > 0) {
      pointsEarned += hoursContributed * POINTS_CONFIG.HOURS_VOLUNTEERED;
    }

    participation.pointsEarned = pointsEarned;
    await participation.save();

    // Award points to user
    const user = await User.findByIdAndUpdate(
      participation.user._id,
      { $inc: { points: pointsEarned } },
      { new: true }
    );

    await pointsService.awardVolunteerEventPoints(
      participation.user._id,
      participation.event._id,
      pointsEarned,
      hoursContributed
    );

    // Create activity record
    await Activity.create({
      user: participation.user._id,
      type: 'event_attended',
      description: `Attended event and earned ${pointsEarned} points`,
      relatedEntity: {
        entityType: 'Event',
        entityId: participation.event._id,
      },
      metadata: {
        pointsEarned,
        hoursContributed: hoursContributed || 0,
      },
    });

    logger.success(
      `Attendance marked for user ${participation.user._id} in event ${participation.event._id}`
    );

    res.json({
      success: true,
      message: 'Attendance verified successfully',
      participation: await participation.populate('user', 'name profileImage'),
    });
  } catch (error) {
    logger.error('Error marking attendance', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// Reject participant (community organizer)
export const rejectParticipant = async (req, res) => {
  try {
    const { participationId } = req.params;
    const { rejectionReason } = req.body;
    const organizerId = req.userId;

    const participation = await Participation.findById(participationId)
      .populate('event');

    if (!participation) {
      return res.status(404).json({
        success: false,
        message: 'Participation record not found',
      });
    }

    // Verify that organizer is the event creator
    if (!participation.event.createdBy.equals(organizerId)) {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    participation.status = 'Rejected';
    participation.rejectionReason = rejectionReason || 'Not specified';
    await participation.save();

    // Remove from event participants
    await Event.findByIdAndUpdate(participation.event._id, {
      $pull: { participants: participation.user },
    });

    // Remove from user's participated events
    await User.findByIdAndUpdate(participation.user, {
      $pull: { eventsParticipated: participation.event._id },
    });

    logger.success(`Participant ${participation.user} rejected from event ${participation.event._id}`);

    res.json({
      success: true,
      message: 'Participant rejected',
      participation,
    });
  } catch (error) {
    logger.error('Error rejecting participant', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// Get pending participants for an event (unverified)
export const getPendingParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const { skip } = parseQueryParams({ page, limit });

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const participants = await Participation.find({
      event: eventId,
      status: 'Registered',
    })
      .populate('user', 'name profileImage email')
      .sort({ createdAt: 1 })
      .limit(limit)
      .skip(skip);

    const total = await Participation.countDocuments({
      event: eventId,
      status: 'Registered',
    });

    res.json({
      success: true,
      data: participants,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching pending participants', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// Get verified participants for an event
export const getVerifiedParticipants = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const { skip } = parseQueryParams({ page, limit });

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const participants = await Participation.find({
      event: eventId,
      status: { $in: ['Attended', 'Completed'] },
    })
      .populate('user', 'name profileImage')
      .populate('verifiedBy', 'name')
      .sort({ verifiedAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await Participation.countDocuments({
      event: eventId,
      status: { $in: ['Attended', 'Completed'] },
    });

    res.json({
      success: true,
      data: participants,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching verified participants', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// Get participation details
export const getParticipationDetails = async (req, res) => {
  try {
    const { participationId } = req.params;

    const participation = await Participation.findById(participationId)
      .populate('user', 'name profileImage email')
      .populate('event', 'title startDate endDate')
      .populate('community', 'name')
      .populate('verifiedBy', 'name');

    if (!participation) {
      return res.status(404).json({
        success: false,
        message: 'Participation record not found',
      });
    }

    res.json({
      success: true,
      participation,
    });
  } catch (error) {
    logger.error('Error fetching participation details', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export default {
  saveEventToWishlist,
  removeEventFromWishlist,
  getUserWishlist,
  markAttendance,
  rejectParticipant,
  getPendingParticipants,
  getVerifiedParticipants,
  getParticipationDetails,
};