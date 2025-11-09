import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Community from '../models/Community.js';
import User from '../models/User.js';
import Participation from '../models/Participation.js';
import Activity from '../models/Activity.js';
import Rating from '../models/Rating.js';  // ✅ ADD THIS LINE
import { awardEventCreation, awardEventParticipation } from '../services/impactService.js';
import { formatCoordinates, buildLocationObject } from '../services/geocodingService.js';
import { logger } from '../utils/logger.js';
import { SUCCESS_MESSAGES, ERROR_MESSAGES, POINTS_CONFIG } from '../utils/constants.js';
import { parseQueryParams } from '../utils/helpers.js';
import * as pointsService from '../services/pointsService.js';
import * as socketService from '../services/socketService.js';
import { sendCalendarInvitation } from '../services/calendarService.js';

const formatEventWithCapacity = (event) => {
  const eventObj = event.toObject ? event.toObject() : event;
  return {
    ...eventObj,
    capacity: {
      total: event.maxParticipants,
      registered: event.participants.length,
      available: event.maxParticipants
        ? Math.max(0, event.maxParticipants - event.participants.length)
        : null,
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
      const verifiedCommunities = await Community.find({
        verificationStatus: 'verified',
      }).select('_id');
      const verifiedIds = verifiedCommunities.map((c) => c._id);
      query.community = { $in: verifiedIds };
    }

    let events = await Event.find(query)
      .populate('createdBy', 'name profileImage')
      .populate('community', 'name verificationStatus')
      .sort(getSortOrder(sortBy));

    if (hasAvailability === 'true') {
      events = events.filter((event) => {
        if (!event.maxParticipants) return true;
        return event.participants.length < event.maxParticipants;
      });
    }

    if (participantMin && participantMin > 0) {
      events = events.filter((event) => event.participants.length >= parseInt(participantMin));
    }

    const total = events.length;
    const paginatedEvents = events.slice(skip, skip + parseInt(limit));

    const formattedEvents = paginatedEvents.map((event) => {
      const eventWithCapacity = {
        ...event.toObject(), // <-- Use .toObject() here
        capacity: {
          total: event.maxParticipants,
          registered: event.participants.length,
          available: event.maxParticipants
            ? Math.max(0, event.maxParticipants - event.participants.length)
            : null,
          isFull: event.isFull(), // <-- This method now exists
          capacityPercentage: event.getCapacityPercentage(), // <-- This method now exists
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

// ✅ FIXED: createEvent - Correct populate syntax
export const createEvent = async (req, res) => {
  try {
    console.log('📅 Create Event Request');
    console.log('Body fields:', Object.keys(req.body));
    console.log('File:', req.file);

    const userId = req.userId;
    const userRole = req.userRole;

    // ✅ Extract fields from req.body (FormData)
    const {
      title,
      description,
      community,
      startDate,
      endDate,
      startTime,
      endTime,
      category,
      maxParticipants,
      location: locationString,
    } = req.body;

    console.log('📝 Extracted fields:', {
      title: !!title,
      description: !!description,
      community: !!community,
      startDate: !!startDate,
      endDate: !!endDate,
      category: !!category,
      hasImage: !!req.file,
    });

    // ✅ Validation: Check required fields
    if (!title || !description || !community || !startDate || !endDate || !category) {
      console.error('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: title, description, community, startDate, endDate, category',
        received: {
          title: !!title,
          description: !!description,
          community: !!community,
          startDate: !!startDate,
          endDate: !!endDate,
          category: !!category,
        },
      });
    }

    // ✅ SECURITY CHECK #1: User must be moderator or admin
    if (!['moderator', 'admin'].includes(userRole)) {
      console.error('❌ User is not moderator or admin:', userRole);
      return res.status(403).json({
        success: false,
        message: 'Only community managers can create events. Please apply to become a community manager.',
        requiredRole: 'moderator',
        currentRole: userRole,
        actionLink: '/apply-community-manager',
      });
    }

    console.log('✅ User is moderator or admin');

    // ✅ SECURITY CHECK #2: Community must exist
    const communityExists = await Community.findById(community);
    if (!communityExists) {
      console.error('❌ Community not found:', community);
      return res.status(404).json({
        success: false,
        message: 'Community not found',
        communityId: community,
      });
    }

    console.log('✅ Community exists:', communityExists.name);

    // ✅ SECURITY CHECK #3: Community must be verified
    if (communityExists.verificationStatus !== 'verified') {
      console.error('❌ Community is not verified:', communityExists.verificationStatus);
      return res.status(400).json({
        success: false,
        message: 'Community must be verified before creating events',
        status: communityExists.verificationStatus,
        hint: 'This community is pending verification. Please wait for admin approval.',
      });
    }

    console.log('✅ Community is verified');

    // ✅ SECURITY CHECK #4: User must be the community manager (creator) or admin
    if (!communityExists.createdBy.equals(userId) && userRole !== 'admin') {
      console.error('❌ User is not community manager');
      return res.status(403).json({
        success: false,
        message: 'Only the community manager can create events in this community',
        communityManager: communityExists.createdBy,
        currentUser: userId,
      });
    }

    console.log('✅ User is community manager or admin');

    // ✅ Parse location (comes as JSON string from FormData)
    let locationData = {
      address: '',
      city: '',
      state: '',
      zipCode: '',
      coordinates: {
        type: 'Point',
        coordinates: [0, 0], // [longitude, latitude]
      },
    };

    if (locationString) {
      try {
        const parsedLocation = JSON.parse(locationString);
        console.log('📍 Parsed location:', parsedLocation);

        locationData.address = parsedLocation.address || '';
        locationData.city = parsedLocation.city || '';
        locationData.state = parsedLocation.state || '';
        locationData.zipCode = parsedLocation.zipCode || '';

        // GeoJSON format: [longitude, latitude]
        if (parsedLocation.latitude && parsedLocation.longitude) {
          locationData.coordinates.coordinates = [
            parseFloat(parsedLocation.longitude),
            parseFloat(parsedLocation.latitude),
          ];
        }
      } catch (e) {
        console.error('❌ Failed to parse location:', e.message);
      }
    }

    // ✅ Generate image URL if file was uploaded
    let imageUrl = null;
    if (req.file) {
      const BASE_URL = process.env.BASE_URL || 'http://localhost:5050';
      imageUrl = `${BASE_URL}/uploads/${req.file.filename}`;
      console.log('🖼️ Image URL:', imageUrl);
    }

    // ✅ Create event object
    const eventData = {
      title: title.trim(),
      description: description.trim(),
      community,
      createdBy: userId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      startTime: startTime || null,
      endTime: endTime || null,
      location: locationData,
      category: category || 'Other',
      image: imageUrl,
      maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
      participants: [userId], // Creator is auto-participant
      status: 'Upcoming',
    };

    console.log('📦 Creating event with data:', eventData);

    // ✅ Create event
    const event = await Event.create(eventData);

    console.log('✅ Event created:', event._id);

    // ✅ Award points to event creator
    try {
      await awardEventCreation(userId);
      await pointsService.awardVolunteerEventCreationPoints(userId, event._id);
      await pointsService.awardCommunityEventCreatedPoints(community);
      console.log('✅ Points awarded for event creation');
    } catch (pointsError) {
      logger.warn('⚠️ Could not award points:', pointsError.message);
    }

    // ✅ Update community event count
    await Community.findByIdAndUpdate(community, { $inc: { totalEvents: 1 } });

    console.log('✅ Community event count updated');

    // ✅ Add event to user's events
    await User.findByIdAndUpdate(userId, {
      $addToSet: { eventsParticipated: event._id },
    });

    console.log('✅ Event added to user events');

    // ✅ Create activity record
    await Activity.create({
      user: userId,
      type: 'event_created',
      description: `Created event: ${title}`,
      relatedEntity: {
        entityType: 'Event',
        entityId: event._id,
        title: title,
      },
    });

    console.log('✅ Activity record created');

    // ✅ FIXED: Re-fetch the event from database and then populate
    // This is the correct way to populate after creating
    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name profileImage')
      .populate('community', 'name');

    console.log('✅ Event populated with relations');

    logger.success(`Event created by ${userId}: ${event._id}`);

    res.status(201).json({
      success: true,
      message: 'Event created successfully!',
      event: formatEventWithCapacity(populatedEvent),
    });
  } catch (error) {
    console.error('❌ Error creating event:', error);
    logger.error('Error creating event', error);

    // Clean up uploaded file if event creation failed
    if (req.file) {
      try {
        const fs = require('fs');
        fs.unlinkSync(req.file.path);
        console.log('🧹 Uploaded file cleaned up after error');
      } catch (deleteError) {
        console.error('Could not delete uploaded file:', deleteError);
      }
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create event',
      error: error.message,
    });
  }
};


export const getEventById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format',
      });
    }

    const event = await Event.findById(id)
      .populate('createdBy', 'name profileImage')
      .populate('community', 'name verificationStatus avgRating');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    // ✅ Calculate rating stats from ratings collection
    try {
      const ratings = await Rating.find({
        'ratedEntity.entityType': 'Event',
        'ratedEntity.entityId': new mongoose.Types.ObjectId(id),
      });

      const avgRating = ratings.length > 0
        ? parseFloat((ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1))
        : 0;

      const totalRatings = ratings.length;

      // Add rating stats to response
      const eventData = event.toObject ? event.toObject() : event;
      const eventWithRatings = {
        ...eventData,
        avgRating,
        totalRatings,
        capacity: {
          total: event.maxParticipants,
          registered: event.participants.length,
          available: event.maxParticipants
            ? Math.max(0, event.maxParticipants - event.participants.length)
            : null,
          isFull: event.isFull(),
          capacityPercentage: event.getCapacityPercentage(),
        },
      };

      res.json({
        success: true,
        event: eventWithRatings,
      });
    } catch (ratingError) {
      logger.error('Error calculating ratings for event', ratingError);
      
      // Return event without ratings if calculation fails
      res.json({
        success: true,
        event: {
          ...event.toObject ? event.toObject() : event,
          avgRating: 0,
          totalRatings: 0,
          capacity: {
            total: event.maxParticipants,
            registered: event.participants.length,
            available: event.maxParticipants
              ? Math.max(0, event.maxParticipants - event.participants.length)
              : null,
            isFull: event.isFull(),
            capacityPercentage: event.getCapacityPercentage(),
          },
        },
      });
    }
  } catch (error) {
    logger.error('Error fetching event', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      error: error.message,
    });
  }
};

