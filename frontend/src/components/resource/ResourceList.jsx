import React from "react";
import ResourceCard from "./ResourceCard";
import { Pagination } from "../common/Pagination";
import { Loader } from "../common/Loader";
import styles from "./styles/ResourceList.module.css";

const ResourceList = ({
  resources = [],
  pagination,
  onPageChange,
  isLoading = false,
  emptyMessage = "No resources found.",
}) => {
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader size="md" text="Loading resources..." />
      </div>
    );
  }

  if (resources.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📚</div>
        <h3 className={styles.emptyTitle}>No Resources Found</h3>
        <p className={styles.emptyText}>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {resources.map((resource) => (
          <ResourceCard key={resource._id} resource={resource} />
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
    </div>
  );
};

export default ResourceList;
