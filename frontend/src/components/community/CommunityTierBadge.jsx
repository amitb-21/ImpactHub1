import React from "react";
import { Badge } from "../common/Badge";
import { Card } from "../common/Card";
import { calculateTier } from "../../config/helpers";
import { FiAward, FiTrendingUp } from "react-icons/fi";

const CommunityTierBadge = ({
  communityPoints = 0,
  compact = false,
  showProgress = false,
  style = {},
}) => {
  const tier = calculateTier(communityPoints);

  if (!tier) {
    return null;
  }

  if (compact) {
    return (
      <Badge
        label={tier.name}
        variant="primary"
        size="sm"
        style={{
          backgroundColor: tier.color,
          color: "#FAFAFA",
          ...style,
        }}
      />
    );
  }

  const nextTierThreshold = getNextTierThreshold(tier.name);
  const progress = calculateTierProgress(communityPoints, tier.name);

  return (
    <Card padding="lg" shadow="md" style={style}>
      <div style={styles.container}>
        {/* Tier Info */}
        <div style={styles.tierInfo}>
          <div style={{ ...styles.tierIcon, backgroundColor: tier.color }}>
            <FiAward size={24} style={{ color: "#FAFAFA" }} />
          </div>

          <div style={styles.tierContent}>
            <h3 style={styles.tierName}>Community Tier</h3>
            <p style={styles.tierTitle}>{tier.name}</p>
            <p style={styles.tierDescription}>
              Total Points: {communityPoints.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress Section */}
        {showProgress && (
          <div style={styles.progressSection}>
            <div style={styles.progressHeader}>
              <span style={styles.progressLabel}>
                Progress to {getNextTierName(tier.name)}
              </span>
              <span style={styles.progressValue}>
                {communityPoints.toLocaleString()} /{" "}
                {nextTierThreshold.toLocaleString()}
              </span>
            </div>

            {/* Progress Bar */}
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: tier.color,
                }}
              />
            </div>

            {/* Progress Text */}
            <p style={styles.progressText}>
              {Math.round(progress)}% to next tier
            </p>
          </div>
        )}

        {/* Tier Benefits */}
        <div style={styles.benefitsSection}>
          <h4 style={styles.benefitsTitle}>
            <FiTrendingUp
              size={16}
              style={{ display: "inline", marginRight: "6px" }}
            />
            Tier Benefits
          </h4>
          <ul style={styles.benefitsList}>
            {getTierBenefits(tier.name).map((benefit, index) => (
              <li key={index} style={styles.benefitItem}>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Tier Chart */}
        <div style={styles.tierChartSection}>
          <h4 style={styles.chartTitle}>Community Tier Levels</h4>
          <div style={styles.tierChart}>
            {getTierChart().map((t) => (
              <div
                key={t.name}
                style={{
                  ...styles.tierChartItem,
                  ...(!t.achieved && styles.tierChartItemInactive),
                  borderLeft: `4px solid ${t.color}`,
                }}
              >
                <div
                  style={{ ...styles.tierChartColor, backgroundColor: t.color }}
                />
                <div style={styles.tierChartInfo}>
                  <span style={styles.tierChartName}>{t.name}</span>
                  <span style={styles.tierChartRange}>
                    {t.min.toLocaleString()} - {t.max.toLocaleString()}
                  </span>
                </div>
                {tier.name === t.name && (
                  <span style={styles.tierChartCurrent}>Current</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

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

const getNextTierThreshold = (tierName) => {
  const nextTiers = {
    Bronze: 2500,
    Silver: 5000,
    Gold: 10000,
    Platinum: 20000,
    Diamond: 50000,
  };
  return nextTiers[tierName] || 50000;
};

const getNextTierName = (tierName) => {
  const nextTiers = {
    Bronze: "Silver",
    Silver: "Gold",
    Gold: "Platinum",
    Platinum: "Diamond",
    Diamond: "Diamond",
  };
  return nextTiers[tierName] || "Next Level";
};

const calculateTierProgress = (points, tierName) => {
  const current = getTierThreshold(tierName);
  const next = getNextTierThreshold(tierName);
  return ((points - current) / (next - current)) * 100;
};

const getTierBenefits = (tierName) => {
  const benefitsMap = {
    Bronze: [
      "Community listing visibility",
      "Member engagement tracking",
      "Basic event support",
    ],
    Silver: [
      "All Bronze benefits",
      "Priority community features",
      "Enhanced analytics",
      "Community badge display",
    ],
    Gold: [
      "All Silver benefits",
      "Featured community listing",
      "Advanced reporting tools",
      "Custom community page theme",
    ],
    Platinum: [
      "All Gold benefits",
      "Premium support access",
      "Community ambassador program",
      "Exclusive networking events",
    ],
    Diamond: [
      "All Platinum benefits",
      "Dedicated account manager",
      "Custom integrations",
      "Speaking opportunities",
      "Featured case study",
    ],
  };
  return benefitsMap[tierName] || [];
};

const getTierChart = () => {
  return [
    {
      name: "Bronze",
      color: "#cd7f32",
      min: 0,
      max: 999,
      achieved: true,
    },
    {
      name: "Silver",
      color: "#c0c0c0",
      min: 1000,
      max: 2499,
      achieved: true,
    },
    {
      name: "Gold",
      color: "#ffd700",
      min: 2500,
      max: 4999,
      achieved: true,
    },
    {
      name: "Platinum",
      color: "#e5e4e2",
      min: 5000,
      max: 9999,
      achieved: true,
    },
    {
      name: "Diamond",
      color: "#b9f2ff",
      min: 10000,
      max: 99999,
      achieved: true,
    },
  ];
};

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  tierInfo: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  tierIcon: {
    width: "60px",
    height: "60px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  tierContent: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  tierName: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    margin: 0,
  },

  tierTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#212121",
    margin: 0,
  },

  tierDescription: {
    fontSize: "13px",
    color: "#666",
    margin: 0,
  },

  progressSection: {
    padding: "20px",
    backgroundColor: "#f0f8f7",
    borderRadius: "12px",
    border: "1px solid #d1ede8",
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },

  progressLabel: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#212121",
  },

  progressValue: {
    fontSize: "12px",
    color: "#666",
    fontWeight: "600",
  },

  progressBar: {
    width: "100%",
    height: "12px",
    backgroundColor: "#e0e0e0",
    borderRadius: "6px",
    overflow: "hidden",
    marginBottom: "8px",
  },

  progressFill: {
    height: "100%",
    borderRadius: "6px",
    transition: "width 0.6s ease",
  },

  progressText: {
    fontSize: "12px",
    color: "#666",
    margin: 0,
    fontWeight: "500",
  },

  benefitsSection: {
    padding: "20px",
    backgroundColor: "#fff9e6",
    borderRadius: "12px",
    border: "1px solid #ffe4b5",
  },

  benefitsTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#212121",
    margin: "0 0 12px 0",
  },

  benefitsList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  benefitItem: {
    fontSize: "13px",
    color: "#666",
    padding: "6px 0",
    paddingLeft: "20px",
    position: "relative",
  },

  tierChartSection: {
    padding: "20px",
    backgroundColor: "#f9f9f9",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
  },

  chartTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#212121",
    margin: "0 0 16px 0",
  },

  tierChart: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  tierChartItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    backgroundColor: "#FAFAFA",
    borderRadius: "8px",
    transition: "all 0.3s ease",
  },

  tierChartItemInactive: {
    opacity: 0.6,
  },

  tierChartColor: {
    width: "24px",
    height: "24px",
    borderRadius: "6px",
    flexShrink: 0,
  },

  tierChartInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    flex: 1,
  },

  tierChartName: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#212121",
  },

  tierChartRange: {
    fontSize: "11px",
    color: "#999",
  },

  tierChartCurrent: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#10b981",
    backgroundColor: "#d1fae5",
    padding: "4px 8px",
    borderRadius: "4px",
  },

  "@media (max-width: 768px)": {
    tierInfo: {
      flexDirection: "column",
      alignItems: "flex-start",
    },
  },
};

export default CommunityTierBadge;
