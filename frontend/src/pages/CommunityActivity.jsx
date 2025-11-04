import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCommunityActivities } from "../store/slices/activitySlice";
import { fetchCommunityById } from "../store/slices/communitySlice";
import { usePagination } from "../hooks/usePagination";
import { useSocket } from "../hooks/useSocket";
import Layout from "../components/common/Layout";
import ActivityFeed from "../components/activity/ActivityFeed";
import ActivityFilter from "../components/activity/ActivityFilter";
import { Button } from "../components/common/Button";
import { addActivity } from "../store/slices/activitySlice";
import { FiArrowLeft } from "react-icons/fi";
import { toast } from "react-toastify";
import styles from "./styles/CommunityActivity.module.css";

const CommunityActivity = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { socket } = useSocket();

  const { activities, status, error } = useSelector(
    (state) => state.activities
  );
  const { currentCommunity, isLoading: communityLoading } = useSelector(
    (state) => state.community
  );
  const [filters, setFilters] = useState({ sortBy: "recent" });

  const paginationData = activities?.pagination || { total: 0 };

  const { page, limit, totalPages, goToPage } = usePagination(
    paginationData.total,
    1,
    20
  );

  // Fetch community and activities on mount
  useEffect(() => {
    if (!communityId) {
      toast.error("Community ID is required");
      navigate("/communities");
      return;
    }

    // Fetch community details
    dispatch(fetchCommunityById(communityId));

    // Fetch community activities
    dispatch(
      fetchCommunityActivities({
        communityId,
        page,
        limit,
        filters,
      })
    );

    // Join community room for real-time updates
    socket?.emit("join:community", communityId);

    return () => {
      socket?.emit("leave:community", communityId);
    };
  }, [dispatch, communityId, socket]);

  // Fetch activities when filters or pagination changes
  useEffect(() => {
    if (!communityId) return;

    dispatch(
      fetchCommunityActivities({
        communityId,
        page,
        limit,
        filters,
      })
    );
  }, [dispatch, communityId, page, limit, JSON.stringify(filters)]);

  // Listen for new activities in real-time
  useEffect(() => {
    if (!socket?.connected || !communityId) return;

    const handleNewActivity = (data) => {
      console.log("New community activity received:", data);
      dispatch(addActivity(data));
      toast.success("New activity in this community!", {
        autoClose: 3000,
        position: "bottom-right",
      });
    };

    socket?.on(`community:${communityId}:activity:new`, handleNewActivity);

    return () => {
      socket?.off(`community:${communityId}:activity:new`, handleNewActivity);
    };
  }, [socket?.connected, communityId, dispatch]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
    goToPage(1);
  };

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(`Error loading activities: ${error}`, {
        autoClose: 5000,
      });
    }
  }, [error]);

  if (communityLoading && !currentCommunity) {
    return (
      <Layout>
        <div className={styles.container}>
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p>Loading community...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentCommunity) {
    return (
      <Layout>
        <div className={styles.container}>
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p>Community not found</p>
            <Button onClick={() => navigate("/communities")}>
              Back to Communities
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

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
          <h1 className={styles.title}>{currentCommunity?.name} Activity</h1>
          <p className={styles.subtitle}>
            See what members of this community are doing
          </p>
        </div>

        <ActivityFilter onFilterChange={handleFilterChange} isGlobal={false} />

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
          emptyMessage="No activity in this community yet. Be the first to contribute!"
          title="Community Activity"
        />
      </div>
    </Layout>
  );
};

export default CommunityActivity;
