// backend/src/routes/locationCalendarRoutes.js
import express from 'express';
import Event from '../models/Event.js';
import User from '../models/User.js';
import {
  getNearbyEvents,
  getNearbyCommunities,
  getEventsInBoundingBox,
  getEventsByCity,
  updateEventLocation,
  getEventsToday,
} from '../services/locationService.js';
import {
  generateICalendarInvite,
  generateCalendarUrls,
  sendCalendarInvitation,
} from '../services/calendarService.js';
import { verifyToken } from '../middleware/auth.js';
import { validateId, validatePagination } from '../middleware/validator.js';
import {
  validateCoordinatesQuery,
  validateLocationRadius,
  validateBoundingBox,
} from '../middleware/locationValidator.js';
import { logger } from '../utils/logger.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants.js';

const router = express.Router();

// =====================
// LOCATION-BASED ENDPOINTS
// =====================

// Get nearby events
router.get(
  '/nearby-events',
  validateCoordinatesQuery,
  validateLocationRadius,
  async (req, res) => {
    try {
      const { lat, lng, radiusKm = 10, limit = 20 } = req.query;
      const radius = Math.max(0.1, Math.min(parseFloat(radiusKm) || 10, 500));
      const eventLimit = Math.min(parseInt(limit) || 20, 100);

      const events = await getNearbyEvents(
        parseFloat(lat),
        parseFloat(lng),
        radius,
        eventLimit
      );

      res.json({
        success: true,
        data: events,
        metadata: {
          center: { lat: parseFloat(lat), lng: parseFloat(lng) },
          radius,
          resultCount: events.length,
        },
      });
    } catch (error) {
      logger.error('Error getting nearby events', error);
      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }
);

// Get nearby communities
router.get(
  '/nearby-communities',
  validateCoordinatesQuery,
  validateLocationRadius,
  async (req, res) => {
    try {
      const { lat, lng, radiusKm = 15, limit = 10 } = req.query;
      const radius = Math.max(0.1, Math.min(parseFloat(radiusKm) || 15, 500));
      const communityLimit = Math.min(parseInt(limit) || 10, 100);

      const communities = await getNearbyCommunities(
        parseFloat(lat),
        parseFloat(lng),
        radius,
        communityLimit
      );

      res.json({
        success: true,
        data: communities,
        metadata: {
          center: { lat: parseFloat(lat), lng: parseFloat(lng) },
          radius,
          resultCount: communities.length,
        },
      });
    } catch (error) {
      logger.error('Error getting nearby communities', error);
      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }
);

// Get events in bounding box
router.get('/bbox', validateBoundingBox, async (req, res) => {
  try {
    const { swLat, swLng, neLat, neLng, limit = 50 } = req.query;
    const boxLimit = Math.min(parseInt(limit) || 50, 200);

    const events = await getEventsInBoundingBox(
      parseFloat(swLat),
      parseFloat(swLng),
      parseFloat(neLat),
      parseFloat(neLng),
      boxLimit
    );

    res.json({
      success: true,
      data: events,
      metadata: {
        boundingBox: {
          southwest: { lat: parseFloat(swLat), lng: parseFloat(swLng) },
          northeast: { lat: parseFloat(neLat), lng: parseFloat(neLng) },
        },
        resultCount: events.length,
      },
    });
  } catch (error) {
    logger.error('Error getting events in bbox', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
});

// Get events by city
router.get('/city/:city', async (req, res) => {
  try {
    const { city } = req.params;

    if (!city || city.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'City name must be at least 2 characters',
      });
    }

    const events = await getEventsByCity(city);

    res.json({
      success: true,
      data: events,
      city,
      metadata: {
        resultCount: events.length,
      },
    });
  } catch (error) {
    logger.error('Error getting events by city', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
});

// Get events today
router.get(
  '/today',
  validateCoordinatesQuery,
  validateLocationRadius,
  async (req, res) => {
    try {
      const { lat, lng, radiusKm = 10 } = req.query;
      const radius = Math.max(0.1, Math.min(parseFloat(radiusKm) || 10, 500));

      const events = await getEventsToday(parseFloat(lat), parseFloat(lng), radius);

      res.json({
        success: true,
        data: events,
        metadata: {
          center: { lat: parseFloat(lat), lng: parseFloat(lng) },
          radius,
          resultCount: events.length,
          date: new Date().toISOString().split('T')[0],
        },
      });
    } catch (error) {
      logger.error('Error getting events today', error);
      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }
);

// Update event location
router.put(
  '/events/:eventId/location',
  verifyToken,
  validateId('eventId'),
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const { address, city, state, zipCode, latitude, longitude } = req.body;

      if (!city || city.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'City is required',
        });
      }

      const event = await Event.findById(eventId);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }

      if (!event.createdBy.equals(req.userId) && req.userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTHORIZED,
        });
      }

      if (latitude !== undefined && longitude !== undefined) {
        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
          return res.status(400).json({
            success: false,
            message: 'Coordinates must be numbers',
          });
        }

        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
          return res.status(400).json({
            success: false,
            message: 'Coordinates out of valid range',
          });
        }
      }

      const updated = await updateEventLocation(
        eventId,
        address,
        city,
        state,
        zipCode,
        latitude,
        longitude
      );

      res.json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATED,
        event: updated,
      });
    } catch (error) {
      logger.error('Error updating event location', error);
      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }
);

// =====================
// CALENDAR ENDPOINTS
// =====================

// Download event as .ics file
router.get('/calendar/:eventId/download.ics', validateId('eventId'), async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.query.userId; // Optional: personalize for user

    const event = await Event.findById(eventId)
      .populate('createdBy', 'name email')
      .populate('community', 'name');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    let user = null;
    if (userId) {
      user = await User.findById(userId).select('name email');
    }

    // Generate .ics file
    const icsContent = generateICalendarInvite(event, user || { name: 'Guest', email: 'guest@impacthub.app' });

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="impacthub-event-${eventId}.ics"`);
    res.send(icsContent);

    logger.success(`Calendar file downloaded for event ${eventId}`);
  } catch (error) {
    logger.error('Error downloading calendar file', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
});

// Get calendar URLs for event
router.get('/calendar/:eventId/urls', validateId('eventId'), async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId)
      .populate('createdBy', 'name')
      .populate('community', 'name');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const calendarUrls = generateCalendarUrls(event);

    res.json({
      success: true,
      data: {
        eventTitle: event.title,
        eventDate: event.startDate,
        calendarUrls,
      },
    });
  } catch (error) {
    logger.error('Error generating calendar URLs', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
});

// Send calendar invitation to user (via socket)
router.post(
  '/calendar/:eventId/send-invitation',
  verifyToken,
  validateId('eventId'),
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const userId = req.userId;

      const event = await Event.findById(eventId)
        .populate('createdBy', 'name')
        .populate('community', 'name');

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }

      // Send invitation
      await sendCalendarInvitation(userId, event);

      res.json({
        success: true,
        message: 'Calendar invitation sent!',
      });
    } catch (error) {
      logger.error('Error sending calendar invitation', error);
      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }
);

export default router;