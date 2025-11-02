import React from "react";
import { FiStar } from "react-icons/fi";
import styles from "./styles/RatingStats.module.css";

const RatingStats = ({
  avgRating = 0,
  totalRatings = 0,
  distribution = [],
}) => {
  // Ensure distribution is a 5-item array [1s, 2s, 3s, 4s, 5s]
  const fullDistribution = [5, 4, 3, 2, 1].map((star) => {
    const item = distribution.find((d) => d._id === star);
    return {
      star: star,
      count: item?.count || 0,
    };
  });

  const maxCount = Math.max(...fullDistribution.map((d) => d.count)) || 1;

  return (
    <div className={styles.container}>
      <div className={styles.summary}>
        <div className={styles.avgRating}>
          {avgRating ? avgRating.toFixed(1) : "0.0"}
        </div>
        <div className={styles.stars}>
          {[...Array(5)].map((_, i) => (
            <FiStar
              key={i}
              size={20}
              style={{
                fill: i < Math.round(avgRating) ? "#FFB300" : "none",
                color: i < Math.round(avgRating) ? "#FFB300" : "#e0e0e0",
              }}
            />
          ))}
        </div>
        <div className={styles.totalRatings}>
          Based on {totalRatings} review{totalRatings !== 1 ? "s" : ""}
        </div>
      </div>
      <div className={styles.distribution}>
        {fullDistribution.map((item) => (
          <div key={item.star} className={styles.barRow}>
            <span className={styles.barLabel}>{item.star} stars</span>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${(item.count / maxCount) * 100}%`,
                }}
              />
            </div>
            <span className={styles.barCount}>{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RatingStats;
