import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCommunityActivity } from "../../store/slices/activitySlice";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { Loader } from "../common/Loader";
import { FiArrowRight } from "react-icons/fi";
import { timeAgo } from "../../config/helpers";
import styles from "./styles/CommunityActivityFeed.module.css";

const CommunityActivityFeed = ({
  communityId,
  limit = 10,
  showViewAll = false,
  compact = false,
}) => {
  const dispatch = useDispatch();
  const { activities, status, error } = useSelector(
    (state) => state.activities
  );
  const [page, setPage] = React.useState(1);

  useEffect(() => {
    if (communityId) {
      dispatch(fetchCommunityActivity(communityId));
    }
  }, [communityId, dispatch]);

  // Loading State
  if (status === "loading") {
    return (
      <Card padding="lg" shadow="md">
        <div className={styles.loadingContainer}>
          <Loader size="sm" text="Loading activity..." />
        </div>
      </Card>
    );
  }

  // Error State
  if (error) {
    return (
      <Card padding="lg" shadow="md">
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <p className={styles.errorText}>{error}</p>
        </div>
      </Card>
    );
  }

  // Empty State
  if (!activities || activities.length === 0) {
    return (
      <Card padding="lg" shadow="md">
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📭</div>
          <p className={styles.emptyStateTitle}>No Activity Yet</p>
          <p className={styles.emptyStateText}>
            Community activity will appear here as members engage
          </p>
        </div>
      </Card>
    );
  }

  const displayedActivities = activities.slice(0, limit);

  // Compact View
  if (compact) {
    return (
      <Card padding="lg" shadow="md">
        <h3 className={styles.title}>Recent Activity</h3>
        <div className={styles.compactFeed}>
          {displayedActivities.map((activity) => (
            <CompactActivityItem key={activity._id} activity={activity} />
          ))}
        </div>
      </Card>
    );
  }

  // Full View
  return (
    <Card padding="lg" shadow="md">
      <div className={styles.header}>
        <h3 className={styles.title}>Community Activity</h3>
        <span className={styles.activityCount}>
          {activities.length} activities
        </span>
      </div>

      {/* Activity Feed */}
      <div className={styles.feed}>
        {displayedActivities.map((activity, index) => (
          <ActivityFeedItem
            key={activity._id}
            activity={activity}
            isLast={index === displayedActivities.length - 1}
          />
        ))}
      </div>

      {/* View All Button */}
      {showViewAll && activities.length > displayedActivities.length && (
        <div className={styles.viewAllContainer}>
          <Button
            variant="outline"
            size="sm"
            icon={FiArrowRight}
            iconPosition="right"
          >
            View All Activity ({activities.length})
          </Button>
        </div>
      )}
    </Card>
  );
};

/**
 * Activity Feed Item Component
 * Displays individual activity with icon, content, and user info
 */
const ActivityFeedItem = ({ activity, isLast }) => {
  const { icon, color, label } = getActivityInfo(activity.type);

  return (
    <div
      className={styles.activityItem}
      style={{
        borderLeft: `4px solid ${color}`,
        borderBottom: isLast ? "none" : "1px solid #e0e0e0",
      }}
    >
      {/* Activity Icon */}
      <div
        className={styles.activityIcon}
        style={{
          backgroundColor: `${color}20`,
          color,
        }}
      >
        {icon}
      </div>

      {/* Activity Content */}
      <div className={styles.activityContent}>
        {/* Header with Label and Time */}
        <div className={styles.activityHeader}>
          <span className={styles.activityLabel}>{label}</span>
          <span className={styles.activityTime}>
            {timeAgo(activity.createdAt)}
          </span>
        </div>

        {/* Description */}
        {activity.description && (
          <p className={styles.activityDescription}>{activity.description}</p>
        )}

        {/* Related Entity */}
        {activity.relatedEntity && (
          <div className={styles.relatedEntity}>
            <span className={styles.entityType}>
              {activity.relatedEntity.type}
            </span>
            <span className={styles.entityName}>
              {activity.relatedEntity.name}
            </span>
          </div>
        )}

        {/* Points Badge */}
        {activity.points && (
          <div style={{ marginTop: "8px" }}>
            <Badge
              label={`+${activity.points} pts`}
              variant="primary"
              size="sm"
            />
          </div>
        )}
      </div>

      {/* User Info */}
      {activity.user && (
        <div className={styles.userInfo}>
          {activity.user.profileImage ? (
            <img
              src={activity.user.profileImage}
              alt={activity.user.name}
              className={styles.userAvatar}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/32?text=User";
              }}
            />
          ) : (
            <div className={styles.userAvatarPlaceholder}>
              {activity.user.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <span className={styles.userName}>{activity.user.name}</span>
        </div>
      )}
    </div>
  );
};

/**
 * Compact Activity Item Component
 * Lightweight version for sidebar/reduced-space displays
 */
const CompactActivityItem = ({ activity }) => {
  const { icon } = getActivityInfo(activity.type);

  return (
    <div className={styles.compactItem}>
      <div className={styles.compactIcon}>{icon}</div>
      <div className={styles.compactItemContent}>
        <p className={styles.compactLabel}>{activity.description}</p>
        <p className={styles.compactTime}>{timeAgo(activity.createdAt)}</p>
      </div>
    </div>
  );
};

/**
 * Helper function to get activity metadata
 * Maps activity types to display icons, colors, and labels
 */
const getActivityInfo = (type) => {
  const activityMap = {
    event_created: {
      icon: "📅",
      color: "#00796B",
      label: "Event Created",
    },
    event_joined: {
      icon: "🎫",
      color: "#3b82f6",
      label: "Event Joined",
    },
    event_attended: {
      icon: "✅",
      color: "#10b981",
      label: "Event Attended",
    },
    community_member_joined: {
      icon: "👥",
      color: "#8b5cf6",
      label: "New Member Joined",
    },
    badge_earned: {
      icon: "🏆",
      color: "#FFB300",
      label: "Badge Earned",
    },
    points_earned: {
      icon: "⭐",
      color: "#FFB300",
      label: "Points Earned",
    },
    rating_created: {
      icon: "⭐",
      color: "#FFB300",
      label: "Rating Submitted",
    },
    photo_uploaded: {
      icon: "📸",
      color: "#f59e0b",
      label: "Photo Uploaded",
    },
    community_verified: {
      icon: "✔️",
      color: "#10b981",
      label: "Community Verified",
    },
    default: {
      icon: "📝",
      color: "#666",
      label: "Activity",
    },
  };

  return activityMap[type] || activityMap.default;
};

export default CommunityActivityFeed;
