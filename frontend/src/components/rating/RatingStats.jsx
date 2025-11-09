import React from "react";
import { Card } from "../common/Card";
import styles from "./styles/RatingStats.module.css";

const RatingStats = ({
  avgRating = 0,
  totalRatings = 0,
  distribution = [],
  compact = false,
}) => {
  // Ensure avgRating is a number
  const rating = parseFloat(avgRating) || 0;

  // Calculate star distribution
  const getRatingCount = (starLevel) => {
    if (!distribution || distribution.length === 0) return 0;
    const item = distribution.find((d) => d.star === starLevel);
    return item ? item.count : 0;
  };

  // Get total for percentage calculation
  const total =
    totalRatings || distribution.reduce((sum, d) => sum + d.count, 0) || 0;

  const getPercentage = (count) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  // Compact View
  if (compact) {
    return (
      <div className={styles.compactContainer}>
        <div className={styles.compactRating}>
          <div className={styles.compactScore}>{rating.toFixed(1)}</div>
          <div className={styles.compactStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={star <= Math.round(rating) ? styles.starFilled : ""}
              >
                ⭐
              </span>
            ))}
          </div>
          <div className={styles.compactCount}>
            ({total} {total === 1 ? "review" : "reviews"})
          </div>
        </div>
      </div>
    );
  }

  // Full View
  return (
    <div className={styles.container}>
      {/* Main Rating Display */}
      <div className={styles.ratingDisplay}>
        <div className={styles.scoreSection}>
          <div className={styles.score}>{rating.toFixed(1)}</div>
          <div className={styles.scoreOutOf}>/5</div>
        </div>

        <div className={styles.ratingInfo}>
          {/* Stars */}
          <div className={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`${styles.star} ${
                  star <= Math.round(rating) ? styles.starFilled : ""
                }`}
              >
                ⭐
              </span>
            ))}
          </div>

          {/* Review Count */}
          <p className={styles.reviewCount}>
            Based on {total} {total === 1 ? "review" : "reviews"}
          </p>
        </div>
      </div>

      {/* Distribution Bars */}
      {distribution && distribution.length > 0 && (
        <div className={styles.distribution}>
          <h4 className={styles.distributionTitle}>Rating Distribution</h4>

          <div className={styles.bars}>
            {[5, 4, 3, 2, 1].map((starLevel) => {
              const count = getRatingCount(starLevel);
              const percentage = getPercentage(count);

              return (
                <div key={starLevel} className={styles.bar}>
                  {/* Star Label */}
                  <div className={styles.barLabel}>
                    {starLevel}
                    <span className={styles.starIcon}>⭐</span>
                  </div>

                  {/* Bar Container */}
                  <div className={styles.barContainer}>
                    <div
                      className={styles.barFill}
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: getBarColor(starLevel),
                      }}
                    />
                  </div>

                  {/* Percentage */}
                  <div className={styles.barValue}>
                    {percentage}% ({count})
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alternative Empty State */}
      {(!distribution || distribution.length === 0) && total === 0 && (
        <div className={styles.emptyDistribution}>
          <p>No ratings yet. Be the first to review!</p>
        </div>
      )}

      {/* Summary Stats */}
      {total > 0 && (
        <div className={styles.summaryStats}>
          <div className={styles.statItem}>
            <span className={styles.statLabel}>Average Rating</span>
            <span className={styles.statValue}>{rating.toFixed(2)}</span>
          </div>

          <div className={styles.statItem}>
            <span className={styles.statLabel}>Total Reviews</span>
            <span className={styles.statValue}>{total}</span>
          </div>

          <div className={styles.statItem}>
            <span className={styles.statLabel}>Most Common</span>
            <span className={styles.statValue}>
              {getMostCommonRating(distribution)}/5
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Helper function to get bar color based on rating
 */
const getBarColor = (starLevel) => {
  switch (starLevel) {
    case 5:
      return "#10b981"; // Green
    case 4:
      return "#3b82f6"; // Blue
    case 3:
      return "#f59e0b"; // Amber
    case 2:
      return "#ef5350"; // Red
    case 1:
      return "#c62828"; // Dark Red
    default:
      return "#999";
  }
};

/**
 * Helper function to find most common rating
 */
const getMostCommonRating = (distribution) => {
  if (!distribution || distribution.length === 0) return "N/A";

  const mostCommon = distribution.reduce((prev, current) =>
    prev.count > current.count ? prev : current
  );

  return mostCommon.star;
};

export default RatingStats;
