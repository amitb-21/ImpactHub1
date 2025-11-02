import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserProgress } from "../../store/slices/impactSlice";
import { Card } from "../common/Card";
import { Loader } from "../common/Loader";
import { calculateRank } from "../../config/helpers";
import { formatPoints } from "../../config/formatters";
import styles from "./styles/LevelProgress.module.css";

const LevelProgress = ({ userId, compact = false }) => {
  const dispatch = useDispatch();
  const { progress, isLoading, error } = useSelector((state) => state.impact);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserProgress(userId));
    }
  }, [userId, dispatch]);

  if (isLoading || !progress) {
    return (
      <Card padding="lg" shadow="sm">
        <Loader size="sm" text="Loading progress..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="lg" shadow="sm">
        <p>Error loading progress.</p>
      </Card>
    );
  }

  const { currentLevel, currentPoints } = progress;
  const { progress: pointsInLevel, required, percentage } = progress.progress;
  const rank = calculateRank(currentPoints);

  if (compact) {
    return (
      <div className={styles.compactContainer}>
        <div className={styles.compactHeader}>
          <span className={styles.compactLevel}>Lv. {currentLevel}</span>
          <span className={styles.compactRank} style={{ color: rank.color }}>
            {rank.name}
          </span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${percentage}%`, backgroundColor: rank.color }}
          />
        </div>
        <div className={styles.compactPoints}>
          {formatPoints(pointsInLevel)} / {formatPoints(required)}
        </div>
      </div>
    );
  }

  return (
    <Card padding="lg" shadow="md">
      <div className={styles.header}>
        <div className={styles.levelBadge} style={{ borderColor: rank.color }}>
          <span className={styles.levelNum}>{currentLevel}</span>
          <span className={styles.levelLabel}>Level</span>
        </div>
        <div className={styles.headerInfo}>
          <h3 className={styles.rankName} style={{ color: rank.color }}>
            {rank.name}
          </h3>
          <p className={styles.totalPoints}>
            {formatPoints(currentPoints)} Total Points
          </p>
        </div>
      </div>

      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${percentage}%`, backgroundColor: rank.color }}
          />
        </div>
        <div className={styles.progressInfo}>
          <span className={styles.progressText}>
            {formatPoints(pointsInLevel)} / {formatPoints(required)}
          </span>
          <span className={styles.progressPercent}>{percentage}%</span>
        </div>
      </div>

      <p className={styles.milestone}>
        You'll reach Level {currentLevel + 1} at{" "}
        {formatPoints(currentPoints - pointsInLevel + required)} points.
      </p>
    </Card>
  );
};

export default LevelProgress;