export const joinEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log('🔵 Join Event:', { eventId: id, userId });

    // Validate event exists
    const event = await Event.findById(id)
      .populate('createdBy', 'name')
      .populate('community', 'name');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    // Check if already participant
    if (event.participants.includes(userId)) {
      return res.status(409).json({
        success: false,
        message: 'Already a participant of this event',
      });
    }

    // Check if event is full
    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Event is full',
      });
    }

    // Get user data
    const user = await User.findById(userId).select('name profileImage email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Add user to event participants
    event.participants.push(userId);
    await event.save();

    console.log('✅ User added to participants');

    // Add event to user's events
    await User.findByIdAndUpdate(userId, {
      $addToSet: { eventsParticipated: id },
    });

    console.log('✅ Event added to user events');

    // Delete old participation record if it exists
    try {
      await Participation.findOneAndDelete({
        user: userId,
        event: id,
      });
      console.log('✅ Old participation record deleted');
    } catch (deleteError) {
      console.warn('⚠️ Could not delete old participation:', deleteError.message);
    }

    // Create new participation record
    await Participation.create({
      user: userId,
      event: id,
      community: event.community,
      status: 'Registered',
    });

    console.log('✅ New participation record created');

    // Send calendar invitation (non-blocking)
    try {
      await sendCalendarInvitation(userId, event);
      console.log('✅ Calendar invitation sent');
    } catch (calendarError) {
      console.warn('⚠️ Calendar invitation failed (non-critical):', calendarError.message);
    }

    // Notify event creator via socket
    socketService.notifyEventNewParticipant(event.createdBy._id, event._id, {
      _id: user._id,
      name: user.name,
      profileImage: user.profileImage,
    });

    console.log('✅ Socket notification sent');

    // Update event capacity via socket
    socketService.updateEventCapacity(event._id, {
      registered: event.participants.length,
      available: event.maxParticipants
        ? event.maxParticipants - event.participants.length
        : null,
      isFull: event.maxParticipants
        ? event.participants.length >= event.maxParticipants
        : false,
    });

    console.log('✅ Capacity updated via socket');

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

    console.log('✅ Activity record created');

    // ✅ FIXED: Re-fetch the event with populate instead of chaining populate
    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'name profileImage')
      .populate('community', 'name');

    console.log('✅ Event re-fetched and populated');

    const eventWithCapacity = {
      ...populatedEvent.toObject(),
      capacity: {
        total: populatedEvent.maxParticipants,
        registered: populatedEvent.participants.length,
        available: populatedEvent.maxParticipants
          ? Math.max(0, populatedEvent.maxParticipants - populatedEvent.participants.length)
          : null,
        isFull: populatedEvent.isFull(),
        capacityPercentage: populatedEvent.getCapacityPercentage(),
      },
    };

    logger.success(`User ${userId} joined event ${id}`);

    res.json({
      success: true,
      message: 'Joined event successfully! Calendar invitation sent.',
      event: eventWithCapacity,
    });
  } catch (error) {
    console.error('❌ Error joining event:', error);
    logger.error('Error joining event', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      error: error.message,
    });
  }
};

