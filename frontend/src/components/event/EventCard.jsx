import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import {
  FiUsers,
  FiMapPin,
  FiCalendar,
  FiCheckCircle,
  FiArrowRight,
} from "react-icons/fi";
import { formatDate, truncate } from "../../config/helpers";
import { formatCapacity } from "../../config/formatters";
import styles from "./styles/EventCard.module.css";

const EventCard = ({ event, onJoin, onView, style = {}, compact = false }) => {
  const navigate = useNavigate();

  if (!event) {
    return (
      <Card padding="md" shadow="sm">
        <div className={styles.emptyState}>
          <p>No event data</p>
        </div>
      </Card>
    );
  }

  const isEventFull = event.registeredCount >= event.maxParticipants;
  const isClosed = event.status === "Cancelled" || event.status === "Completed";
  const registeredCount =
    event.participants?.length || event.registeredCount || 0;
  const capacity = event.maxParticipants || 0;

  if (compact) {
    return (
      <Card
        onClick={() =>
          onView ? onView(event) : navigate(`/events/${event._id}`)
        }
        hover
        shadow="sm"
        padding="sm"
        style={{ cursor: "pointer", ...style }}
      >
        <div className={styles.compactContainer}>
          <div className={styles.compactImage}>
            {event.image ? (
              <img
                src={event.image}
                alt={event.title}
                className={styles.compactImageTag}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/60?text=Event";
                }}
              />
            ) : (
              <div className={styles.compactImagePlaceholder}>📅</div>
            )}
          </div>
          <div className={styles.compactContent}>
            <div className={styles.compactHeader}>
              <h4 className={styles.compactName}>
                {truncate(event.title, 25)}
              </h4>
              {event.status === "Ongoing" && (
                <div className={styles.liveIndicator}>● Live</div>
              )}
            </div>
            <p className={styles.compactMeta}>
              <FiCalendar
                size={12}
                style={{ display: "inline", marginRight: "4px" }}
              />
              {formatDate(event.startDate)}
            </p>
            <p className={styles.compactParticipants}>
              <FiUsers
                size={12}
                style={{ display: "inline", marginRight: "4px" }}
              />
              {registeredCount} joined
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      onClick={() =>
        onView ? onView(event) : navigate(`/events/${event._id}`)
      }
      hover
      shadow="md"
      padding="md"
      style={{ cursor: "pointer", ...style }}
    >
      {/* Header Image */}
      <div className={styles.imageContainer}>
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className={styles.image}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/300x180?text=Event";
            }}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.placeholderIcon}>📅</span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className={styles.badgesOverlay}>
          {event.status && (
            <Badge
              label={event.status}
              variant={
                event.status === "Upcoming"
                  ? "info"
                  : event.status === "Ongoing"
                  ? "success"
                  : event.status === "Completed"
                  ? "warning"
                  : "error"
              }
              size="sm"
              style={{ marginRight: "8px" }}
            />
          )}
          {event.category && (
            <Badge label={event.category} variant="primary" size="sm" />
          )}
        </div>

        {/* Status Indicator */}
        {event.status === "Ongoing" && (
          <div className={styles.statusIndicator}>
            <span className={styles.liveIndicatorLarge}>● LIVE</span>
          </div>
        )}

        {/* Capacity Indicator */}
        {isEventFull && (
          <div className={styles.fullIndicator}>
            <span>FULL</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={styles.content}>
        {/* Title */}
        <h3 className={styles.title}>{truncate(event.title, 50)}</h3>

        {/* Date & Time */}
        <div className={styles.dateTime}>
          <FiCalendar size={16} style={{ color: "#00796B" }} />
          <span className={styles.dateText}>{formatDate(event.startDate)}</span>
          {event.startTime && (
            <span className={styles.timeText}>at {event.startTime}</span>
          )}
        </div>

        {/* Location */}
        {event.location && (
          <div className={styles.location}>
            <FiMapPin size={16} style={{ color: "#00796B" }} />
            <span className={styles.locationText}>
              {event.location.city || "Location"}
            </span>
          </div>
        )}

        {/* Description */}
        <p className={styles.description}>{truncate(event.description, 100)}</p>

        {/* Meta Info */}
        <div className={styles.metaContainer}>
          {/* Participants */}
          <div className={styles.metaItem}>
            <FiUsers size={16} style={{ color: "#00796B" }} />
            <span className={styles.metaText}>
              {formatCapacity(registeredCount, capacity)}
            </span>
          </div>

          {/* Organizer */}
          {event.organizer && (
            <div className={styles.metaItem}>
              <span className={styles.orgLabel}>by {event.organizer.name}</span>
            </div>
          )}
        </div>

        {/* Capacity Bar */}
        <div className={styles.capacityBar}>
          <div
            className={styles.capacityFill}
            style={{
              width: `${Math.min((registeredCount / capacity) * 100, 100)}%`,
              backgroundColor: isEventFull ? "#ef4444" : "#00796B",
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className={styles.actionContainer}>
          {!isClosed ? (
            <>
              <Button
                size="sm"
                variant="primary"
                fullWidth
                disabled={isEventFull}
                onClick={(e) => {
                  e.stopPropagation();
                  onJoin ? onJoin(event) : navigate(`/events/${event._id}`);
                }}
              >
                {isEventFull ? "Event Full" : "Join Event"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/events/${event._id}`);
                }}
                icon={FiArrowRight}
              >
                View Details
              </Button>
            </>
          ) : (
            <Button size="sm" variant="outline" fullWidth disabled>
              {event.status === "Completed"
                ? "Event Completed"
                : "Event Cancelled"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EventCard;
