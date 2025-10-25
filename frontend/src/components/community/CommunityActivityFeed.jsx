import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCommunityActivity } from "../../store/slices/activitySlice";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { Loader } from "../common/Loader";
import { FiArrowRight } from "react-icons/fi";
import { timeAgo } from "../../config/helpers";

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

  if (status === "loading") {
    return (
      <Card padding="lg" shadow="md">
        <div style={styles.loadingContainer}>
          <Loader size="sm" text="Loading activity..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="lg" shadow="md">
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>⚠️</div>
          <p style={styles.errorText}>{error}</p>
        </div>
      </Card>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <Card padding="lg" shadow="md">
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <p style={styles.emptyStateTitle}>No Activity Yet</p>
          <p style={styles.emptyStateText}>
            Community activity will appear here as members engage
          </p>
        </div>
      </Card>
    );
  }

  const displayedActivities = activities.slice(0, limit);

  if (compact) {
    return (
      <Card padding="lg" shadow="md">
        <h3 style={styles.title}>Recent Activity</h3>
        <div style={styles.compactFeed}>
          {displayedActivities.map((activity) => (
            <CompactActivityItem key={activity._id} activity={activity} />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg" shadow="md">
      <div style={styles.header}>
        <h3 style={styles.title}>Community Activity</h3>
        <span style={styles.activityCount}>{activities.length} activities</span>
      </div>

      {/* Activity Feed */}
      <div style={styles.feed}>
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
        <div style={styles.viewAllContainer}>
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

// Activity Feed Item Component
const ActivityFeedItem = ({ activity, isLast }) => {
  const { icon, color, label } = getActivityInfo(activity.type);

  return (
    <div
      style={{
        ...styles.activityItem,
        borderLeft: `4px solid ${color}`,
        borderBottom: isLast ? "none" : "1px solid #e0e0e0",
      }}
    >
      {/* Icon */}
      <div
        style={{
          ...styles.activityIcon,
          backgroundColor: `${color}20`,
          color,
        }}
      >
        {icon}
      </div>

      {/* Content */}
      <div style={styles.activityContent}>
        <div style={styles.activityHeader}>
          <span style={styles.activityLabel}>{label}</span>
          <span style={styles.activityTime}>{timeAgo(activity.createdAt)}</span>
        </div>

        {/* Description */}
        {activity.description && (
          <p style={styles.activityDescription}>{activity.description}</p>
        )}

        {/* Related Entity */}
        {activity.relatedEntity && (
          <div style={styles.relatedEntity}>
            <span style={styles.entityType}>{activity.relatedEntity.type}</span>
            <span style={styles.entityName}>{activity.relatedEntity.name}</span>
          </div>
        )}

        {/* Activity Badges */}
        {activity.points && (
          <Badge
            label={`+${activity.points} pts`}
            variant="primary"
            size="sm"
            style={{ marginTop: "8px" }}
          />
        )}
      </div>

      {/* User Info */}
      {activity.user && (
        <div style={styles.userInfo}>
          {activity.user.profileImage ? (
            <img
              src={activity.user.profileImage}
              alt={activity.user.name}
              style={styles.userAvatar}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/32?text=User";
              }}
            />
          ) : (
            <div style={styles.userAvatarPlaceholder}>
              {activity.user.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <span style={styles.userName}>{activity.user.name}</span>
        </div>
      )}
    </div>
  );
};

// Compact Activity Item Component
const CompactActivityItem = ({ activity }) => {
  const { icon } = getActivityInfo(activity.type);

  return (
    <div style={styles.compactItem}>
      <div style={styles.compactIcon}>{icon}</div>
      <div style={styles.compactItemContent}>
        <p style={styles.compactLabel}>{activity.description}</p>
        <p style={styles.compactTime}>{timeAgo(activity.createdAt)}</p>
      </div>
    </div>
  );
};

// Helper function to get activity info
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

const styles = {
  loadingContainer: {
    padding: "60px 20px",
    textAlign: "center",
  },

  errorContainer: {
    padding: "40px 20px",
    textAlign: "center",
    backgroundColor: "#fee2e2",
    borderRadius: "10px",
  },

  errorIcon: {
    fontSize: "32px",
    marginBottom: "12px",
    display: "block",
  },

  errorText: {
    color: "#991b1b",
    fontSize: "14px",
    margin: 0,
  },

  emptyState: {
    padding: "80px 40px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "56px",
    marginBottom: "16px",
    display: "block",
  },

  emptyStateTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#212121",
    margin: "0 0 8px 0",
  },

  emptyStateText: {
    fontSize: "14px",
    color: "#999",
    margin: 0,
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
    paddingBottom: "16px",
    borderBottom: "2px solid #e0e0e0",
  },

  title: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#212121",
    margin: 0,
  },

  activityCount: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#666",
    backgroundColor: "#f0f8f7",
    padding: "6px 12px",
    borderRadius: "20px",
  },

  feed: {
    display: "flex",
    flexDirection: "column",
    gap: "0",
  },

  activityItem: {
    display: "flex",
    gap: "12px",
    padding: "16px 0",
    paddingLeft: "12px",
    transition: "all 0.3s ease",
  },

  activityIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    flexShrink: 0,
  },

  activityContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  activityHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },

  activityLabel: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#212121",
  },

  activityTime: {
    fontSize: "12px",
    color: "#999",
    fontWeight: "500",
    whiteSpace: "nowrap",
  },

  activityDescription: {
    fontSize: "13px",
    color: "#666",
    margin: 0,
  },

  relatedEntity: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    backgroundColor: "#f9f9f9",
    borderRadius: "6px",
    fontSize: "12px",
  },

  entityType: {
    fontWeight: "600",
    color: "#00796B",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  entityName: {
    color: "#666",
  },

  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "0 8px",
    minWidth: "150px",
  },

  userAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #00796B",
  },

  userAvatarPlaceholder: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "#00796B",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    fontWeight: "700",
    color: "#FAFAFA",
    border: "2px solid #00796B",
  },

  userName: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#212121",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  viewAllContainer: {
    display: "flex",
    justifyContent: "center",
    paddingTop: "16px",
    borderTop: "1px solid #e0e0e0",
  },

  // Compact styles
  compactFeed: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  compactItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "12px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
  },

  compactIcon: {
    fontSize: "20px",
    minWidth: "24px",
    marginTop: "2px",
  },

  compactItemContent: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    flex: 1,
  },

  compactLabel: {
    fontSize: "13px",
    color: "#212121",
    fontWeight: "500",
    margin: 0,
  },

  compactTime: {
    fontSize: "11px",
    color: "#999",
    margin: 0,
  },

  "@media (max-width: 768px)": {
    userInfo: {
      display: "none",
    },
  },
};

export default CommunityActivityFeed;
