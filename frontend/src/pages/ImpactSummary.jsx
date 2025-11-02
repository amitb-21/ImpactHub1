import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchImpactSummary } from "../store/slices/impactSlice";
import Layout from "../components/common/Layout";
import { Card } from "../components/common/Card";
import { Loader } from "../components/common/Loader";
import { formatPoints } from "../config/formatters";
import {
  FiUsers,
  FiTrendingUp,
  FiCheckCircle,
  FiCalendar,
} from "react-icons/fi";
import styles from "./styles/ImpactSummary.module.css";

const ImpactSummary = () => {
  const dispatch = useDispatch();
  const { summary, isLoading, error } = useSelector((state) => state.impact);

  useEffect(() => {
    dispatch(fetchImpactSummary());
  }, [dispatch]);

  if (isLoading || !summary) {
    return (
      <Layout>
        <div className={styles.loadingContainer}>
          <Loader size="lg" text="Loading platform stats..." />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className={styles.container}>
          <Card padding="lg" shadow="md">
            <p style={{ color: "red" }}>{error}</p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Platform Impact Summary</h1>
            <p className={styles.subtitle}>
              See the collective impact of our entire community
            </p>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <StatCard
            icon={<FiUsers size={28} />}
            label="Total Volunteers"
            value={formatPoints(summary.totalUsers)}
            color="#3b82f6"
          />
          <StatCard
            icon={<FiTrendingUp size={28} />}
            label="Total Points Earned"
            value={formatPoints(summary.totalPoints)}
            color="#f59e0b"
          />
          <StatCard
            icon={<FiCheckCircle size={28} />}
            label="Total Communities"
            value={formatPoints(summary.totalCommunities)}
            color="#10b981"
          />
          <StatCard
            icon={<FiCalendar size={28} />}
            label="Total Events Hosted"
            value={formatPoints(summary.totalEvents)}
            color="#8b5cf6"
          />
        </div>

        <div className={styles.chartsGrid}>
          <Card padding="lg" shadow="md">
            <h3 className={styles.chartTitle}>Top Contributors</h3>
            <ul className={styles.topList}>
              {summary.topContributors?.map((user, index) => (
                <li key={user._id} className={styles.topItem}>
                  <span className={styles.topRank}>{index + 1}</span>
                  <span className={styles.topName}>{user.name}</span>
                  <span className={styles.topValue}>
                    {formatPoints(user.points)} pts
                  </span>
                </li>
              ))}
            </ul>
          </Card>
          <Card padding="lg" shadow="md">
            <h3 className={styles.chartTitle}>Activity by Category</h3>
            <ul className={styles.topList}>
              {summary.eventsByCategory?.map((cat) => (
                <li key={cat._id} className={styles.topItem}>
                  <span className={styles.topName}>{cat._id}</span>
                  <span className={styles.topValue}>{cat.count} events</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <Card padding="lg" shadow="sm" className={styles.statCard}>
    <div
      className={styles.statIcon}
      style={{ color, backgroundColor: `${color}20` }}
    >
      {icon}
    </div>
    <div className={styles.statContent}>
      <p className={styles.statValue} style={{ color }}>
        {value}
      </p>
      <p className={styles.statLabel}>{label}</p>
    </div>
  </Card>
);

export default ImpactSummary;
