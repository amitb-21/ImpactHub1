import Event from '../models/Event.js';
import Community from '../models/Community.js';
import User from '../models/User.js';
import Participation from '../models/Participation.js';
import Activity from '../models/Activity.js';
import { awardEventCreation, awardEventParticipation } from '../services/impactService.js';
import { logger } from '../utils/logger.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants.js';
import { parseQueryParams } from '../utils/helpers.js';
import * as pointsService from '../services/pointsService.js';

const formatEventWithCapacity = (event) => {
  const eventObj = event.toObject ? event.toObject() : event;
  return {
    ...eventObj,
    capacity: {
      total: event.maxParticipants,
      registered: event.participants.length,
      available: event.maxParticipants ? Math.max(0, event.maxParticipants - event.participants.length) : null,
      isFull: event.isFull(),
      capacityPercentage: event.getCapacityPercentage(),
    },
  };
};

const getSortOrder = (sortBy) => {
  const sortMap = {
    recent: { createdAt: -1 },
    upcoming: { startDate: 1 },
    popular: { 'participants.length': -1 },
    trending: { totalRatings: -1, avgRating: -1 },
    rating: { avgRating: -1 },
    oldest: { createdAt: 1 },
  };
  return sortMap[sortBy] || sortMap.recent;
};

export const getEvents = async (req, res) => {
  try {
    const {
      category,
      community,
      status = 'Upcoming',
      search,
      page = 1,
      limit = 10,
      sortBy = 'recent',
      minRating = 0,
      dateFrom,
      dateTo,
      hasAvailability = false,
      verified = false,
      participantMin = 0,
    } = req.query;

    const { skip } = parseQueryParams({ page, limit });
    let query = {};

    if (category) {
      const validCategories = ['Cleanup', 'Volunteering', 'Education', 'Fundraising', 'Other'];
      if (validCategories.includes(category)) {
        query.category = category;
      }
    }

    if (community) {
      query.community = community;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    if (dateFrom || dateTo) {
      query.startDate = {};
      if (dateFrom) {
        query.startDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.startDate.$lte = new Date(dateTo);
      }
    }

    if (minRating && minRating > 0) {
      query.avgRating = { $gte: parseFloat(minRating) };
    }

    if (verified === 'true') {
      const verifiedCommunities = await Community.find({ verificationStatus: 'verified' }).select('_id');
      const verifiedIds = verifiedCommunities.map(c => c._id);
      query.community = { $in: verifiedIds };
    }

    let events = await Event.find(query)
      .populate('createdBy', 'name profileImage')
      .populate('community', 'name verificationStatus')
      .sort(getSortOrder(sortBy))
      .lean();

    if (hasAvailability === 'true') {
      events = events.filter(event => {
        if (!event.maxParticipants) return true;
        return event.participants.length < event.maxParticipants;
      });
    }

    if (participantMin && participantMin > 0) {
      events = events.filter(event => event.participants.length >= parseInt(participantMin));
    }

    const total = events.length;
    const paginatedEvents = events.slice(skip, skip + parseInt(limit));

    const formattedEvents = paginatedEvents.map(event => {
      const eventWithCapacity = {
        ...event,
        capacity: {
          total: event.maxParticipants,
          registered: event.participants.length,
          available: event.maxParticipants 
            ? Math.max(0, event.maxParticipants - event.participants.length) 
            : null,
          isFull: event.maxParticipants ? event.participants.length >= event.maxParticipants : false,
          capacityPercentage: event.maxParticipants 
            ? Math.round((event.participants.length / event.maxParticipants) * 100)
            : 0,
        },
      };
      return eventWithCapacity;
    });

    res.json({
      success: true,
      data: formattedEvents,
      filters: {
        category: category || 'All',
        status: status || 'All',
        sortBy,
        minRating: parseFloat(minRating) || 0,
        hasAvailability: hasAvailability === 'true',
        verified: verified === 'true',
      },
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching events', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const createEvent = async (req, res) => {
  try {
    const { title, description, community, startDate, endDate, location, category, image, maxParticipants } = req.body;
    const userId = req.userId;

    const communityExists = await Community.findById(community);
    if (!communityExists) {
      return res.status(404).json({
        success: false,
        message: 'Community not found',
      });
    }

    const event = await Event.create({
      title,
      description,
      community,
      createdBy: userId,
      startDate,
      endDate,
      location,
      category: category || 'Other',
      image,
      maxParticipants,
      participants: [userId],
      status: 'Upcoming',
    });

    await awardEventCreation(userId);
    await pointsService.awardVolunteerEventCreationPoints(userId, event._id);
    await pointsService.awardCommunityEventCreatedPoints(community);
    await Community.findByIdAndUpdate(community, { $inc: { totalEvents: 1 } });

    await User.findByIdAndUpdate(userId, {
      $addToSet: { eventsParticipated: event._id },
    });

    await Activity.create({
      user: userId,
      type: 'event_created',
      description: `Created event: ${title}`,
      relatedEntity: {
        entityType: 'Event',
        entityId: event._id,
      },
    });

    logger.success(`Event created: ${event._id}`);

    const populatedEvent = await event
      .populate('createdBy', 'name profileImage')
      .populate('community', 'name');

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATED,
      event: formatEventWithCapacity(populatedEvent),
    });
  } catch (error) {
    logger.error('Error creating event', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
      .populate('createdBy', 'name profileImage')
      .populate('community', 'name verificationStatus avgRating')
      .populate('participants', 'name profileImage');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    res.json({
      success: true,
      event: formatEventWithCapacity(event),
    });
  } catch (error) {
    logger.error('Error fetching event', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const joinEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    if (event.participants.includes(userId)) {
      return res.status(409).json({
        success: false,
        message: 'Already a participant of this event',
      });
    }

    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Event is full',
      });
    }

    event.participants.push(userId);
    await event.save();

    await User.findByIdAndUpdate(userId, {
      $addToSet: { eventsParticipated: id },
    });

    await Participation.create({
      user: userId,
      event: id,
      community: event.community,
      status: 'Registered',
    });

    // ✅ ADD THIS SECTION:
    // Award volunteer points
    await pointsService.awardVolunteerEventPoints(
      userId,
      id,
      POINTS_CONFIG.EVENT_PARTICIPATED
    );

    // Award community points
    await pointsService.awardCommunityMemberJoinedPoints(
      event.community,
      userId
    );

    await awardEventParticipation(userId, id);

    await Activity.create({
      user: userId,
      type: 'event_joined',
      description: `Joined event: ${event.title}`,
      relatedEntity: {
        entityType: 'Event',
        entityId: event._id,
      },
    });

    logger.success(`User ${userId} joined event ${id}`);

    res.json({
      success: true,
      message: 'Joined event successfully',
      event: formatEventWithCapacity(event),
    });
  } catch (error) {
    logger.error('Error joining event', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const leaveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    event.participants = event.participants.filter((p) => !p.equals(userId));
    await event.save();

    await User.findByIdAndUpdate(userId, {
      $pull: { eventsParticipated: id },
    });

    await Participation.findOneAndUpdate(
      { user: userId, event: id },
      { status: 'Cancelled' }
    );

    logger.success(`User ${userId} left event ${id}`);

    res.json({
      success: true,
      message: 'Left event successfully',
    });
  } catch (error) {
    logger.error('Error leaving event', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate, location, category, image, status, maxParticipants } = req.body;
    const userId = req.userId;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    if (!event.createdBy.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (startDate) updateData.startDate = startDate;
    if (endDate) updateData.endDate = endDate;
    if (location) updateData.location = location;
    if (category) updateData.category = category;
    if (image) updateData.image = image;
    if (status) updateData.status = status;
    if (maxParticipants !== undefined) updateData.maxParticipants = maxParticipants;

    const updated = await Event.findByIdAndUpdate(id, updateData, { new: true })
      .populate('createdBy', 'name profileImage')
      .populate('community', 'name');

    logger.success(`Event updated: ${id}`);

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.UPDATED,
      event: formatEventWithCapacity(updated),
    });
  } catch (error) {
    logger.error('Error updating event', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    if (!event.createdBy.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    await Event.findByIdAndDelete(id);
    await Community.findByIdAndUpdate(event.community, { $inc: { totalEvents: -1 } });

    logger.success(`Event deleted: ${id}`);

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.DELETED,
    });
  } catch (error) {
    logger.error('Error deleting event', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const getEventParticipants = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const { skip } = parseQueryParams({ page, limit });

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    const participants = await User.find({ _id: { $in: event.participants } })
      .select('-googleId')
      .limit(limit)
      .skip(skip);

    const total = event.participants.length;

    res.json({
      success: true,
      data: participants.map((p) => p.toJSON()),
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching event participants', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export default {
  createEvent,
  getEvents,
  getEventById,
  joinEvent,
  leaveEvent,
  updateEvent,
  deleteEvent,
  getEventParticipants,
};