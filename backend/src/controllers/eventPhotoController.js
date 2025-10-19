import EventPhoto from '../models/EventPhoto.js';
import Event from '../models/Event.js';
import Activity from '../models/Activity.js';
import { logger } from '../utils/logger.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants.js';
import { parseQueryParams } from '../utils/helpers.js';

export const uploadEventPhoto = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { photoUrl, photoType, description, isOfficial } = req.body;
    const userId = req.userId;

    // Validate event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    // Check if user is event creator (for official photos)
    const isEventCreator = event.createdBy.equals(userId);

    // Validate photo type
    if (!['event_preview', 'during_event', 'after_event'].includes(photoType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid photo type',
      });
    }

    // Create photo
    const photo = await EventPhoto.create({
      event: eventId,
      community: event.community,
      uploadedBy: userId,
      photoUrl,
      photoType,
      description: description || null,
      isOfficial: isOfficial && isEventCreator, // Only creator can mark as official
    });

    socketService.notifyEventPhotoUploaded(eventId, event.community, {
  photoId: photo._id,
  photoUrl: photo.photoUrl,
  uploadedBy: {
    name: user.name,
    profileImage: user.profileImage,
  },
});

    // Populate references
    const populatedPhoto = await photo
      .populate('uploadedBy', 'name profileImage')
      .populate('event', 'title');

    // Create activity
    await Activity.create({
      user: userId,
      type: 'event_photo_uploaded',
      description: `Added ${photoType.replace(/_/g, ' ')} photo to event: ${event.title}`,
      relatedEntity: {
        entityType: 'Event',
        entityId: eventId,
      },
    });

    logger.success(`Photo uploaded for event ${eventId}`);

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.CREATED,
      photo: populatedPhoto,
    });
  } catch (error) {
    logger.error('Error uploading photo', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const getEventPhotos = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 20, photoType } = req.query;
    const { skip } = parseQueryParams({ page, limit });

    // Validate event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    let query = { event: eventId };

    if (photoType) {
      query.photoType = photoType;
    }

    const photos = await EventPhoto.find(query)
      .populate('uploadedBy', 'name profileImage')
      .sort({ isOfficial: -1, createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await EventPhoto.countDocuments(query);

    res.json({
      success: true,
      data: photos,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching event photos', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const getPhotosByType = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { photoType } = req.query;

    if (!['event_preview', 'during_event', 'after_event'].includes(photoType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid photo type',
      });
    }

    const photos = await EventPhoto.find({
      event: eventId,
      photoType,
    })
      .populate('uploadedBy', 'name profileImage')
      .sort({ isOfficial: -1, likes: -1 })
      .limit(10);

    res.json({
      success: true,
      data: photos,
      photoType,
    });
  } catch (error) {
    logger.error('Error fetching photos by type', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const updatePhotoDescription = async (req, res) => {
  try {
    const { photoId } = req.params;
    const { description } = req.body;
    const userId = req.userId;

    const photo = await EventPhoto.findById(photoId);

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found',
      });
    }

    // Only creator can edit
    if (!photo.uploadedBy.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    photo.description = description || null;
    await photo.save();

    logger.success(`Photo description updated: ${photoId}`);

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.UPDATED,
      photo,
    });
  } catch (error) {
    logger.error('Error updating photo description', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const deleteEventPhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    const userId = req.userId;

    const photo = await EventPhoto.findById(photoId).populate('event');

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found',
      });
    }

    // Check authorization: photo uploader or event creator
    const isPhotoUploader = photo.uploadedBy.equals(userId);
    const isEventCreator = photo.event.createdBy.equals(userId);

    if (!isPhotoUploader && !isEventCreator) {
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    await EventPhoto.findByIdAndDelete(photoId);

    logger.success(`Photo deleted: ${photoId}`);

    res.json({
      success: true,
      message: SUCCESS_MESSAGES.DELETED,
    });
  } catch (error) {
    logger.error('Error deleting photo', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const likePhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    const userId = req.userId;

    const photo = await EventPhoto.findById(photoId);

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found',
      });
    }

    // Check if already liked
    if (photo.likedBy.includes(userId)) {
      return res.status(409).json({
        success: false,
        message: 'You already liked this photo',
      });
    }

    // Add like
    photo.likedBy.push(userId);
    photo.likes = photo.likedBy.length;
    await photo.save();

    logger.success(`User ${userId} liked photo ${photoId}`);

    res.json({
      success: true,
      message: 'Photo liked',
      likes: photo.likes,
    });
  } catch (error) {
    logger.error('Error liking photo', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const unlikePhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    const userId = req.userId;

    const photo = await EventPhoto.findById(photoId);

    if (!photo) {
      return res.status(404).json({
        success: false,
        message: 'Photo not found',
      });
    }

    // Check if liked
    if (!photo.likedBy.includes(userId)) {
      return res.status(409).json({
        success: false,
        message: 'You haven\'t liked this photo',
      });
    }

    // Remove like
    photo.likedBy = photo.likedBy.filter((id) => !id.equals(userId));
    photo.likes = photo.likedBy.length;
    await photo.save();

    logger.success(`User ${userId} unliked photo ${photoId}`);

    res.json({
      success: true,
      message: 'Photo unliked',
      likes: photo.likes,
    });
  } catch (error) {
    logger.error('Error unliking photo', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const getCommunityPhotoGallery = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { page = 1, limit = 30 } = req.query;
    const { skip } = parseQueryParams({ page, limit });

    const photos = await EventPhoto.find({ community: communityId })
      .populate('uploadedBy', 'name profileImage')
      .populate('event', 'title image')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await EventPhoto.countDocuments({ community: communityId });

    res.json({
      success: true,
      data: photos,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching community gallery', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export default {
  uploadEventPhoto,
  getEventPhotos,
  getPhotosByType,
  updatePhotoDescription,
  deleteEventPhoto,
  likePhoto,
  unlikePhoto,
  getCommunityPhotoGallery,
};