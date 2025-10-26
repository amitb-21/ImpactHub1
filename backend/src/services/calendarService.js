import { logger } from '../utils/logger.js';
import { config } from '../config/env.js';

/**
 * Simple Calendar Service
 * Generates .ics files for event notifications
 * No external dependencies required
 */

/**
 * Generate iCalendar (.ics) file content
 * @param {Object} event - Event object from database
 * @param {Object} user - User receiving the invitation
 * @returns {string} iCalendar format string
 */
export const generateICalendarInvite = (event, user) => {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);

  // Format dates to iCalendar format: YYYYMMDDTHHMMSSZ
  const formatDate = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const now = new Date();
  const eventUrl = `${config.CLIENT_URL}/events/${event._id}`;

  // Build location string
  const locationStr = event.location?.city 
    ? `${event.location.city}${event.location.state ? ', ' + event.location.state : ''}`
    : 'Location TBA';

  const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ImpactHub//Event Calendar//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
X-WR-CALNAME:ImpactHub Events
X-WR-TIMEZONE:UTC
BEGIN:VEVENT
UID:impacthub-${event._id}@impacthub.app
DTSTAMP:${formatDate(now)}
DTSTART:${formatDate(start)}
DTEND:${formatDate(end)}
SUMMARY:${escapeICalText(event.title)}
DESCRIPTION:${escapeICalText(event.description)}\\n\\nJoin us for this event!\\n\\nView details: ${eventUrl}
LOCATION:${escapeICalText(locationStr)}
URL:${eventUrl}
ORGANIZER;CN="${escapeICalText(event.createdBy?.name || 'ImpactHub')}":MAILTO:noreply@impacthub.app
ATTENDEE;CN="${escapeICalText(user.name)}";RSVP=TRUE:MAILTO:${user.email}
STATUS:CONFIRMED
SEQUENCE:0
PRIORITY:5
CLASS:PUBLIC
TRANSP:OPAQUE
BEGIN:VALARM
TRIGGER:-PT24H
ACTION:DISPLAY
DESCRIPTION:Reminder: ${escapeICalText(event.title)} starts in 24 hours
END:VALARM
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Reminder: ${escapeICalText(event.title)} starts in 1 hour
END:VALARM
END:VEVENT
END:VCALENDAR`;

  return icsContent;
};

/**
 * Escape special characters for iCalendar format
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
const escapeICalText = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
    .replace(/\n/g, '\\n')
    .trim();
};

/**
 * Generate calendar invitation URLs for popular calendar apps
 * @param {Object} event - Event object
 * @returns {Object} URLs for different calendar services
 */
export const generateCalendarUrls = (event) => {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  const eventUrl = `${config.CLIENT_URL}/events/${event._id}`;

  // Format dates for URL encoding
  const formatDateUrl = (date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const title = encodeURIComponent(event.title);
  const description = encodeURIComponent(
    `${event.description}\n\nView event: ${eventUrl}`
  );
  const location = encodeURIComponent(
    event.location?.city || 'Location TBA'
  );
  const dates = `${formatDateUrl(start)}/${formatDateUrl(end)}`;

  // Google Calendar URL
  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${description}&location=${location}&dates=${dates}`;

  // Outlook Calendar URL
  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${description}&location=${location}&startdt=${start.toISOString()}&enddt=${end.toISOString()}`;

  // Office 365 URL
  const office365Url = `https://outlook.office.com/calendar/0/deeplink/compose?subject=${title}&body=${description}&location=${location}&startdt=${start.toISOString()}&enddt=${end.toISOString()}`;

  // Yahoo Calendar URL
  const yahooUrl = `https://calendar.yahoo.com/?v=60&view=d&type=20&title=${title}&st=${formatDateUrl(start)}&et=${formatDateUrl(end)}&desc=${description}&in_loc=${location}`;

  return {
    google: googleCalendarUrl,
    outlook: outlookUrl,
    office365: office365Url,
    yahoo: yahooUrl,
    ics: `/events/${event._id}/calendar.ics`, // Download .ics file
  };
};

/**
 * Generate event reminder notification data
 * @param {Object} event - Event object
 * @param {string} reminderType - '24h', '1h', or 'now'
 * @returns {Object} Notification data
 */
