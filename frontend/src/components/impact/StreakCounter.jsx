import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserMetrics } from "../../store/slices/impactSlice";
import { Card } from "../common/Card";
import { Loader } from "../common/Loader";
import styles from "./styles/StreakCounter.module.css";

const StreakCounter = ({ userId, compact = false }) => {
  const dispatch = useDispatch();
  const { metrics, isLoading, error } = useSelector((state) => state.impact);

  useEffect(() => {
    if (userId && !metrics) {
      dispatch(fetchUserMetrics(userId));
    }
  }, [userId, metrics, dispatch]);

  if (isLoading || !metrics) {
    return (
      <Card padding="lg" shadow="sm">
        <Loader size="sm" text="Loading streak..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="lg" shadow="sm">
        <div className={styles.errorContainer}>
          <span className={styles.errorIcon}>⚠️</span>
          <p className={styles.errorText}>Failed to load streak data</p>
        </div>
      </Card>
    );
  }

  const streak = metrics.impactStreak || 0;
  const bestStreak = metrics.bestStreak || 0; // Assuming this field will be added
  const nextMilestone = [7, 14, 30, 60, 100].find((ms) => ms > streak) || 100;

  if (compact) {
    return (
      <div className={styles.compactContainer}>
        <span className={styles.compactIcon}>🔥</span>
        <span className={styles.compactText}>{streak} day streak</span>
      </div>
    );
  }

  return (
    <Card padding="lg" shadow="md">
      <div className={styles.container}>
        <div className={styles.icon}>🔥</div>
        <div className={styles.content}>
          <h3 className={styles.streakValue}>{streak}</h3>
          <p className={styles.streakLabel}>Day Streak</p>
        </div>
        <div className={styles.details}>
          <p className={styles.bestStreak}>
            Best Streak: <strong>{bestStreak} days</strong>
          </p>
          <div className={styles.milestone}>
            <span className={styles.milestoneText}>
              Next: {nextMilestone} days
            </span>
            <div className={styles.milestoneBar}>
              <div
                className={styles.milestoneFill}
                style={{ width: `${(streak / nextMilestone) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StreakCounter;
