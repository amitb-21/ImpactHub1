import React from "react";
import { Card } from "../common/Card";
import { Loader } from "../common/Loader";
import { Pagination } from "../common/Pagination";
import ActivityItem from "./ActivityItem";
import styles from "./styles/ActivityFeed.module.css";

const ActivityFeed = ({
  activities = [],
  pagination,
  onPageChange,
  isLoading = false,
  emptyMessage = "No activities found.",
  title,
}) => {
  if (isLoading && activities.length === 0) {
    return (
      <Card padding="lg" shadow="md">
        <div className={styles.loadingContainer}>
          <Loader size="md" text="Loading activity..." />
        </div>
      </Card>
    );
  }

  if (activities.length === 0) {
    return (
      <Card padding="lg" shadow="md">
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📭</div>
          <p className={styles.emptyStateTitle}>No Activity Yet</p>
          <p className={styles.emptyStateText}>{emptyMessage}</p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg" shadow="md">
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className={styles.feed}>
        {activities.map((activity) => (
          <ActivityItem key={activity._id} activity={activity} />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={onPageChange}
          startIndex={(pagination.page - 1) * pagination.limit + 1}
          endIndex={Math.min(
            pagination.page * pagination.limit,
            pagination.total
          )}
          total={pagination.total}
        />
      )}
    </Card>
  );
};

export default ActivityFeed;
