import React from "react";
import { Badge } from "../common/Badge";
import { Card } from "../common/Card";
import { calculateTier } from "../../config/helpers";
import { FiAward, FiTrendingUp } from "react-icons/fi";
import styles from "./styles/CommunityTierBadge.module.css";

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

  // Compact View - Just show badge
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

  // Full View
  return (
    <Card padding="lg" shadow="md" style={style}>
      <div className={styles.container}>
        {/* Tier Info */}
        <div className={styles.tierInfo}>
          <div
            className={styles.tierIcon}
            style={{ backgroundColor: tier.color }}
          >
            <FiAward size={24} style={{ color: "#FAFAFA" }} />
          </div>

          <div className={styles.tierContent}>
            <h3 className={styles.tierName}>Community Tier</h3>
            <p className={styles.tierTitle}>{tier.name}</p>
            <p className={styles.tierDescription}>
              Total Points: {communityPoints.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Progress Section */}
        {showProgress && (
          <div className={styles.progressSection}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>
                Progress to {getNextTierName(tier.name)}
              </span>
              <span className={styles.progressValue}>
                {communityPoints.toLocaleString()} /{" "}
                {nextTierThreshold.toLocaleString()}
              </span>
            </div>

            {/* Progress Bar */}
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${Math.min(progress, 100)}%`,
                  backgroundColor: tier.color,
                }}
              />
            </div>

            {/* Progress Text */}
            <p className={styles.progressText}>
              {Math.round(progress)}% to next tier
            </p>
          </div>
        )}

        {/* Tier Benefits */}
        <div className={styles.benefitsSection}>
          <h4 className={styles.benefitsTitle}>
            <FiTrendingUp
              size={16}
              style={{ display: "inline", marginRight: "6px" }}
            />
            Tier Benefits
          </h4>
          <ul className={styles.benefitsList}>
            {getTierBenefits(tier.name).map((benefit, index) => (
              <li key={index} className={styles.benefitItem}>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Tier Chart */}
        <div className={styles.tierChartSection}>
          <h4 className={styles.chartTitle}>Community Tier Levels</h4>
          <div className={styles.tierChart}>
            {getTierChart().map((t) => (
              <div
                key={t.name}
                className={`${styles.tierChartItem} ${
                  tier.name !== t.name ? styles.tierChartItemInactive : ""
                }`}
                style={{ borderLeftColor: t.color }}
              >
                <div
                  className={styles.tierChartColor}
                  style={{ backgroundColor: t.color }}
                />
                <div className={styles.tierChartInfo}>
                  <span className={styles.tierChartName}>{t.name}</span>
                  <span className={styles.tierChartRange}>
                    {t.min.toLocaleString()} - {t.max.toLocaleString()}
                  </span>
                </div>
                {tier.name === t.name && (
                  <span className={styles.tierChartCurrent}>Current</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

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

/**
 * Helper function to get next tier name
 */
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
    },
    {
      name: "Silver",
      color: "#c0c0c0",
      min: 1000,
      max: 2499,
    },
    {
      name: "Gold",
      color: "#ffd700",
      min: 2500,
      max: 4999,
    },
    {
      name: "Platinum",
      color: "#e5e4e2",
      min: 5000,
      max: 9999,
    },
    {
      name: "Diamond",
      color: "#b9f2ff",
      min: 10000,
      max: 99999,
    },
  ];
};

export default CommunityTierBadge;
