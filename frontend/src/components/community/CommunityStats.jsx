import React from "react";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Loader } from "../common/Loader";
import {
  FiUsers,
  FiCalendar,
  FiStar,
  FiAward,
  FiTrendingUp,
} from "react-icons/fi";
import { calculateTier } from "../../config/helpers";
import { formatNumber } from "../../config/helpers";
import styles from "./styles/CommunityStats.module.css";

const CommunityStats = ({ community, compact = false }) => {
  if (!community) {
    return (
      <Card padding="lg" className={styles.card}>
        <div className={styles.emptyState}>
          <p>No community data available</p>
        </div>
      </Card>
    );
  }

  const tier = calculateTier(community.communityPoints || 0);
  const memberCount = community.members?.length || 0;
  const eventCount = community.events?.length || 0;
  const avgRating = community.averageRating || 0;
  const totalRatings = community.ratingCount || 0;

  const stats = [
    {
      icon: FiUsers,
      label: "Members",
      value: memberCount,
      color: "#00796B",
      bgColor: "#e0f2f1",
    },
    {
      icon: FiCalendar,
      label: "Events",
      value: eventCount,
      color: "#3b82f6",
      bgColor: "#dbeafe",
    },
    {
      icon: FiStar,
      label: "Rating",
      value: avgRating.toFixed(1),
      color: "#FFB300",
      bgColor: "#fff3cd",
    },
    {
      icon: FiTrendingUp,
      label: "Community Points",
      value: formatNumber(community.communityPoints || 0),
      color: "#8b5cf6",
      bgColor: "#ede9fe",
    },
  ];

  // Compact View
  if (compact) {
    return (
      <div className={styles.compactGrid}>
        {stats.map((stat, index) => (
          <StatCardCompact key={index} {...stat} />
        ))}
      </div>
    );
  }

  // Regular View
  return (
    <Card padding="lg" shadow="md" className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Community Statistics</h3>
        {tier && (
          <Badge
            label={tier.name}
            variant="primary"
            size="sm"
            style={{ backgroundColor: tier.color, color: "#FAFAFA" }}
          />
        )}
      </div>

      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Tier Information */}
      {tier && (
        <div className={styles.tierSection}>
          <div className={styles.tierHeader}>
            <h4 className={styles.tierTitle}>Community Tier: {tier.name}</h4>
            <div
              className={styles.tierBadge}
              style={{ backgroundColor: tier.color }}
            >
              <FiAward size={18} style={{ color: "#FAFAFA" }} />
            </div>
          </div>
          <p className={styles.tierDescription}>
            Points: {community.communityPoints || 0} /{" "}
            {getTierThreshold(tier.name)}
          </p>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{
                width: `${calculateTierProgress(
                  community.communityPoints || 0,
                  tier.name
                )}%`,
                backgroundColor: tier.color,
              }}
            />
          </div>
        </div>
      )}

      {/* Additional Info */}
      {community.verificationStatus && (
        <div className={styles.infoSection}>
          <h4 className={styles.infoTitle}>Verification Status</h4>
          <Badge
            label={
              community.verificationStatus.charAt(0).toUpperCase() +
              community.verificationStatus.slice(1)
            }
            variant={
              community.verificationStatus === "verified"
                ? "success"
                : community.verificationStatus === "pending"
                ? "warning"
                : "error"
            }
            size="sm"
          />
        </div>
      )}
    </Card>
  );
};

/**
 * Stat Card Component
 * Displays individual stat with icon and label
 */
const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <div className={styles.statCard}>
    <div
      className={styles.statIconWrapper}
      style={{ backgroundColor: bgColor }}
    >
      <Icon size={24} style={{ color }} />
    </div>
    <div className={styles.statContent}>
      <span className={styles.statValue}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  </div>
);

/**
 * Compact Stat Card Component
 * Lightweight version for sidebar/reduced-space displays
 */
const StatCardCompact = ({ icon: Icon, label, value, color, bgColor }) => (
  <div className={styles.compactCard}>
    <div className={styles.compactIcon} style={{ backgroundColor: bgColor }}>
      <Icon size={18} style={{ color }} />
    </div>
    <div className={styles.compactContent}>
      <span className={styles.compactValue}>{value}</span>
      <span className={styles.compactLabel}>{label}</span>
    </div>
  </div>
);

/**
 * Helper function to get tier threshold
 */
const getTierThreshold = (tierName) => {
  const thresholds = {
    Bronze: 1000,
    Silver: 2500,
    Gold: 5000,
    Platinum: 10000,
    Diamond: 20000,
  };
  return thresholds[tierName] || 10000;
};

const calculateTierProgress = (points, tierName) => {
  const current = Math.max(0, getTierThreshold(tierName) - points);
  const total = getTierThreshold(tierName);
  return Math.min((points / total) * 100, 100);
};

export default CommunityStats;
