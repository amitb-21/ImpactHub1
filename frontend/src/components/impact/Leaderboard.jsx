import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../common/Card";
import { Loader } from "../common/Loader";
import { Button } from "../common/Button";
import { formatPoints } from "../../config/formatters";
import { calculateRank } from "../../config/helpers";
import styles from "./styles/Leaderboard.module.css";

const Leaderboard = ({
  data = [],
  currentUserId,
  metric = "points",
  onPageChange,
  isLoading = false,
  pagination,
}) => {
  const navigate = useNavigate();

  if (isLoading) {
    return <Loader size="md" text="Loading leaderboard..." />;
  }

  if (data.length === 0) {
    return (
      <Card padding="lg" shadow="md">
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🏆</div>
          <h3 className={styles.emptyTitle}>No Rankings Yet</h3>
          <p className={styles.emptyText}>
            {metric === "points"
              ? "Be the first to earn points and claim your spot!"
              : metric === "hours"
              ? "Start volunteering to appear on the leaderboard!"
              : "Complete activities to level up and rank here!"}
          </p>
        </div>
      </Card>
    );
  }

  const getMetricValue = (user) => {
    switch (metric) {
      case "level":
        return `Lvl ${user.level || 1}`;
      case "hours":
        return `${user.metrics?.hoursVolunteered || 0}h`;
      case "points":
      default:
        return formatPoints(user.totalPoints || 0);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {data.map((user, index) => {
          const rank = calculateRank(user.totalPoints || 0);
          const isCurrentUser = user._id === currentUserId;
          const rankNumber =
            (pagination.page - 1) * pagination.limit + index + 1;

          return (
            <div
              key={user._id}
              className={`${styles.row} ${
                isCurrentUser ? styles.currentUser : ""
              }`}
              onClick={() => navigate(`/profile/${user._id}`)}
            >
              <div className={styles.rank}>{rankNumber}</div>
              <div className={styles.user}>
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.name}
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <div className={styles.userInfo}>
                  <span className={styles.name}>{user.name}</span>
                  <span
                    className={styles.rankName}
                    style={{ color: rank.color }}
                  >
                    {rank.name}
                  </span>
                </div>
              </div>
              <div className={styles.metric} style={{ color: rank.color }}>
                {getMetricValue(user)}
              </div>
            </div>
          );
        })}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Previous
          </Button>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
