import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getApplicationHistory } from "../../store/slices/communityManagerSlice";
import { usePagination } from "../../hooks/usePagination";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { Pagination } from "../common/Pagination";
import { Loader } from "../common/Loader";
import { FiCheckCircle, FiClock, FiX, FiChevronRight } from "react-icons/fi";
import styles from "./styles/CMApplicationHistory.module.css";

const CMApplicationHistory = () => {
  const dispatch = useDispatch();
  const { applicationHistory, isLoading, error } = useSelector(
    (state) => state.communityManager
  );

  const {
    page,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev,
  } = usePagination(applicationHistory.pagination?.total || 0, 1, 10);

  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const hasInitialized = useRef(false); // ✅ FIX: Only fetch once

  // ✅ FIX: Only fetch on mount, then only when page changes
  useEffect(() => {
    // Only fetch if we haven't initialized yet
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      dispatch(getApplicationHistory(page));
    }
  }, []); // Empty dependency - runs once only

  // ✅ FIX: Only refetch when page changes manually
  useEffect(() => {
    if (hasInitialized.current) {
      // Page changed after initial load
      dispatch(getApplicationHistory(page));
    }
  }, [page, dispatch]);

  // Get status badge color and icon
  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { variant: "info", label: "Under Review", icon: FiClock },
      approved: { variant: "success", label: "Approved", icon: FiCheckCircle },
      rejected: { variant: "error", label: "Rejected", icon: FiX },
    };
    return statusMap[status] || statusMap.pending;
  };

  if (isLoading && applicationHistory.data.length === 0) {
    return (
      <Card padding="lg" shadow="md">
        <Loader size="md" text="Loading application history..." />
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="lg" shadow="md" className={styles.errorCard}>
        <div className={styles.errorContent}>
          <span>Error: {error}</span>
          <Button
            size="sm"
            variant="primary"
            onClick={() => dispatch(getApplicationHistory(page))}
          >
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  if (!applicationHistory.data || applicationHistory.data.length === 0) {
    return (
      <Card padding="lg" shadow="md" className={styles.emptyState}>
        <div className={styles.emptyContent}>
          <div className={styles.emptyIcon}>📋</div>
          <h3 className={styles.emptyTitle}>No Applications Yet</h3>
          <p className={styles.emptyText}>
            You haven't submitted any community manager applications yet.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card padding="lg" shadow="md">
        <h3 className={styles.tableTitle}>Application History</h3>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Community Name</th>
                <th>Status</th>
                <th>Applied</th>
                <th>Decision</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {applicationHistory.data.map((app) => {
                const statusBadge = getStatusBadge(app.status);
                return (
                  <tr key={app._id} className={styles.tableRow}>
                    <td className={styles.cellName}>
                      <div className={styles.nameCell}>
                        <span className={styles.communityName}>
                          {app.communityName}
                        </span>
                        <span className={styles.communityCategory}>
                          {app.category}
                        </span>
                      </div>
                    </td>

                    <td className={styles.cellStatus}>
                      <Badge
                        label={statusBadge.label}
                        variant={statusBadge.variant}
                        size="sm"
                      />
                    </td>

                    <td className={styles.cellDate}>
                      {new Date(app.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>

                    <td className={styles.cellDate}>
                      {app.decisionAt
                        ? new Date(app.decisionAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "-"}
                    </td>

                    <td className={styles.cellAction}>
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={FiChevronRight}
                        iconPosition="right"
                        onClick={() => {
                          setSelectedApplication(app);
                          setShowDetails(true);
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={goToPage}
            startIndex={(page - 1) * 10 + 1}
            endIndex={Math.min(page * 10, applicationHistory.pagination?.total)}
            total={applicationHistory.pagination?.total}
          />
        )}
      </Card>

      {/* Details Modal */}
      {showDetails && selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
};

// Application Details Modal Component
const ApplicationDetailsModal = ({ application, onClose }) => {
  const {
    status,
    communityName,
    category,
    createdAt,
    decisionAt,
    rejectionReason,
    approvalNotes,
  } = application;
  const statusBadge = {
    pending: { variant: "info", label: "Under Review", icon: FiClock },
    approved: { variant: "success", label: "Approved", icon: FiCheckCircle },
    rejected: { variant: "error", label: "Rejected", icon: FiX },
  }[status];

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <Card
        padding="lg"
        shadow="lg"
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Application Details</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.detailSection}>
            <span className={styles.detailLabel}>Community Name</span>
            <span className={styles.detailValue}>{communityName}</span>
          </div>

          <div className={styles.detailSection}>
            <span className={styles.detailLabel}>Category</span>
            <span className={styles.detailValue}>{category}</span>
          </div>

          <div className={styles.detailSection}>
            <span className={styles.detailLabel}>Status</span>
            <Badge
              label={statusBadge.label}
              variant={statusBadge.variant}
              size="sm"
            />
          </div>

          <div className={styles.detailSection}>
            <span className={styles.detailLabel}>Applied On</span>
            <span className={styles.detailValue}>
              {new Date(createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          {decisionAt && (
            <div className={styles.detailSection}>
              <span className={styles.detailLabel}>Decision On</span>
              <span className={styles.detailValue}>
                {new Date(decisionAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          )}

          {rejectionReason && (
            <div className={styles.detailSection}>
              <span className={styles.detailLabel}>Rejection Reason</span>
              <span className={styles.detailValue}>{rejectionReason}</span>
            </div>
          )}

          {approvalNotes && (
            <div className={styles.detailSection}>
              <span className={styles.detailLabel}>Admin Notes</span>
              <span className={styles.detailValue}>{approvalNotes}</span>
            </div>
          )}
        </div>

        <div className={styles.modalActions}>
          <Button variant="primary" size="md" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default CMApplicationHistory;
