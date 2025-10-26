// backend/src/services/eventReminderService.js
import { getEventsNeedingReminders, sendEventReminders } from './calendarService.js';
import { logger } from '../utils/logger.js';

/**
 * Event Reminder Service
 * Checks upcoming events and sends reminders to participants
 */

let reminderInterval = null;

/**
 * Start the event reminder service
 * Checks every 15 minutes for events needing reminders
 */
export const startEventReminderService = () => {
  if (reminderInterval) {
    logger.warn('Event reminder service already running');
    return;
  }

  logger.info('Starting event reminder service...');

  // Run immediately on startup
  checkAndSendReminders();

  // Then run every 15 minutes
  reminderInterval = setInterval(() => {
    checkAndSendReminders();
  }, 15 * 60 * 1000); // 15 minutes

  logger.success('✅ Event reminder service started (checking every 15 minutes)');
};

/**
 * Stop the event reminder service
 */
export const stopEventReminderService = () => {
  if (reminderInterval) {
    clearInterval(reminderInterval);
    reminderInterval = null;
    logger.info('Event reminder service stopped');
  }
};

/**
 * Check for events needing reminders and send them
 */
const checkAndSendReminders = async () => {
  try {
    logger.debug('Checking for events needing reminders...');

    const eventsWithReminders = await getEventsNeedingReminders();

    if (eventsWithReminders.length === 0) {
      logger.debug('No events need reminders at this time');
      return;
    }

    logger.info(`Processing reminders for ${eventsWithReminders.length} events`);

    for (const { event, reminders } of eventsWithReminders) {
      for (const reminderType of reminders) {
        await sendEventReminders(event, reminderType);
        logger.success(`Sent ${reminderType} reminders for event: ${event.title}`);
      }
    }

    logger.success(`Successfully processed ${eventsWithReminders.length} event reminders`);
  } catch (error) {
    logger.error('Error in reminder service', error);
  }
};

/**
 * Manually trigger reminder check (for testing)
 */
export const triggerReminderCheck = async () => {
  logger.info('Manually triggering reminder check...');
  await checkAndSendReminders();
};

export default {
  startEventReminderService,
  stopEventReminderService,
  triggerReminderCheck,
};