export const generateEventReminder = (event, reminderType = '24h') => {
  const reminderMessages = {
    '24h': {
      title: '📅 Event Tomorrow',
      message: `Don't forget: "${event.title}" starts tomorrow!`,
      urgency: 'normal',
    },
    '1h': {
      title: '⏰ Event Starting Soon',
      message: `"${event.title}" starts in 1 hour. Get ready!`,
      urgency: 'high',
    },
    now: {
      title: '🎯 Event Starting Now',
      message: `"${event.title}" is starting now. Join us!`,
      urgency: 'urgent',
    },
  };

  const reminder = reminderMessages[reminderType] || reminderMessages['24h'];

  return {
    ...reminder,
    eventId: event._id,
    eventTitle: event.title,
    startDate: event.startDate,
    location: event.location?.city || 'Location TBA',
    eventUrl: `${config.CLIENT_URL}/events/${event._id}`,
  };
};

/**
 * Check if event needs reminders sent
 * @param {Object} event - Event object
 * @returns {Array} List of reminder types to send
 */
export const checkEventReminders = (event) => {
  const now = new Date();
  const startDate = new Date(event.startDate);
  const hoursUntilEvent = (startDate - now) / (1000 * 60 * 60);

  const reminders = [];

  // 24 hours before (22-26 hours window)
  if (hoursUntilEvent <= 26 && hoursUntilEvent > 22) {
    reminders.push('24h');
  }

  // 1 hour before (45 min - 75 min window)
  if (hoursUntilEvent <= 1.25 && hoursUntilEvent > 0.75) {
    reminders.push('1h');
  }

  // Event starting now (-5 min to +5 min window)
  if (hoursUntilEvent <= 0.083 && hoursUntilEvent > -0.083) {
    reminders.push('now');
  }

  return reminders;
};

/**
 * Batch check all upcoming events for reminders
 * This should be called by a cron job every 15 minutes
 * @returns {Array} Events that need reminders sent
 */
export const getEventsNeedingReminders = async () => {
  try {
    const Event = (await import('../models/Event.js')).default;
    
    const now = new Date();
    const in26Hours = new Date(now.getTime() + 26 * 60 * 60 * 1000);

    // Find upcoming events in the next 26 hours
    const upcomingEvents = await Event.find({
      status: 'Upcoming',
      startDate: {
        $gte: now,
        $lte: in26Hours,
      },
    })
      .populate('participants', 'name email')
      .populate('community', 'name')
      .lean();

    const eventsWithReminders = upcomingEvents
      .map((event) => {
        const reminders = checkEventReminders(event);
        if (reminders.length > 0) {
          return {
            event,
            reminders,
          };
        }
        return null;
      })
      .filter(Boolean);

    logger.info(`Found ${eventsWithReminders.length} events needing reminders`);
    return eventsWithReminders;
  } catch (error) {
    logger.error('Error checking events for reminders', error);
    return [];
  }
};

/**
 * Send calendar invitation to user (via socket notification)
 * @param {string} userId - User ID
 * @param {Object} event - Event object
 */
export const sendCalendarInvitation = async (userId, event) => {
  try {
    const socketService = await import('./socketService.js');
    const User = (await import('../models/User.js')).default;

    const user = await User.findById(userId).select('name email');
    if (!user) {
      logger.warn(`User ${userId} not found for calendar invitation`);
      return;
    }

    const calendarUrls = generateCalendarUrls(event);

    socketService.default.emitToUser(userId, 'event:calendar_invitation', {
      eventId: event._id,
      eventTitle: event.title,
      startDate: event.startDate,
      calendarUrls,
      message: `Add "${event.title}" to your calendar!`,
    });

    logger.success(`Calendar invitation sent to user ${userId} for event ${event._id}`);
  } catch (error) {
    logger.error('Error sending calendar invitation', error);
  }
};

/**
 * Send event reminder to participants
 * @param {Object} event - Event object with populated participants
 * @param {string} reminderType - '24h', '1h', or 'now'
 */
export const sendEventReminders = async (event, reminderType) => {
  try {
    const socketService = await import('./socketService.js');
    const reminderData = generateEventReminder(event, reminderType);

    // Send to all participants
    if (event.participants && event.participants.length > 0) {
      for (const participant of event.participants) {
        const userId = participant._id || participant;
        
        socketService.default.emitToUser(userId, 'event:reminder', {
          ...reminderData,
          participantName: participant.name,
        });
      }

      logger.success(
        `Sent ${reminderType} reminder to ${event.participants.length} participants for event ${event._id}`
      );
    }
  } catch (error) {
    logger.error('Error sending event reminders', error);
  }
};

export default {
  generateICalendarInvite,
  generateCalendarUrls,
  generateEventReminder,
  checkEventReminders,
  getEventsNeedingReminders,
  sendCalendarInvitation,
  sendEventReminders,
};