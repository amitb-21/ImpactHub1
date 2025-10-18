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
import { logger } from '../utils/logger.js';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../utils/constants.js';

const router = express.Router();

// =====================
// LOCATION-BASED ENDPOINTS
// =====================

// Get nearby events
router.get('/location/nearby-events', async (req, res) => {
  try {
    const { lat, lng, radiusKm = 10, limit = 20 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const events = await getNearbyEvents(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radiusKm),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: events,
      center: { lat: parseFloat(lat), lng: parseFloat(lng) },
    });
  } catch (error) {
    logger.error('Error getting nearby events', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
});

// Get nearby communities
router.get('/location/nearby-communities', async (req, res) => {
  try {
    const { lat, lng, radiusKm = 15, limit = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const communities = await getNearbyCommunities(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radiusKm),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: communities,
    });
  } catch (error) {
    logger.error('Error getting nearby communities', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
});

// Get events in bounding box (for map view)
router.get('/location/bbox', async (req, res) => {
  try {
    const { swLat, swLng, neLat, neLng, limit = 50 } = req.query;

    if (!swLat || !swLng || !neLat || !neLng) {
      return res.status(400).json({
        success: false,
        message: 'All bounding box coordinates are required',
      });
    }

    const events = await getEventsInBoundingBox(
      parseFloat(swLat),
      parseFloat(swLng),
      parseFloat(neLat),
      parseFloat(neLng),
      parseInt(limit)
    );

    res.json({
      success: true,
      data: events,
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
router.get('/location/city/:city', async (req, res) => {
  try {
    const { city } = req.params;

    const events = await getEventsByCity(city);

    res.json({
      success: true,
      data: events,
      city,
    });
  } catch (error) {
    logger.error('Error getting events by city', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
});

// Get events today in nearby location
router.get('/location/today', async (req, res) => {
  try {
    const { lat, lng, radiusKm = 10 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const events = await getEventsToday(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radiusKm)
    );

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    logger.error('Error getting events today', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
});

// Update event location
router.put('/events/:eventId/location', verifyToken, validateId('eventId'), async (req, res) => {
  try {
    const { eventId } = req.params;
    const { address, city, state, zipCode, latitude, longitude } = req.body;

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
});

// =====================
// CALENDAR ENDPOINTS
// =====================

// Get event as iCalendar (.ics)
router.get('/calendar/events/:eventId/download.ics', validateId('eventId'), async (req, res) => {
  try {
    const { eventId } = req.params;

    const event = await Event.findById(eventId)
      .populate('createdBy', 'name email');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const icalendar = generateICalendar(event);

    res.setHeader('Content-Type', 'text/calendar');
    res.setHeader('Content-Disposition', `attachment; filename="event-${eventId}.ics"`);
    res.send(icalendar);

    logger.success(`iCalendar downloaded for event ${eventId}`);
  } catch (error) {
    logger.error('Error downloading iCalendar', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
});

// Get calendar invitation URLs
router.get('/calendar/events/:eventId/invite-urls', validateId('eventId'), async (req, res) => {
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
});

// Sync event to calendars
router.post('/calendar/events/:eventId/sync', verifyToken, validateId('eventId'), async (req, res) => {
  try {
    const { eventId } = req.params;
    const { googleAuth } = req.body;

    const event = await Event.findById(eventId)
      .populate('createdBy', 'name email');

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
});

export default router;