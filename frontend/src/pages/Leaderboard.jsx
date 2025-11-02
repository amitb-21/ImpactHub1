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

  const { volunteerLeaderboard, isLoading } = useSelector(
    (state) => state.impact
  );
  const { data = [], pagination } = volunteerLeaderboard;

  useEffect(() => {
    // Note: The provided thunk fetchVolunteerLeaderboard does not support metric filtering
    // We will fetch by points (default) and simulate filtering if needed,
    // or adjust if the thunk is updated. For now, it only fetches by points.
    dispatch(fetchVolunteerLeaderboard(page));
  }, [dispatch, page, metric]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleMetricChange = (newMetric) => {
    setMetric(newMetric);
    setPage(1);
    // In a real scenario, you'd pass this metric to the thunk
    // dispatch(fetchVolunteerLeaderboard({ page: 1, metric: newMetric }));
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Global Leaderboard</h1>
            <p className={styles.subtitle}>
              See who's making the biggest impact in the community
            </p>
          </div>
        </div>

        <Card padding="lg" shadow="md">
          <div className={styles.filters}>
            <Button
              variant={metric === "points" ? "primary" : "outline"}
              onClick={() => handleMetricChange("points")}
              icon={FiTrendingUp}
            >
              By Points
            </Button>
            <Button
              variant={metric === "level" ? "primary" : "outline"}
              onClick={() => handleMetricChange("level")}
              icon={FiAward}
            >
              By Level
            </Button>
            <Button
              variant={metric === "hours" ? "primary" : "outline"}
              onClick={() => handleMetricChange("hours")}
              icon={FiClock}
            >
              By Hours
            </Button>
          </div>

          <LeaderboardComponent
            data={data}
            currentUserId={user?._id}
            metric={metric}
            onPageChange={handlePageChange}
            isLoading={isLoading}
            pagination={pagination}
          />

          {pagination && (
            <div className={styles.currentUserRank}>
              <p>
                Your Rank: <strong>#...</strong> (Feature coming soon)
              </p>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Leaderboard;
