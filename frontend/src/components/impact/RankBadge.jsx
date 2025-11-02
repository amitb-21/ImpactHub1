import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserMetrics } from "../../store/slices/impactSlice";
import { Card } from "../common/Card";
import { Loader } from "../common/Loader";
import { calculateRank } from "../../config/helpers";
import { formatPoints } from "../../config/formatters";
import styles from "./styles/RankBadge.module.css";

const RankBadge = ({ userId, size = "medium", showLabel = true }) => {
  const dispatch = useDispatch();
  const { metrics, isLoading, error } = useSelector((state) => state.impact);

  useEffect(() => {
    if (userId && !metrics) {
      // Only fetch if metrics aren't already loaded
      dispatch(fetchUserMetrics(userId));
    }
  }, [userId, metrics, dispatch]);

  if (isLoading) {
    return <Loader size="sm" text="" />;
  }

  if (error || !metrics) {
    return null;
  }

  const rank = calculateRank(metrics.totalPoints || 0);
  if (!rank) return null;

  const rankColor = rank.color || "#10b981";

  if (size === "small") {
    return (
      <span
        className={styles.smallBadge}
        style={{ backgroundColor: `${rankColor}20`, color: rankColor }}
      >
        {rank.icon || "🏆"} {showLabel && rank.name}
      </span>
    );
  }

  if (size === "large") {
    return (
      <Card padding="lg" shadow="md" className={styles.largeCard}>
        <div
          className={styles.largeIcon}
          style={{ backgroundColor: `${rankColor}20`, color: rankColor }}
        >
          {rank.icon || "🏆"}
        </div>
        <h3 className={styles.largeName} style={{ color: rankColor }}>
          {rank.name}
        </h3>
        <p className={styles.largePoints}>
          {formatPoints(metrics.totalPoints || 0)} Points
        </p>
        <p className={styles.largeNext}>
          {metrics.totalPoints < 5000
            ? `${formatPoints(rank.max + 1 - metrics.totalPoints)} to next rank`
            : "You are a Legend!"}
        </p>
      </Card>
    );
  }

  // Medium (default)
  return (
    <div className={styles.mediumBadge}>
      <span
        className={styles.mediumIcon}
        style={{ backgroundColor: `${rankColor}20`, color: rankColor }}
      >
        {rank.icon || "🏆"}
      </span>
      <div className={styles.mediumInfo}>
        <span className={styles.mediumName}>{rank.name}</span>
        <span className={styles.mediumPoints}>
          {formatPoints(metrics.totalPoints || 0)} pts
        </span>
      </div>
    </div>
  );
};

export default RankBadge;
