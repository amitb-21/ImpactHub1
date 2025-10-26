import React, { useMemo } from "react";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { FiAward, FiClock, FiTrendingUp } from "react-icons/fi";
import styles from "./styles/PointsBreakdown.module.css";

const PointsBreakdown = ({
  eventId,
  hoursContributed = 0,
  basePoints = 50,
  hourlyMultiplier = 10,
  bonusPoints = 0,
  compact = false,
}) => {
  // Calculate points breakdown
  const breakdown = useMemo(() => {
    const base = basePoints;
    const hourBonus = Math.max(0, hoursContributed * hourlyMultiplier);
    const bonus = bonusPoints || 0;
    const total = base + hourBonus + bonus;

    return {
      base,
      hourBonus,
      bonus,
      total,
      hoursContributed,
    };
  }, [basePoints, hoursContributed, hourlyMultiplier, bonusPoints]);

  // Compact view
  if (compact) {
    return (
      <div className={styles.compactContainer}>
        <div className={styles.compactItem}>
          <FiAward size={18} style={{ color: "#FFB300" }} />
          <div className={styles.compactContent}>
            <span className={styles.compactLabel}>Total Points</span>
            <span className={styles.compactValue}>{breakdown.total} pts</span>
          </div>
        </div>
      </div>
    );
  }

  // Full view
  return (
    <Card padding="lg" shadow="md" className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <FiTrendingUp size={20} style={{ marginRight: "8px" }} />
          Points Breakdown
        </h3>
        <Badge
          label={`${breakdown.total} pts`}
          variant="primary"
          size="md"
          style={{ backgroundColor: "#FFB300", color: "#212121" }}
        />
      </div>

      {/* Breakdown Items */}
      <div className={styles.breakdownItems}>
        {/* Base Points */}
        <div className={styles.breakdownItem}>
          <div className={styles.itemLeft}>
            <div
              className={styles.itemIcon}
              style={{ backgroundColor: "#ccf0eb" }}
            >
              <FiAward size={18} style={{ color: "#00796B" }} />
            </div>
            <div className={styles.itemContent}>
              <p className={styles.itemLabel}>Base Points</p>
              <p className={styles.itemDescription}>Participation reward</p>
            </div>
          </div>
          <span className={styles.itemValue}>{breakdown.base} pts</span>
        </div>

        {/* Hour Bonus */}
        <div className={styles.breakdownItem}>
          <div className={styles.itemLeft}>
            <div
              className={styles.itemIcon}
              style={{ backgroundColor: "#dbeafe" }}
            >
              <FiClock size={18} style={{ color: "#3b82f6" }} />
            </div>
            <div className={styles.itemContent}>
              <p className={styles.itemLabel}>Hour Bonus</p>
              <p className={styles.itemDescription}>
                {breakdown.hoursContributed}h × {hourlyMultiplier} pts/hr
              </p>
            </div>
          </div>
          <span className={styles.itemValue}>{breakdown.hourBonus} pts</span>
        </div>

        {/* Extra Bonus (if applicable) */}
        {breakdown.bonus > 0 && (
          <div className={styles.breakdownItem}>
            <div className={styles.itemLeft}>
              <div
                className={styles.itemIcon}
                style={{ backgroundColor: "#fef3c7" }}
              >
                <span style={{ fontSize: "18px" }}>🎁</span>
              </div>
              <div className={styles.itemContent}>
                <p className={styles.itemLabel}>Event Bonus</p>
                <p className={styles.itemDescription}>Special achievement</p>
              </div>
            </div>
            <span className={styles.itemValue}>+{breakdown.bonus} pts</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className={styles.divider} />

      {/* Total */}
      <div className={styles.totalSection}>
        <div>
          <p className={styles.totalLabel}>Total Points Earned</p>
          <p className={styles.totalDescription}>After completing this event</p>
        </div>
        <div className={styles.totalValue}>{breakdown.total}</div>
      </div>

      {/* Info Section */}
      <div className={styles.infoSection}>
        <p className={styles.infoTitle}>💡 How Points Are Calculated</p>
        <ul className={styles.infoList}>
          <li>
            <span className={styles.infoBullet}>✓</span>
            Base points awarded for participating in events
          </li>
          <li>
            <span className={styles.infoBullet}>✓</span>
            Additional points for each hour contributed ({hourlyMultiplier}{" "}
            pts/hr)
          </li>
          <li>
            <span className={styles.infoBullet}>✓</span>
            Special bonuses for events with specific goals or achievements
          </li>
          <li>
            <span className={styles.infoBullet}>✓</span>
            Points contribute to your rank and community impact score
          </li>
        </ul>
      </div>

      {/* Progress Bar */}
      <div className={styles.progressSection}>
        <p className={styles.progressLabel}>Points Distribution</p>
        <div className={styles.progressBars}>
          {/* Base Points Bar */}
          <div className={styles.progressItem}>
            <div className={styles.progressBarContainer}>
              <div
                className={styles.progressBarFill}
                style={{
                  width: `${(breakdown.base / breakdown.total) * 100}%`,
                  backgroundColor: "#00796B",
                }}
              />
            </div>
            <span className={styles.progressLabel}>
              Base: {breakdown.base} (
              {((breakdown.base / breakdown.total) * 100).toFixed(0)}%)
            </span>
          </div>

          {/* Hour Bonus Bar */}
          <div className={styles.progressItem}>
            <div className={styles.progressBarContainer}>
              <div
                className={styles.progressBarFill}
                style={{
                  width: `${(breakdown.hourBonus / breakdown.total) * 100}%`,
                  backgroundColor: "#3b82f6",
                }}
              />
            </div>
            <span className={styles.progressLabel}>
              Hours: {breakdown.hourBonus} (
              {((breakdown.hourBonus / breakdown.total) * 100).toFixed(0)}%)
            </span>
          </div>

          {/* Bonus Bar */}
          {breakdown.bonus > 0 && (
            <div className={styles.progressItem}>
              <div className={styles.progressBarContainer}>
                <div
                  className={styles.progressBarFill}
                  style={{
                    width: `${(breakdown.bonus / breakdown.total) * 100}%`,
                    backgroundColor: "#FFB300",
                  }}
                />
              </div>
              <span className={styles.progressLabel}>
                Bonus: {breakdown.bonus} (
                {((breakdown.bonus / breakdown.total) * 100).toFixed(0)}%)
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PointsBreakdown;