export const leaveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    console.log('🔴 Leave Event:', { eventId: id, userId });

    // Find event
    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    // Check if user is participant
    if (!event.participants.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You are not a participant of this event',
      });
    }

    // Remove user from participants
    event.participants = event.participants.filter(
      (p) => !p.equals(userId)
    );
    await event.save();

    console.log('✅ User removed from participants');

    // Remove event from user's events
    await User.findByIdAndUpdate(userId, {
      $pull: { eventsParticipated: id },
    });

    console.log('✅ Event removed from user events');

    // ✅ FIXED: DELETE the participation record instead of just updating status
    const result = await Participation.findOneAndDelete({
      user: userId,
      event: id,
    });

    console.log('✅ Participation record deleted:', result ? 'Found and deleted' : 'Not found');

    // ✅ FIX #2: CREATE ACTIVITY RECORD FOR LEAVING EVENT
    try {
      await Activity.create({
        user: userId,
        type: 'event_left',  // ✅ NEW TYPE
        description: `Left the event "${event.title}"`,
        relatedEntity: {
          entityType: 'Event',
          entityId: event._id,
          title: event.title,
        },
        metadata: {
          eventTitle: event.title,
          leftAt: new Date(),
        },
      });
      console.log('✅ Activity record created for event leave');
    } catch (activityError) {
      logger.warn('⚠️ Could not create activity record for leave:', activityError.message);
      // Don't fail the entire request if activity creation fails
    }

    // ✅ Notify participants of capacity update
    socketService.updateEventCapacity(event._id, {
      registered: event.participants.length,
      available: event.maxParticipants
        ? event.maxParticipants - event.participants.length
        : null,
      isFull: event.maxParticipants
        ? event.participants.length >= event.maxParticipants
        : false,
    });

    logger.success(`User ${userId} left event ${id}`);

    res.json({
      success: true,
      message: 'Left event successfully',
    });
  } catch (error) {
    console.error('❌ Error leaving event:', error);
    logger.error('Error leaving event', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      error: error.message,
    });
  }
};

