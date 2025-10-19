import express from 'express';
import Event from '../models/Event.js';
import {
  getNearbyEvents,
  getNearbyCommunities,
  getEventsInBoundingBox,
  getEventsByCity,
  updateEventLocation,
  getEventsToday,
} from '../services/locationService.js';
import {
  generateICalendar,
  generateCalendarInvitationUrl,
  syncEventToCalendars,
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

// ✅ FIXED: Get nearby events with proper validation
router.get(
  '/location/nearby-events',
  validateCoordinatesQuery, // ✅ Validates lat/lng
  validateLocationRadius, // ✅ Validates radius range
  async (req, res) => {
    try {
      const { lat, lng, radiusKm = 10, limit = 20 } = req.query;
      const radius = Math.max(0.1, Math.min(parseFloat(radiusKm) || 10, 500)); // Clamp 0.1-500km
      const eventLimit = Math.min(parseInt(limit) || 20, 100); // Max 100 results

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
          radius: radius,
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

// ✅ FIXED: Get nearby communities with proper validation
router.get(
  '/location/nearby-communities',
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
          radius: radius,
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

// ✅ FIXED: Get events in bounding box with proper validation
router.get(
  '/location/bbox',
  validateBoundingBox, // ✅ Validates all bbox coordinates
  async (req, res) => {
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
  }
);

// Get events by city
router.get('/location/city/:city', async (req, res) => {
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

// ✅ FIXED: Get events today in nearby location with validation
router.get(
  '/location/today',
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
          radius: radius,
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

// ✅ FIXED: Update event location with validation
router.put(
  '/events/:eventId/location',
  verifyToken,
  validateId('eventId'),
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const { address, city, state, zipCode, latitude, longitude } = req.body;

      // Validate at least city is provided
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

      if (!event.createdBy.equals(req.userId)) {
        return res.status(403).json({
          success: false,
          message: ERROR_MESSAGES.UNAUTHORIZED,
        });
      }

      // Validate coordinates if provided
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

// Get event as iCalendar (.ics)
router.get(
  '/calendar/events/:eventId/download.ics',
  validateId('eventId'),
  async (req, res) => {
    try {
      const { eventId } = req.params;

      const event = await Event.findById(eventId).populate('createdBy', 'name email');

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }

      const icalendar = generateICalendar(event);

      res.setHeader('Content-Type', 'text/calendar');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="event-${eventId}.ics"`
      );
      res.send(icalendar);

      logger.success(`iCalendar downloaded for event ${eventId}`);
    } catch (error) {
      logger.error('Error downloading iCalendar', error);
      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }
);

// Get calendar invitation URLs
router.get(
  '/calendar/events/:eventId/invite-urls',
  validateId('eventId'),
  async (req, res) => {
    try {
      const { eventId } = req.params;

      const event = await Event.findById(eventId);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }

      const urls = generateCalendarInvitationUrl(event);

      res.json({
        success: true,
        data: {
          eventTitle: event.title,
          eventDate: event.startDate,
          invitationUrls: urls,
        },
      });
    } catch (error) {
      logger.error('Error generating invitation URLs', error);
      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }
);

// Sync event to calendars
router.post(
  '/calendar/events/:eventId/sync',
  verifyToken,
  validateId('eventId'),
  async (req, res) => {
    try {
      const { eventId } = req.params;
      const { googleAuth } = req.body;

      const event = await Event.findById(eventId).populate('createdBy', 'name email');

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found',
        });
      }

      const syncResult = await syncEventToCalendars(
        event,
        req.userEmail,
        googleAuth || null
      );

      res.json({
        success: true,
        message: 'Event synced to calendars',
        data: {
          icalendar: syncResult.icalendar,
          googleCalendar: syncResult.googleCalendar,
          error: syncResult.googleCalendarError || null,
        },
      });
    } catch (error) {
      logger.error('Error syncing event to calendars', error);
      res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }
);

export default router;