import { google } from 'googleapis';
import { logger } from '../utils/logger.js';

// Initialize Google Calendar API
const calendar = google.calendar('v3');

// Generate iCalendar format (.ics file)
export const generateICalendar = (event) => {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);

  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ImpactHub//Event Calendar//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${event._id}@impacthub.local
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${escapeICalText(event.title)}
DESCRIPTION:${escapeICalText(event.description)}\nLocation: ${escapeICalText(event.location)}
LOCATION:${escapeICalText(event.location)}
URL:https://impacthub.local/events/${event._id}
ORGANIZER;CN="${escapeICalText(event.createdBy.name)}":mailto:events@impacthub.local
ATTENDEE:mailto:user@example.com
STATUS:CONFIRMED
SEQUENCE:0
CREATE:${formatDate(new Date(event.createdAt))}
LAST-MODIFIED:${formatDate(new Date(event.updatedAt))}
END:VEVENT
END:VCALENDAR`;

  return ics;
};

// Escape special characters for iCalendar format
const escapeICalText = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n');
};

// Create event in Google Calendar
export const createGoogleCalendarEvent = async (auth, event, userEmail) => {
  try {
    const googleEvent = {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: {
        dateTime: new Date(event.startDate).toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(event.endDate).toISOString(),
        timeZone: 'UTC',
      },
      attendees: [
        {
          email: userEmail,
          responseStatus: 'accepted',
        },
      ],
      conferenceData: {
        createRequest: {
          requestId: event._id.toString(),
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 1440 }, // 24 hours
          { method: 'popup', minutes: 60 }, // 1 hour
        ],
      },
    };

    const response = await calendar.events.insert({
      auth,
      calendarId: 'primary',
      resource: googleEvent,
      conferenceDataVersion: 1,
    });

    logger.success(`Event created in Google Calendar: ${response.data.id}`);

    return {
      googleEventId: response.data.id,
      googleCalendarLink: response.data.htmlLink,
    };
  } catch (error) {
    logger.error('Error creating Google Calendar event', error);
    throw error;
  }
};

// Update event in Google Calendar
export const updateGoogleCalendarEvent = async (auth, googleEventId, event) => {
  try {
    const googleEvent = {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: {
        dateTime: new Date(event.startDate).toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: new Date(event.endDate).toISOString(),
        timeZone: 'UTC',
      },
    };

    const response = await calendar.events.update({
      auth,
      calendarId: 'primary',
      eventId: googleEventId,
      resource: googleEvent,
    });

    logger.success(`Event updated in Google Calendar: ${googleEventId}`);

    return response.data;
  } catch (error) {
    logger.error('Error updating Google Calendar event', error);
    throw error;
  }
};

// Delete event from Google Calendar
export const deleteGoogleCalendarEvent = async (auth, googleEventId) => {
  try {
    await calendar.events.delete({
      auth,
      calendarId: 'primary',
      eventId: googleEventId,
    });

    logger.success(`Event deleted from Google Calendar: ${googleEventId}`);
  } catch (error) {
    logger.error('Error deleting Google Calendar event', error);
    throw error;
  }
};

// Get Google Calendar events
export const getGoogleCalendarEvents = async (auth, timeMin, timeMax) => {
  try {
    const response = await calendar.events.list({
      auth,
      calendarId: 'primary',
      timeMin,
      timeMax,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items;
  } catch (error) {
    logger.error('Error getting Google Calendar events', error);
    throw error;
  }
};

// Sync event to multiple calendar platforms
export const syncEventToCalendars = async (event, userEmail, googleAuth = null) => {
  try {
    const syncResult = {
      icalendar: generateICalendar(event),
      googleCalendar: null,
      success: true,
    };

    // Try to sync to Google Calendar if auth provided
    if (googleAuth) {
      try {
        const googleResult = await createGoogleCalendarEvent(googleAuth, event, userEmail);
        syncResult.googleCalendar = googleResult;
      } catch (error) {
        logger.warn('Could not sync to Google Calendar', error.message);
        syncResult.googleCalendarError = error.message;
      }
    }

    return syncResult;
  } catch (error) {
    logger.error('Error syncing event to calendars', error);
    throw error;
  }
};

// Generate calendar invitation URL
export const generateCalendarInvitationUrl = (event) => {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);

  // Google Calendar
  const googleUrl = new URL('https://calendar.google.com/calendar/r/eventedit');
  googleUrl.searchParams.append('text', event.title);
  googleUrl.searchParams.append('details', event.description);
  googleUrl.searchParams.append('location', event.location);
  googleUrl.searchParams.append('dates', `${start.toISOString().split('.')[0]}/${end.toISOString().split('.')[0]}`);

  // Outlook Calendar
  const outlookUrl = new URL('https://outlook.live.com/calendar/0/deeplink/compose');
  outlookUrl.searchParams.append('subject', event.title);
  outlookUrl.searchParams.append('body', event.description);
  outlookUrl.searchParams.append('location', event.location);
  outlookUrl.searchParams.append('startdt', start.toISOString());
  outlookUrl.searchParams.append('enddt', end.toISOString());

  // Apple Calendar (iCal)
  const icalUrl = `/api/calendar/events/${event._id}/download.ics`;

  return {
    google: googleUrl.toString(),
    outlook: outlookUrl.toString(),
    ical: icalUrl,
  };
};

export default {
  generateICalendar,
  createGoogleCalendarEvent,
  updateGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  getGoogleCalendarEvents,
  syncEventToCalendars,
  generateCalendarInvitationUrl,
};