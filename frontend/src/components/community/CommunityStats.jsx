import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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

const CommunityStats = ({ community, compact = false }) => {
  if (!community) {
    return (
      <Card padding="lg" style={styles.card}>
        <div style={styles.emptyState}>
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

  if (compact) {
    return (
      <div style={styles.compactGrid}>
        {stats.map((stat, index) => (
          <StatCardCompact key={index} {...stat} />
        ))}
      </div>
    );
  }

  return (
    <Card padding="lg" shadow="md" style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>Community Statistics</h3>
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
      <div style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Tier Information */}
      {tier && (
        <div style={styles.tierSection}>
          <div style={styles.tierHeader}>
            <h4 style={styles.tierTitle}>Community Tier: {tier.name}</h4>
            <div
              style={{
                ...styles.tierBadge,
                backgroundColor: tier.color,
              }}
            >
              <FiAward size={18} style={{ color: "#FAFAFA" }} />
            </div>
          </div>
          <p style={styles.tierDescription}>
            Points: {community.communityPoints || 0} /{" "}
            {getTierThreshold(tier.name)}
          </p>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
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
        <div style={styles.infoSection}>
          <h4 style={styles.infoTitle}>Verification Status</h4>
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

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
  <div style={styles.statCard}>
    <div style={{ ...styles.statIconWrapper, backgroundColor: bgColor }}>
      <Icon size={24} style={{ color }} />
    </div>
    <div style={styles.statContent}>
      <span style={styles.statValue}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  </div>
);

// Compact Stat Card Component
const StatCardCompact = ({ icon: Icon, label, value, color, bgColor }) => (
  <div style={styles.compactCard}>
    <div style={{ ...styles.compactIcon, backgroundColor: bgColor }}>
      <Icon size={18} style={{ color }} />
    </div>
    <div style={styles.compactContent}>
      <span style={styles.compactValue}>{value}</span>
      <span style={styles.compactLabel}>{label}</span>
    </div>
  </div>
);

// Helper functions
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

const styles = {
  card: {
    width: "100%",
  },

  emptyState: {
    padding: "40px 20px",
    textAlign: "center",
    color: "#999",
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
    paddingBottom: "16px",
    borderBottom: "2px solid #e0e0e0",
  },

  title: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#212121",
    margin: 0,
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
    marginBottom: "24px",
  },

  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    transition: "all 0.3s ease",
  },

  statIconWrapper: {
    width: "56px",
    height: "56px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  statContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    minWidth: 0,
  },

  statValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#212121",
    lineHeight: "1",
  },

  statLabel: {
    fontSize: "13px",
    color: "#666",
    fontWeight: "500",
  },

  tierSection: {
    padding: "20px",
    backgroundColor: "#f0f8f7",
    borderRadius: "12px",
    border: "1px solid #d1ede8",
    marginBottom: "20px",
  },

  tierHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },

  tierTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#212121",
    margin: 0,
  },

  tierBadge: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  tierDescription: {
    fontSize: "13px",
    color: "#666",
    margin: "0 0 12px 0",
  },

  progressBar: {
    width: "100%",
    height: "12px",
    backgroundColor: "#e0e0e0",
    borderRadius: "6px",
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: "6px",
    transition: "width 0.6s ease",
  },

  infoSection: {
    padding: "16px",
    backgroundColor: "#fff9e6",
    borderRadius: "10px",
    border: "1px solid #ffe4b5",
  },

  infoTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#212121",
    margin: "0 0 8px 0",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  // Compact styles
  compactGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "12px",
  },

  compactCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
  },

  compactIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  compactContent: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    minWidth: 0,
  },

  compactValue: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#212121",
  },

  compactLabel: {
    fontSize: "11px",
    color: "#666",
    fontWeight: "500",
  },
};

export default CommunityStats;
