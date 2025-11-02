import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserMetrics } from "../../store/slices/impactSlice";
import { useAuth } from "../../hooks/useAuth";
import { Card } from "../common/Card";
import { Loader } from "../common/Loader";
import { formatPoints } from "../../config/formatters";
import styles from "./styles/PointsBreakdown.module.css";

// Fallback as recharts is not in package.json
const PointsBreakdown = ({ userId, size = "medium" }) => {
  const dispatch = useDispatch();
  const { metrics, isLoading, error } = useSelector((state) => state.impact);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserMetrics(userId));
    }
  }, [userId, dispatch]);

  if (isLoading || !metrics) {
    return (
      <Card padding="lg" shadow="sm">
        <Loader size="sm" text="Loading points..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="lg" shadow="sm">
        <p>Error loading points.</p>
      </Card>
    );
  }

  const breakdown = metrics.pointsBreakdown || {};
  const totalPoints = metrics.totalPoints || 0;

  const categories = [
    {
      label: "Event Participation",
      value: breakdown.eventParticipation || 0,
      color: "#3b82f6",
    },
    {
      label: "Event Creation",
      value: breakdown.eventCreation || 0,
      color: "#10b981",
    },
    {
      label: "Community Creation",
      value: breakdown.communityCreation || 0,
      color: "#8b5cf6",
    },
    {
      label: "Hours Volunteered",
      value: breakdown.hoursVolunteered || 0,
      color: "#f59e0b",
    },
    { label: "Other", value: breakdown.other || 0, color: "#6b7280" },
  ].filter((cat) => cat.value > 0);

  return (
    <Card padding="lg" shadow="md">
      <h3 className={styles.title}>Points Breakdown</h3>

      <div className={styles.totalContainer}>
        <span className={styles.totalLabel}>Total Points</span>
        <span className={styles.totalValue}>{formatPoints(totalPoints)}</span>
      </div>

      <div className={styles.legend}>
        {categories.map((cat) => (
          <div key={cat.label} className={styles.legendItem}>
            <div className={styles.legendInfo}>
              <span
                className={styles.legendColor}
                style={{ backgroundColor: cat.color }}
              />
              <span className={styles.legendLabel}>{cat.label}</span>
            </div>
            <span className={styles.legendValue}>
              {formatPoints(cat.value)}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.barsContainer}>
        {categories.map((cat) => (
          <div key={cat.label} className={styles.barWrapper}>
            <div className={styles.barLabel}>
              {cat.label} ({Math.round((cat.value / totalPoints) * 100)}%)
            </div>
            <div className={styles.progressBar}>
              <div
                className={`${styles.progressFill} ${styles.animate}`}
                style={{
                  width: `${(cat.value / totalPoints) * 100}%`,
                  backgroundColor: cat.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default PointsBreakdown;
