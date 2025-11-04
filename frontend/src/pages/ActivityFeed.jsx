import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllActivities } from "../store/slices/activitySlice";
import { usePagination } from "../hooks/usePagination";
import { useSocket } from "../hooks/useSocket";
import Layout from "../components/common/Layout";
import ActivityFeed from "../components/activity/ActivityFeed";
import ActivityFilter from "../components/activity/ActivityFilter";
import { addActivity } from "../store/slices/activitySlice";
import { toast } from "react-toastify";
import styles from "./styles/ActivityFeed.module.css";

const GlobalActivityFeed = () => {
  const dispatch = useDispatch();
  const { socket } = useSocket();
  const { activities, status, error } = useSelector(
    (state) => state.activities
  );
  const [filters, setFilters] = useState({ sortBy: "recent" });

  const paginationData = activities?.pagination || { total: 0 };

  const { page, limit, totalPages, goToPage } = usePagination(
    paginationData.total,
    1,
    20
  );

  // Fetch activities when page, limit, or filters change
  useEffect(() => {
    dispatch(fetchAllActivities({ page, limit, filters }));
  }, [dispatch, page, limit, JSON.stringify(filters)]);

  // Listen for new activities in real-time
  useEffect(() => {
    if (!socket?.connected) return;

    const handleNewActivity = (data) => {
      console.log("New activity received:", data);
      // Add to Redux store
      dispatch(addActivity(data));
      // Show toast notification
      toast.success(`New activity: ${data.description}`, {
        autoClose: 3000,
        position: "bottom-right",
      });
    };

    socket?.on("activity:new", handleNewActivity);

    // Cleanup
    return () => {
      socket?.off("activity:new", handleNewActivity);
    };
  }, [socket?.connected, dispatch]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
    // Reset to page 1 when filters change
    goToPage(1);
  };

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(`Error: ${error}`, {
        autoClose: 5000,
      });
    }
  }, [error]);

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Global Activity Feed</h1>
          <p className={styles.subtitle}>
            See what's happening across the platform in real-time
          </p>
        </div>

        <ActivityFilter onFilterChange={handleFilterChange} isGlobal={true} />

        <ActivityFeed
          activities={activities.data || []}
          pagination={{
            total: paginationData.total,
            page,
            limit,
            totalPages,
          }}
          onPageChange={goToPage}
          isLoading={status === "loading"}
          emptyMessage="No platform activity found. Be the first to create an event or join a community!"
          title="Recent Activity"
        />
      </div>
    </Layout>
  );
};

export default GlobalActivityFeed;
