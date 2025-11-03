import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCommunityActivities } from "../store/slices/activitySlice";
import { fetchCommunityById } from "../store/slices/communitySlice";
import { usePagination } from "../hooks/usePagination";
import Layout from "../components/common/Layout";
import ActivityFeed from "../components/activity/ActivityFeed";
import ActivityFilter from "../components/activity/ActivityFilter";
import { Button } from "../components/common/Button";
import { FiArrowLeft } from "react-icons/fi";
import styles from "./styles/CommunityActivity.module.css"; // Reusing styles

const CommunityActivity = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { activities, status, error } = useSelector(
    (state) => state.activities
  );
  const { currentCommunity } = useSelector((state) => state.community);
  const [filters, setFilters] = useState({ sortBy: "recent" });

  const paginationData = activities?.pagination || { total: 0 };

  const { page, limit, totalPages, goToPage, startIndex, endIndex } =
    usePagination(paginationData.total, 1, 20);

  useEffect(() => {
    if (communityId) {
      dispatch(fetchCommunityById(communityId));
      dispatch(fetchCommunityActivities({ communityId, page, limit, filters }));
    }
  }, [dispatch, communityId, page, limit, filters]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    goToPage(1);
  };

  return (
    <Layout>
      <div className={styles.container}>
        <Button
          size="sm"
          variant="ghost"
          icon={FiArrowLeft}
          onClick={() => navigate(`/communities/${communityId}`)}
          style={{ marginBottom: "20px" }}
        >
          Back to Community
        </Button>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {currentCommunity?.name || "Community"} Activity
          </h1>
          <p className={styles.subtitle}>
            See what members of this community are doing
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
          emptyMessage="No activity in this community yet."
        />
      </div>
    </Layout>
  );
};

export default CommunityActivity;
