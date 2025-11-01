import React, { useState, useEffect } from "react";
import { calendarAPI } from "../../api/services";
import { Button } from "../common/Button";
import { FiCalendar, FiChevronDown } from "react-icons/fi";
import styles from "./styles/CalendarShare.module.css";
import { API_URL } from "../../config/constants";

const CalendarShare = ({ eventId, eventTitle }) => {
  const [links, setLinks] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLinks = async () => {
    if (links) {
      setIsOpen(!isOpen);
      return;
    }
    setIsLoading(true);
    try {
      const response = await calendarAPI.getInviteURLs(eventId);
      setLinks(response.data.data.calendarUrls);
      setIsOpen(true);
    } catch (error) {
      console.error("Failed to fetch calendar links", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Button
        size="md"
        variant="outline"
        icon={FiCalendar}
        iconPosition="right"
        onClick={fetchLinks}
        loading={isLoading}
        fullWidth
      >
        Add to Calendar
      </Button>

      {isOpen && links && (
        <div className={styles.dropdown}>
          <a
            href={links.google}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Google Calendar
          </a>
          <a
            href={links.outlook}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Outlook
          </a>
          <a
            href={links.office365}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Office 365
          </a>
          <a
            href={links.yahoo}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Yahoo
          </a>
          <a
            href={`${API_URL}/location/calendar/${eventId}/download.ics`}
            className={styles.link}
          >
            Download .ics
          </a>
        </div>
      )}
    </div>
  );
};

export default CalendarShare;
