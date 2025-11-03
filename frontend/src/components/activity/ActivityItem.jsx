import React from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../common/Badge";
import { timeAgo, getInitials } from "../../config/helpers";
import styles from "./styles/ActivityItem.module.css";

const ActivityItem = ({ activity }) => {
  const navigate = useNavigate();

  if (!activity || !activity.user) return null;

  const { icon, color, defaultDesc } = getActivityInfo(activity.type);
  const description = activity.description || defaultDesc;
  const points = activity.metadata?.pointsEarned;
  const user = activity.user;
  const related = activity.relatedEntity || null; // may contain { entityType, entityId, title }
  // entityId can be either an id string or an object with _id/title
  const entityIdRaw = related?.entityId;
  const entityId =
    typeof entityIdRaw === "string"
      ? entityIdRaw
      : entityIdRaw?._id || entityIdRaw?.id;
  const entityTitle =
    related?.title ||
    related?.name ||
    (typeof entityIdRaw === "object"
      ? entityIdRaw?.title || entityIdRaw?.name
      : null);

  const handleUserClick = () => {
    if (user?._id) navigate(`/profile/${user._id}`);
  };

  const handleEntityClick = () => {
    if (!entityId || !related?.entityType) return;

    const type = related.entityType;
    const id = entityId;

    if (type === "Event") navigate(`/events/${id}`);
    if (type === "Community") navigate(`/communities/${id}`);
    if (type === "Resource") navigate(`/resources/${id}`);
  };

  return (
    <div className={styles.activityItem} style={{ borderLeftColor: color }}>
      <div
        className={styles.activityIcon}
        style={{ backgroundColor: `${color}20`, color }}
      >
        {icon}
      </div>

      <div className={styles.activityContent}>
        <div className={styles.activityHeader}>
          <div className={styles.userInfo} onClick={handleUserClick}>
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className={styles.userAvatar}
              />
            ) : (
              <div className={styles.userAvatarPlaceholder}>
                {getInitials(user.name)}
              </div>
            )}
            <span className={styles.userName}>{user.name}</span>
          </div>
          <span className={styles.activityTime}>
            {timeAgo(activity.createdAt)}
          </span>
        </div>

        <p className={styles.activityDescription}>
          {description}
          {entityId && (
            <span onClick={handleEntityClick} className={styles.entityLink}>
              {entityTitle || "view"}
            </span>
          )}
        </p>

        {points > 0 && (
          <div style={{ marginTop: "8px" }}>
            <Badge
              label={`+${points} pts`}
              variant="primary"
              size="sm"
              style={{ backgroundColor: "#FFB300", color: "#212121" }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to get activity metadata
const getActivityInfo = (type) => {
  const activityMap = {
    event_created: {
      icon: "📅",
      color: "#00796B",
      defaultDesc: "Created an event",
    },
    event_joined: {
      icon: "📍",
      color: "#3b82f6",
      defaultDesc: "Joined an event",
    },
    event_attended: {
      icon: "✅",
      color: "#10b981",
      defaultDesc: "Attended an event",
    },
    event_saved: {
      icon: "⭐",
      color: "#f59e0b",
      defaultDesc: "Saved an event",
    },
    community_joined: {
      icon: "👥",
      color: "#8b5cf6",
      defaultDesc: "Joined a community",
    },
    community_created: {
      icon: "🏢",
      color: "#8b5cf6",
      defaultDesc: "Created a community",
    },
    badge_earned: {
      icon: "🏆",
      color: "#FFB300",
      defaultDesc: "Earned a badge",
    },
    points_earned: {
      icon: "💎",
      color: "#FFB300",
      defaultDesc: "Earned points",
    },
    rating_created: {
      icon: "⭐",
      color: "#FFB300",
      defaultDesc: "Submitted a rating",
    },
    event_photo_uploaded: {
      icon: "📸",
      color: "#f59e0b",
      defaultDesc: "Uploaded a photo",
    },
    community_verification_verified: {
      icon: "✓",
      color: "#10b981",
      defaultDesc: "Community verified",
    },
    verification_requested: {
      icon: "🔍",
      color: "#f59e0b",
      defaultDesc: "Requested verification",
    },
    resource_created: {
      icon: "📖",
      color: "#64748b",
      defaultDesc: "Created a resource",
    },
    default: {
      icon: "📝",
      color: "#666",
      defaultDesc: "New activity",
    },
  };

  return activityMap[type] || activityMap.default;
};

export default ActivityItem;
