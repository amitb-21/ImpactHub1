import Event from '../models/Event.js';
import Community from '../models/Community.js';
import User from '../models/User.js';
import Participation from '../models/Participation.js';
import Activity from '../models/Activity.js';
import { awardEventCreation, awardEventParticipation } from '../services/impactService.js';
import { logger } from '../utils/logger.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants.js';
import { parseQueryParams } from '../utils/helpers.js';

export const createEvent = async (req, res) => {
  try {
    const { title, description, community, startDate, endDate, location, category, image, maxParticipants } =
      req.body;
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

    // Award points to creator
    await awardEventCreation(userId);

    // Update community event count
    await Community.findByIdAndUpdate(community, { $inc: { totalEvents: 1 } });

    // Add to user's events
    await User.findByIdAndUpdate(userId, {
      $addToSet: { eventsParticipated: event._id },
    });

    // Create activity record
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

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATED,
      event: await event.populate('createdBy', 'name profileImage').populate('community', 'name'),
    });
  } catch (error) {
    logger.error('Error creating event', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const getEvents = async (req, res) => {
  try {
    const { category, community, page = 1, limit = 10, search, status } = req.query;
    const { skip } = parseQueryParams({ page, limit });

    let query = {};

    if (category) {
      query.category = category;
    }
    if (community) {
      query.community = community;
    }
    if (status) {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const events = await Event.find(query)
      .populate('createdBy', 'name profileImage')
      .populate('community', 'name')
      .sort({ startDate: 1 })
      .limit(limit)
      .skip(skip);

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: events,
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

export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id)
      .populate('createdBy', 'name profileImage')
      .populate('community', 'name')
      .populate('participants', 'name profileImage');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    res.json({
      success: true,
      event,
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

    // Add to user's events
    await User.findByIdAndUpdate(userId, {
      $addToSet: { eventsParticipated: id },
    });

    // Create participation record
    await Participation.create({
      user: userId,
      event: id,
      community: event.community,
      status: 'Registered',
    });

    // Award points
    await awardEventParticipation(userId, id);

    // Create activity record
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
      event,
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
    const { title, description, startDate, endDate, location, category, image, status } = req.body;
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

    const updated = await Event.findByIdAndUpdate(id, updateData, { new: true })
      .populate('createdBy', 'name profileImage')
      .populate('community', 'name');

    logger.success(`Event updated: ${id}`);

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.UPDATED,
      event: updated,
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

    // Update community event count
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