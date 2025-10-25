import React from "react";
import { useNavigate } from "react-router-dom";
import CommunityCard from "./CommunityCard";
import { Loader } from "../common/Loader";
import { Button } from "../common/Button";
import { FiArrowRight } from "react-icons/fi";
import styles from "./styles/CommunityList.module.css";

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

  // Loading State
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader size="md" text="Loading communities..." />
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
  if (!communities || communities.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🏘️</div>
        <p className={styles.emptyStateTitle}>No Communities</p>
        <p className={styles.emptyStateText}>{emptyMessage}</p>
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

  const gridClass = compact ? styles.gridCompact : styles.gridRegular;

  return (
    <div>
      {/* Grid Container */}
      <div className={`${styles.grid} ${gridClass}`}>
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
        <div className={styles.viewAllContainer}>
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

export default CommunityList;
