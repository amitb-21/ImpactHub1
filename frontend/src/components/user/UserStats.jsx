import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserMetrics } from "../../store/slices/impactSlice";
import { Card } from "../common/Card";
import { Loader } from "../common/Loader";
import {
  FiCalendar,
  FiUsers,
  FiTrendingUp,
  FiClock,
  FiAward,
  FiActivity,
} from "react-icons/fi";
import { formatPoints } from "../../config/formatters";
import { calculateRank } from "../../config/helpers";

const UserStats = ({ userId, compact = false }) => {
  const dispatch = useDispatch();
  const { metrics, isLoading } = useSelector((state) => state.impact);

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserMetrics(userId));
    }
  }, [userId, dispatch]);

  if (isLoading) {
    return (
      <Card padding="lg" style={styles.card}>
        <div style={styles.loadingContainer}>
          <Loader size="sm" text="Loading stats..." />
        </div>
      </Card>
    );
  }

  if (!metrics) {
    return (
      <Card padding="lg" style={styles.card}>
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No statistics available yet</p>
          <p style={styles.emptySubtext}>
            Start participating in events to track your impact!
          </p>
        </div>
      </Card>
    );
  }

  const rank = calculateRank(metrics.totalPoints || 0);

  const stats = [
    {
      icon: FiCalendar,
      label: "Events Attended",
      value: metrics.eventsAttended || 0,
      color: "#00796B",
      bgColor: "#e0f2f1",
    },
    {
      icon: FiUsers,
      label: "Communities Joined",
      value: metrics.communitiesJoined || 0,
      color: "#3b82f6",
      bgColor: "#dbeafe",
    },
    {
      icon: FiTrendingUp,
      label: "Total Points",
      value: formatPoints(metrics.totalPoints || 0),
      color: "#FFB300",
      bgColor: "#fff3cd",
    },
    {
      icon: FiClock,
      label: "Hours Volunteered",
      value: metrics.hoursVolunteered || 0,
      color: "#8b5cf6",
      bgColor: "#ede9fe",
    },
    {
      icon: FiAward,
      label: "Badges Earned",
      value: metrics.badgesEarned || 0,
      color: "#ef4444",
      bgColor: "#fee2e2",
    },
    {
      icon: FiActivity,
      label: "Current Rank",
      value: rank?.name || "Beginner",
      color: rank?.color || "#10b981",
      bgColor: `${rank?.color || "#10b981"}20`,
    },
  ];

  if (compact) {
    return (
      <div style={styles.compactGrid}>
        {stats.slice(0, 4).map((stat, index) => (
          <StatCardCompact key={index} {...stat} />
        ))}
      </div>
    );
  }

  return (
    <Card padding="lg" shadow="md" style={styles.card}>
      <div style={styles.header}>
        <h3 style={styles.title}>Your Statistics</h3>
        <div style={styles.subtitle}>
          Track your volunteer journey and impact
        </div>
      </div>

      <div style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Progress to Next Rank */}
      {rank && (
        <div style={styles.progressSection}>
          <div style={styles.progressHeader}>
            <span style={styles.progressLabel}>
              Progress to {getNextRank(rank.name)}
            </span>
            <span style={styles.progressValue}>
              {formatPoints(metrics.totalPoints || 0)} /{" "}
              {formatPoints(getNextRankThreshold(rank.name))}
            </span>
          </div>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${calculateProgress(
                  metrics.totalPoints || 0,
                  getNextRankThreshold(rank.name)
                )}%`,
                backgroundColor: rank.color,
              }}
            />
          </div>
        </div>
      )}
    </Card>
  );
};

// StatCard Component
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

// Compact StatCard Component
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
const getNextRank = (currentRank) => {
  const ranks = {
    Beginner: "Contributor",
    Contributor: "Leader",
    Leader: "Champion",
    Champion: "Legend",
    Legend: "Legend",
  };
  return ranks[currentRank] || "Next Level";
};

const getNextRankThreshold = (currentRank) => {
  const thresholds = {
    Beginner: 500,
    Contributor: 1500,
    Leader: 3000,
    Champion: 5000,
    Legend: 10000,
  };
  return thresholds[currentRank] || 10000;
};

const calculateProgress = (current, target) => {
  if (target === 0) return 0;
  return Math.min((current / target) * 100, 100);
};

const styles = {
  card: {
    width: "100%",
  },
  loadingContainer: {
    padding: "40px 20px",
    textAlign: "center",
  },
  emptyState: {
    padding: "60px 20px",
    textAlign: "center",
  },
  emptyText: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#212121",
    margin: "0 0 8px 0",
  },
  emptySubtext: {
    fontSize: "14px",
    color: "#999",
    margin: 0,
  },
  header: {
    marginBottom: "24px",
  },
  title: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#212121",
    margin: "0 0 4px 0",
  },
  subtitle: {
    fontSize: "13px",
    color: "#666",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
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
    cursor: "default",
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
  progressSection: {
    marginTop: "24px",
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  progressLabel: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#212121",
  },
  progressValue: {
    fontSize: "13px",
    color: "#666",
    fontWeight: "600",
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
    backgroundColor: "#00796B",
    borderRadius: "6px",
    transition: "width 0.6s ease",
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
    fontSize: "18px",
    fontWeight: "700",
    color: "#212121",
  },
  compactLabel: {
    fontSize: "11px",
    color: "#666",
    fontWeight: "500",
  },
};

export default UserStats;
