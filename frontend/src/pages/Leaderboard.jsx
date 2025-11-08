// frontend/src/pages/Leaderboard.jsx

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import { fetchVolunteerLeaderboard } from "../store/slices/impactSlice";
import Layout from "../components/common/Layout";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Loader } from "../components/common/Loader";
import LeaderboardComponent from "../components/impact/Leaderboard";
import { FiAward, FiTrendingUp, FiClock } from "react-icons/fi";
import styles from "./styles/Leaderboard.module.css";

const Leaderboard = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [metric, setMetric] = useState("points");
  const [page, setPage] = useState(1);

  // Get data from Redux store
  const { volunteerLeaderboard, isLoading } = useSelector(
    (state) => state.impact
  );
  const { data = [], pagination = {} } = volunteerLeaderboard || {};

  // Fetch leaderboard data on mount and when page changes
  useEffect(() => {
    dispatch(fetchVolunteerLeaderboard(page));
  }, [dispatch, page]);

  // Handle page changes
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Handle metric changes (Note: API currently only supports points)
  const handleMetricChange = (newMetric) => {
    setMetric(newMetric);
    setPage(1);
    // TODO: Update fetchVolunteerLeaderboard thunk to support metric parameter
  };

  return (
    <Layout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Global Leaderboard</h1>
            <p className={styles.subtitle}>
              See who's making the biggest impact in the community
            </p>
          </div>
        </div>

        {/* Metric Filter Buttons */}
        <Card padding="lg" shadow="md" style={{ marginBottom: "20px" }}>
          <div className={styles.filters}>
            <Button
              variant={metric === "points" ? "primary" : "outline"}
              onClick={() => handleMetricChange("points")}
              icon={FiTrendingUp}
              size="md"
            >
              By Points
            </Button>
            <Button
              variant={metric === "level" ? "primary" : "outline"}
              onClick={() => handleMetricChange("level")}
              icon={FiAward}
              size="md"
              disabled
              title="Coming soon"
            >
              By Level
            </Button>
            <Button
              variant={metric === "hours" ? "primary" : "outline"}
              onClick={() => handleMetricChange("hours")}
              icon={FiClock}
              size="md"
              disabled
              title="Coming soon"
            >
              By Hours
            </Button>
          </div>
        </Card>

        {/* Loading State */}
        {isLoading && data.length === 0 ? (
          <Card padding="lg" shadow="md">
            <div style={{ padding: "40px", textAlign: "center" }}>
              <Loader size="md" text="Loading leaderboard..." />
            </div>
          </Card>
        ) : (
          <>
            {/* Leaderboard Component */}
            <LeaderboardComponent
              data={data}
              currentUserId={user?._id}
              metric={metric}
              onPageChange={handlePageChange}
              isLoading={isLoading}
              pagination={{
                page: pagination?.page || 1,
                totalPages: pagination?.totalPages || 1,
                limit: pagination?.limit || 20,
                total: pagination?.total || 0,
              }}
            />

            {/* Current User Rank Info */}
            {user && (
              <Card
                padding="lg"
                shadow="md"
                style={{ marginTop: "20px", textAlign: "center" }}
              >
                <p style={{ margin: "0", color: "#666", fontSize: "14px" }}>
                  Your current rank will be calculated based on your performance
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Leaderboard;
