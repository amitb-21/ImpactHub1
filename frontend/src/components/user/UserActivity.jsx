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
import { usePagination } from "../../hooks/usePagination"; // Import usePagination
import ActivityFeed from "../activity/ActivityFeed"; // Import ActivityFeed
import { Button } from "../common/Button"; // Import Button
import { useNavigate } from "react-router-dom"; // Import useNavigate

const UserActivity = ({ userId, limit = 5 }) => {
  // Default limit to 5 as in Dashboard
  const dispatch = useDispatch();
  const navigate = useNavigate(); // Hook for navigation
  const { activity, isLoading } = useSelector((state) => state.user);

  const paginationData = activity?.pagination || { total: 0 };

  // Note: We are fetching page 1 with the specified limit.
  // Full pagination is deferred to the main activity page.
  const { page, goToPage } = usePagination(paginationData.total, 1, limit);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserActivity({ userId, page: 1, limit }));
    }
  }, [userId, dispatch, limit]); // Only fetch once for this component

  return (
    <ActivityFeed
      title="Recent Activity"
      activities={activity.data || []}
      // Pass a simplified pagination object or null
      pagination={null}
      onPageChange={null} // No pagination controls in this view
      isLoading={isLoading && !activity.data?.length}
      emptyMessage="Your activities will appear here as you engage."
    >
      {/* Child prop for 'View All' button */}
      {activity.pagination && activity.pagination.total > limit && (
        <div
          style={{
            marginTop: "16px",
            paddingTop: "16px",
            borderTop: "1px solid #e0e0e0",
            textAlign: "center",
          }}
        >
          <Button
            variant="outline"
            size="sm"
            icon={FiArrowRight}
            iconPosition="right"
            onClick={() => navigate("/activity")} // Link to global activity
          >
            View All Activity
          </Button>
        </div>
      )}
    </ActivityFeed>
  );
};

// Activity Item Row Component (No longer needed here, logic is in ActivityItem.jsx)

// Helper function to get activity info (No longer needed here, logic is in ActivityItem.jsx)

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
