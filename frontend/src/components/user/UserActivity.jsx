import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserActivity } from "../../store/slices/userSlice";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Loader } from "../common/Loader";
import {
  FiArrowRight,
  FiCalendar,
  FiUsers,
  FiAward,
  FiImage,
} from "react-icons/fi";
import { timeAgo, truncate } from "../../config/helpers";

const UserActivity = ({ userId, limit = 10 }) => {
  const dispatch = useDispatch();
  const { activity, isLoading } = useSelector((state) => state.user);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserActivity({ userId, page: 1 }));
    }
  }, [userId, dispatch]);

  if (isLoading) {
    return (
      <Card padding="lg" style={styles.card}>
        <div style={styles.loadingContainer}>
          <Loader size="sm" text="Loading activities..." />
        </div>
      </Card>
    );
  }

  if (!activity.data || activity.data.length === 0) {
    return (
      <Card padding="lg" style={styles.card}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <p style={styles.emptyStateTitle}>No Activity Yet</p>
          <p style={styles.emptyStateText}>
            Your activities will appear here as you engage with ImpactHub
          </p>
        </div>
      </Card>
    );
  }

  const displayedActivities = activity.data.slice(0, limit);

  return (
    <Card padding="lg" shadow="md" style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>Recent Activity</h3>
        <span style={styles.subtitle}>Your recent actions</span>
      </div>

      <div style={styles.activityList}>
        {displayedActivities.map((item, index) => (
          <ActivityItemRow key={item._id || index} activity={item} />
        ))}
      </div>

      {activity.pagination && activity.pagination.totalPages > 1 && (
        <div style={styles.viewMore}>
          <a href="#" style={styles.viewMoreLink}>
            View all activities
            <FiArrowRight size={16} style={{ marginLeft: "6px" }} />
          </a>
        </div>
      )}
    </Card>
  );
};

// Activity Item Row Component
const ActivityItemRow = ({ activity }) => {
  const { icon, color, label, description } = getActivityInfo(activity.type);

  return (
    <div style={styles.activityItem}>
      {/* Icon */}
      <div
        style={{ ...styles.activityIcon, backgroundColor: `${color}20`, color }}
      >
        {icon}
      </div>

      {/* Content */}
      <div style={styles.activityContent}>
        <div style={styles.activityLabel}>{label}</div>
        <p style={styles.activityDescription}>{description}</p>
        <span style={styles.activityTime}>{timeAgo(activity.createdAt)}</span>
      </div>

      {/* Badge if applicable */}
      {activity.points && (
        <Badge
          label={`+${activity.points} pts`}
          variant="primary"
          size="sm"
          style={{ marginLeft: "auto" }}
        />
      )}
    </div>
  );
};

// Helper function to get activity info
const getActivityInfo = (type) => {
  const activityMap = {
    event_joined: {
      icon: "🎫",
      color: "#00796B",
      label: "Event Joined",
      description: "You joined an event",
    },
    event_created: {
      icon: "✏️",
      color: "#3b82f6",
      label: "Event Created",
      description: "You created a new event",
    },
    event_attended: {
      icon: "✅",
      color: "#10b981",
      label: "Event Attended",
      description: "Your attendance was verified",
    },
    event_saved: {
      icon: "💾",
      color: "#f59e0b",
      label: "Event Saved",
      description: "You saved an event to your wishlist",
    },
    event_photo_uploaded: {
      icon: "📸",
      color: "#8b5cf6",
      label: "Photo Uploaded",
      description: "You uploaded a photo to an event",
    },
    community_joined: {
      icon: "👥",
      color: "#00796B",
      label: "Community Joined",
      description: "You joined a community",
    },
    community_created: {
      icon: "🏗️",
      color: "#3b82f6",
      label: "Community Created",
      description: "You created a new community",
    },
    community_deactivated: {
      icon: "🔴",
      color: "#ef4444",
      label: "Community Deactivated",
      description: "A community you joined was deactivated",
    },
    badge_earned: {
      icon: "🏆",
      color: "#FFB300",
      label: "Badge Earned",
      description: "You earned a new badge",
    },
    points_earned: {
      icon: "⭐",
      color: "#FFB300",
      label: "Points Earned",
      description: "You earned points",
    },
    rating_created: {
      icon: "⭐",
      color: "#FFB300",
      label: "Rating Submitted",
      description: "You submitted a rating",
    },
    verification_requested: {
      icon: "🔍",
      color: "#f59e0b",
      label: "Verification Requested",
      description: "You requested community verification",
    },
    community_verification_verified: {
      icon: "✅",
      color: "#10b981",
      label: "Community Verified",
      description: "Your community was verified",
    },
    community_verification_rejected: {
      icon: "❌",
      color: "#ef4444",
      label: "Verification Rejected",
      description: "Your community verification was rejected",
    },
    user_deactivated: {
      icon: "🚫",
      color: "#ef4444",
      label: "Account Deactivated",
      description: "Your account was deactivated",
    },
    resource_created: {
      icon: "📚",
      color: "#8b5cf6",
      label: "Resource Created",
      description: "You created a new resource",
    },
    default: {
      icon: "📝",
      color: "#999",
      label: "Activity",
      description: "Something happened",
    },
  };

  return activityMap[type] || activityMap.default;
};

const styles = {
  card: {
    width: "100%",
  },
  loadingContainer: {
    padding: "40px 20px",
    textAlign: "center",
  },
  emptyState: {
    padding: "60px 20px",
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
    display: "block",
  },
  emptyStateTitle: {
    fontSize: "16px",
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
    marginBottom: "24px",
    paddingBottom: "12px",
    borderBottom: "2px solid #e0e0e0",
  },
  title: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#212121",
    margin: "0 0 4px 0",
  },
  subtitle: {
    fontSize: "13px",
    color: "#666",
  },
  activityList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  activityItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "16px",
    padding: "16px",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    border: "1px solid #e0e0e0",
    transition: "all 0.3s ease",
  },
  activityIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    flexShrink: 0,
  },
  activityContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },
  activityLabel: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#212121",
  },
  activityDescription: {
    fontSize: "13px",
    color: "#666",
    margin: 0,
  },
  activityTime: {
    fontSize: "12px",
    color: "#999",
    fontWeight: "500",
  },
  viewMore: {
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #e0e0e0",
    textAlign: "center",
  },
  viewMoreLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#00796B",
    textDecoration: "none",
    transition: "color 0.2s ease",
  },
};

export default UserActivity;