// ✅ FIXED: updateEvent - Correct populate syntax
export const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate, location, category, image, status, maxParticipants } =
      req.body;
    const userId = req.userId;

    const event = await Event.findById(id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });
    }

    if (!event.createdBy.equals(userId) && req.userRole !== 'admin') {
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
    if (category) updateData.category = category;
    if (image) updateData.image = image;
    if (status) updateData.status = status;
    if (maxParticipants !== undefined) updateData.maxParticipants = maxParticipants;

    if (location) {
      updateData.location = buildLocationObject(location);
    }

    // ✅ FIXED: Use findByIdAndUpdate with populate in the query chain
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

    if (!event.createdBy.equals(userId) && req.userRole !== 'admin') {
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

// ✅ CORRECTED: Only event creator/admin can view participants
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

    // ✅ Check authorization: only event creator or admin
    if (!event.createdBy.equals(req.userId) && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only the event creator can view participants',
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

export const getMyCreatedEvents = async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10, status = null, sortBy = 'recent' } = req.query;
    
    console.log('📅 Get My Created Events:', { userId, page, limit, status });

    // ✅ Validate pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // ✅ Build query - only show events created by this user
    let query = { createdBy: userId };

    // ✅ Filter by status if provided
    if (status && ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'].includes(status)) {
      query.status = status;
    }

    console.log('📋 Query:', query);

    // ✅ Fetch events with proper sorting
    const sortOrder = sortBy === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

    const events = await Event.find(query)
      .populate('community', 'name image _id verificationStatus')
      .populate('createdBy', 'name profileImage email')
      .sort(sortOrder)
      .skip(skip)
      .limit(limitNum);

    console.log('✅ Found events:', events.length);

    // ✅ Get total count for pagination
    const total = await Event.countDocuments(query);

    console.log('✅ Total events:', total);

    // ✅ Format events with capacity information
    const formattedEvents = events.map((event) => {
      const eventObj = event.toObject ? event.toObject() : event;
      return {
        ...eventObj,
        capacity: {
          total: event.maxParticipants || null,
          registered: event.participants ? event.participants.length : 0,
          available: event.maxParticipants
            ? Math.max(0, event.maxParticipants - (event.participants?.length || 0))
            : null,
          isFull: event.isFull && event.isFull(),
          capacityPercentage: event.getCapacityPercentage && event.getCapacityPercentage(),
        },
      };
    });

    console.log('✅ Events formatted with capacity');

    logger.success(`Retrieved ${events.length} events for user ${userId}`);

    res.json({
      success: true,
      data: formattedEvents,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
      filters: {
        status: status || 'All',
        sortBy: sortBy || 'recent',
      },
    });
  } catch (error) {
    console.error('❌ Error fetching user created events:', error);
    logger.error('Error fetching user created events', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
      error: error.message,
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
  getMyCreatedEvents,
};