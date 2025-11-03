import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllActivities } from "../store/slices/activitySlice";
import { usePagination } from "../hooks/usePagination";
import Layout from "../components/common/Layout";
import ActivityFeed from "../components/activity/ActivityFeed";
import ActivityFilter from "../components/activity/ActivityFilter";
import styles from "./styles/ActivityFeed.module.css";

const GlobalActivityFeed = () => {
  const dispatch = useDispatch();
  const { activities, status, error } = useSelector(
    (state) => state.activities
  );
  const [filters, setFilters] = useState({ sortBy: "recent" });

  const paginationData = activities?.pagination || { total: 0 };

  const { page, limit, totalPages, goToPage, startIndex, endIndex } =
    usePagination(paginationData.total, 1, 20);

  useEffect(() => {
    // We need to pass pagination and filters to the thunk
    // The current activitySlice doesn't support this, but we'll build for it.
    dispatch(fetchAllActivities({ page, limit, filters }));
  }, [dispatch, page, limit, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    goToPage(1);
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Global Activity Feed</h1>
          <p className={styles.subtitle}>
            See what's happening across the platform
          </p>
        </div>

        <ActivityFilter onFilterChange={handleFilterChange} />

        <ActivityFeed
          activities={activities.data || []}
          pagination={{
            ...paginationData,
            page,
            totalPages,
            startIndex,
            endIndex,
          }}
          onPageChange={goToPage}
          isLoading={status === "loading"}
          emptyMessage="No platform activity found."
        />
      </div>
    </Layout>
  );
};

export default GlobalActivityFeed;
