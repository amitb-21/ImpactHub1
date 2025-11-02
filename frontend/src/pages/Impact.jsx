import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  fetchUserMetrics,
  fetchUserProgress,
} from "../store/slices/impactSlice";
import Layout from "../components/common/Layout";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Loader } from "../components/common/Loader";
import LevelProgress from "../components/impact/LevelProgress";
import PointsBreakdown from "../components/impact/PointsBreakdown";
import RankBadge from "../components/impact/RankBadge";
import StreakCounter from "../components/impact/StreakCounter";
import UserStats from "../components/user/UserStats";
import UserActivity from "../components/user/UserActivity";
import { FiTrendingUp, FiAward } from "react-icons/fi";
import styles from "./styles/Impact.module.css";

const Impact = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { metrics, progress, isLoading, error } = useSelector(
    (state) => state.impact
  );

  useEffect(() => {
    if (user?._id) {
      console.log("Fetching user data for:", user._id);
      dispatch(fetchUserMetrics(user._id)).then((result) => {
        if (result.error) {
          console.error("Error fetching metrics:", result.error);
        } else {
          console.log("Metrics fetched successfully");
        }
      });
      dispatch(fetchUserProgress(user._id)).then((result) => {
        if (result.error) {
          console.error("Error fetching progress:", result.error);
        } else {
          console.log("Progress fetched successfully");
        }
      });
    }
  }, [user?._id, dispatch]);

  // Only show loading on initial load
  if (isLoading && !metrics && !progress) {
    return (
      <Layout>
        <div className={styles.loadingContainer}>
          <Loader size="lg" text="Loading your impact..." />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className={styles.errorContainer}>
          <Card padding="lg" shadow="md">
            <div className={styles.errorContent}>
              <FiAlertCircle size={48} className={styles.errorIcon} />
              <h2>Oops! Something went wrong</h2>
              <p>{error}</p>
              <Button
                variant="primary"
                onClick={() => {
                  dispatch(fetchUserMetrics(user._id));
                  dispatch(fetchUserProgress(user._id));
                }}
              >
                Try Again
              </Button>
            </div>
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
            <h1 className={styles.title}>Your Impact Dashboard</h1>
            <p className={styles.subtitle}>
              Track your progress, level up, and see the difference you're
              making!
            </p>
          </div>
          <Button
            size="md"
            variant="primary"
            icon={FiAward}
            onClick={() => navigate("/leaderboard")}
          >
            View Leaderboard
          </Button>
        </div>

        <div className={styles.gridContainer}>
          <div className={styles.mainColumn}>
            <div className={styles.section}>
              <LevelProgress userId={user._id} />
            </div>
            <div className={styles.section}>
              <PointsBreakdown userId={user._id} />
            </div>
          </div>
          <div className={styles.sidebarColumn}>
            <div className={styles.section}>
              <RankBadge userId={user._id} size="large" />
            </div>
            <div className={styles.section}>
              <StreakCounter userId={user._id} />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <UserStats userId={user._id} />
        </div>

        <div className={styles.section}>
          <UserActivity userId={user._id} limit={10} />
        </div>
      </div>
    </Layout>
  );
};

export default Impact;
