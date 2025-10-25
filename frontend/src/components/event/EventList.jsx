import React from "react";
import { useNavigate } from "react-router-dom";
import EventCard from "./EventCard";
import { Loader } from "../common/Loader";
import { Button } from "../common/Button";
import { FiArrowRight } from "react-icons/fi";
import styles from "./styles/EventList.module.css";

const EventList = ({
  events = [],
  isLoading = false,
  error = null,
  onEventSelect,
  onJoin,
  compact = false,
  showViewAll = false,
  maxItems = null,
  emptyMessage = "No events found",
}) => {
  const navigate = useNavigate();

  // Loading State
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader size="md" text="Loading events..." />
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  // Empty State
  if (!events || events.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📅</div>
        <p className={styles.emptyStateTitle}>No Events</p>
        <p className={styles.emptyStateText}>{emptyMessage}</p>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate("/events")}
          icon={FiArrowRight}
          iconPosition="right"
          style={{ marginTop: "16px" }}
        >
          Browse All Events
        </Button>
      </div>
    );
  }

  const displayedEvents = maxItems ? events.slice(0, maxItems) : events;

  const gridClass = compact ? styles.gridCompact : styles.gridRegular;

  return (
    <div>
      {/* Grid Container */}
      <div className={`${styles.grid} ${gridClass}`}>
        {displayedEvents.map((event) => (
          <EventCard
            key={event._id}
            event={event}
            onView={onEventSelect}
            onJoin={onJoin}
            compact={compact}
          />
        ))}
      </div>

      {/* View All Button */}
      {showViewAll && events.length > displayedEvents.length && (
        <div className={styles.viewAllContainer}>
          <Button
            variant="outline"
            onClick={() => navigate("/events")}
            icon={FiArrowRight}
            iconPosition="right"
          >
            View All {events.length} Events
          </Button>
        </div>
      )}
    </div>
  );
};

export default EventList;
