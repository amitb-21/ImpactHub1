import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEntityRatings } from "../../store/slices/ratingSlice";
import RatingItem from "./RatingItem";
import { Loader } from "../common/Loader";
import { Pagination } from "../common/Pagination";
import { usePagination } from "../../hooks/usePagination";
import styles from "./styles/RatingList.module.css";

const RatingList = ({ entityType, entityId }) => {
  const dispatch = useDispatch();
  const { entityRatings, isLoading, error } = useSelector(
    (state) => state.rating
  );
  const [sortBy, setSortBy] = useState("recent");

  const { page, totalPages, goToPage, startIndex, endIndex } = usePagination(
    entityRatings.pagination?.total || 0,
    1,
    10
  );

  useEffect(() => {
    if (entityType && entityId) {
      dispatch(fetchEntityRatings({ entityType, entityId, page, sortBy }));
    }
  }, [dispatch, entityType, entityId, page, sortBy]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader size="sm" text="Loading reviews..." />
      </div>
    );
  }

  if (error) {
    return <div className={styles.errorContainer}>Error: {error}</div>;
  }

  if (entityRatings.data.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>⭐</div>
        <p className={styles.emptyTitle}>No Reviews Yet</p>
        <p className={styles.emptyText}>
          Be the first to share your experience!
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.title}>
          All Reviews ({entityRatings.pagination?.total || 0})
        </h4>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={styles.sortSelect}
        >
          <option value="recent">Most Recent</option>
          <option value="helpful">Most Helpful</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      <div className={styles.list}>
        {entityRatings.data.map((rating) => (
          <RatingItem key={rating._id} rating={rating} />
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={goToPage}
        startIndex={startIndex}
        endIndex={endIndex}
        total={entityRatings.pagination?.total || 0}
      />
    </div>
  );
};

export default RatingList;
