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
import { FiTrendingUp, FiAward, FiAlertCircle } from "react-icons/fi";
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
        }
      });
      dispatch(fetchUserProgress(user._id)).then((result) => {
        if (result.error) {
          console.error("Error fetching progress:", result.error);
        }
      });
    }
  }, [user?._id, dispatch]);

  // Only show loading on initial load if nothing is loaded yet
  if (isLoading && !metrics && !progress) {
    return (
      <Layout>
        <div className={styles.loadingContainer}>
          <Loader size="lg" text="Loading your impact..." />
        </div>
      </Layout>
    );
  }

  // Show error but don't crash
  if (error && !metrics && !progress) {
    return (
      <Layout>
        <div className={styles.container}>
          <Card padding="lg" shadow="md">
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <FiAlertCircle
                size={48}
                style={{ color: "#ef4444", marginBottom: "16px" }}
              />
              <h2 style={{ margin: "0 0 12px 0", color: "#212121" }}>
                Oops! Something went wrong
              </h2>
              <p style={{ margin: "0 0 24px 0", color: "#666" }}>
                {error || "Unable to load impact data"}
              </p>
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

  // FIXED: Handle new user with no data - show welcome message instead of crashing
  if (!metrics && !progress && !isLoading) {
    return (
      <Layout>
        <div className={styles.container}>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>Your Impact Dashboard</h1>
              <p className={styles.subtitle}>
                Start volunteering to see your impact grow!
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

          {/* Welcome Card for New Users */}
          <Card
            padding="lg"
            shadow="md"
            style={{ marginBottom: "24px", textAlign: "center" }}
          >
            <div style={{ padding: "40px 20px" }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>🚀</div>
              <h2 style={{ margin: "0 0 12px 0", color: "#212121" }}>
                Welcome to ImpactHub!
              </h2>
              <p
                style={{
                  color: "#666",
                  margin: "0 0 24px 0",
                  lineHeight: "1.6",
                }}
              >
                You're all set! Start joining events and communities to earn
                points, level up, and track your impact on the platform.
              </p>
              <Button
                size="md"
                variant="primary"
                onClick={() => navigate("/events")}
              >
                Explore Events
              </Button>
            </div>
          </Card>

          {/* Show your activity even as a new user */}
          <div className={styles.section}>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: "700",
                marginBottom: "16px",
              }}
            >
              Your Activity
            </h3>
            {user?._id && <UserActivity userId={user._id} limit={10} />}
          </div>
        </div>
      </Layout>
    );
  }

  // Normal view with data available
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
            {/* Only show if progress data exists */}
            {progress && (
              <div className={styles.section}>
                <LevelProgress userId={user._id} />
              </div>
            )}

            {/* Only show if metrics data exists */}
            {metrics && (
              <div className={styles.section}>
                <PointsBreakdown userId={user._id} />
              </div>
            )}
          </div>

          <div className={styles.sidebarColumn}>
            {/* Only show rank and streak if metrics exist */}
            {metrics && (
              <>
                <div className={styles.section}>
                  <RankBadge userId={user._id} size="large" />
                </div>
                <div className={styles.section}>
                  <StreakCounter userId={user._id} />
                </div>
              </>
            )}
          </div>
        </div>

        {/* User Stats - only if metrics exist */}
        {metrics && (
          <div className={styles.section}>
            <UserStats userId={user._id} />
          </div>
        )}

        {/* Activity Feed - always show */}
        <div className={styles.section}>
          <UserActivity userId={user._id} limit={10} />
        </div>
      </div>
    </Layout>
  );
};

export default Impact;
