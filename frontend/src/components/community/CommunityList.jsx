import React from "react";
import { useNavigate } from "react-router-dom";
import CommunityCard from "./CommunityCard";
import { Loader } from "../common/Loader";
import { Button } from "../common/Button";
import { FiArrowRight } from "react-icons/fi";

const CommunityList = ({
  communities = [],
  isLoading = false,
  error = null,
  onCommunitySelect,
  onJoin,
  compact = false,
  showViewAll = false,
  maxItems = null,
  emptyMessage = "No communities found",
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <Loader size="md" text="Loading communities..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>⚠️</div>
        <p style={styles.errorText}>{error}</p>
      </div>
    );
  }

  if (!communities || communities.length === 0) {
    return (
      <div style={styles.emptyState}>
        <div style={styles.emptyIcon}>🏘️</div>
        <p style={styles.emptyStateTitle}>No Communities</p>
        <p style={styles.emptyStateText}>{emptyMessage}</p>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate("/communities")}
          icon={FiArrowRight}
          iconPosition="right"
          style={{ marginTop: "16px" }}
        >
          Browse All Communities
        </Button>
      </div>
    );
  }

  const displayedCommunities = maxItems
    ? communities.slice(0, maxItems)
    : communities;

  return (
    <div>
      {/* Grid Container */}
      <div
        style={{
          ...styles.grid,
          ...(compact ? styles.gridCompact : styles.gridRegular),
        }}
      >
        {displayedCommunities.map((community) => (
          <CommunityCard
            key={community._id}
            community={community}
            onView={onCommunitySelect}
            onJoin={onJoin}
            compact={compact}
          />
        ))}
      </div>

      {/* View All Button */}
      {showViewAll && communities.length > displayedCommunities.length && (
        <div style={styles.viewAllContainer}>
          <Button
            variant="outline"
            onClick={() => navigate("/communities")}
            icon={FiArrowRight}
            iconPosition="right"
          >
            View All {communities.length} Communities
          </Button>
        </div>
      )}
    </div>
  );
};

const styles = {
  grid: {
    display: "grid",
    gap: "20px",
    marginBottom: "20px",
  },

  gridRegular: {
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  },

  gridCompact: {
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
  },

  loadingContainer: {
    padding: "60px 20px",
    textAlign: "center",
  },

  errorContainer: {
    padding: "40px 20px",
    textAlign: "center",
    backgroundColor: "#fee2e2",
    borderRadius: "10px",
    border: "1px solid #fca5a5",
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
    backgroundColor: "#f9f9f9",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
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
    margin: "0 0 16px 0",
  },

  viewAllContainer: {
    display: "flex",
    justifyContent: "center",
    paddingTop: "20px",
    borderTop: "1px solid #e0e0e0",
  },

  "@media (max-width: 768px)": {
    gridRegular: {
      gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    },
    gridCompact: {
      gridTemplateColumns: "1fr",
    },
  },
};

export default CommunityList;
