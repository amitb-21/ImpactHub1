import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getPendingCMApplications,
  getPendingResources,
} from "../../store/slices/adminSlice";
import { usePagination } from "../../hooks/usePagination";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Loader } from "../../components/common/Loader";
import { Pagination } from "../../components/common/Pagination";
import { Badge } from "../../components/common/Badge";
import { FiUsers, FiBookOpen } from "react-icons/fi";
import { timeAgo } from "../../config/helpers";

// Basic inline styles
const styles = {
  header: { marginBottom: "24px" },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    margin: "0 0 8px 0",
    color: "#212121",
  },
  tabs: {
    display: "flex",
    borderBottom: "2px solid #e0e0e0",
    marginBottom: "20px",
  },
  tab: {
    padding: "12px 18px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    color: "#666",
    borderBottom: "3px solid transparent",
    marginBottom: "-2px",
    background: "none",
    border: "none",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  tabActive: { color: "#00796B", borderBottomColor: "#00796B" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "700px" },
  th: {
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: "600",
    color: "#666",
    fontSize: "12px",
    textTransform: "uppercase",
    borderBottom: "2px solid #e0e0e0",
  },
  td: {
    padding: "12px 16px",
    borderBottom: "1px solid #f0f0f0",
    fontSize: "13px",
  },
  row: { cursor: "pointer", transition: "background-color 0.2s" },
  rowHover: { backgroundColor: "#f9f9f9" },
  emptyState: { textAlign: "center", padding: "40px", color: "#666" },
  errorBox: {
    padding: "12px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    borderRadius: "6px",
    marginBottom: "16px",
  },
};

const VerificationQueue = () => {
  const [activeTab, setActiveTab] = useState("cm"); // 'cm' or 'resources'
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // CM Applications State
  const {
    pendingCMApplications,
    isLoading: cmLoading,
    error,
  } = useSelector((state) => state.admin);
  const cmPaginationHook = usePagination(
    pendingCMApplications.pagination?.total || 0,
    1,
    15
  );

  // Resources State
  const { pendingResources, isLoading: resLoading } = useSelector(
    (state) => state.admin
  );
  const resPaginationHook = usePagination(
    pendingResources.pagination?.total || 0,
    1,
    15
  );

  // Fetch CM Applications when tab or page changes
  useEffect(() => {
    if (activeTab === "cm") {
      dispatch(getPendingCMApplications(cmPaginationHook.page)).catch((err) => {
        console.error("Error fetching CM applications:", err);
      });
    }
  }, [dispatch, activeTab, cmPaginationHook.page]);

  // Fetch Resources when tab or page changes
  useEffect(() => {
    if (activeTab === "resources") {
      dispatch(getPendingResources(resPaginationHook.page)).catch((err) => {
        console.error("Error fetching pending resources:", err);
      });
    }
  }, [dispatch, activeTab, resPaginationHook.page]);

  const renderCMApplications = () => {
    const isLoading = cmLoading && pendingCMApplications.data?.length === 0;

    if (isLoading) {
      return <Loader text="Loading community manager applications..." />;
    }

    if (
      !pendingCMApplications.data ||
      pendingCMApplications.data.length === 0
    ) {
      return (
        <div style={styles.emptyState}>
          No pending community manager applications.
        </div>
      );
    }

    return (
      <>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Applicant</th>
                <th style={styles.th}>Community Name</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Submitted</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingCMApplications.data.map((app) => (
                <tr
                  key={app._id}
                  style={styles.row}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      styles.rowHover.backgroundColor)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <td style={styles.td}>{app.applicant?.name || "Unknown"}</td>
                  <td style={styles.td}>
                    {app.communityDetails?.name || app.communityName || "N/A"}
                  </td>
                  <td style={styles.td}>
                    {app.communityDetails?.category || app.category || "N/A"}
                  </td>
                  <td style={styles.td}>{timeAgo(app.createdAt)}</td>
                  <td style={styles.td}>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() =>
                        navigate(`/admin/cm-applications/${app._id}`)
                      }
                    >
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {cmPaginationHook.totalPages > 1 && (
          <Pagination
            page={cmPaginationHook.page}
            totalPages={cmPaginationHook.totalPages}
            onPageChange={cmPaginationHook.goToPage}
            total={pendingCMApplications.pagination?.total || 0}
            startIndex={cmPaginationHook.startIndex}
            endIndex={cmPaginationHook.endIndex}
          />
        )}
      </>
    );
  };

  const renderResources = () => {
    const isLoading = resLoading && pendingResources.data?.length === 0;

    if (isLoading) {
      return <Loader text="Loading pending resources..." />;
    }

    if (!pendingResources.data || pendingResources.data.length === 0) {
      return (
        <div style={styles.emptyState}>No pending resources for approval.</div>
      );
    }

    return (
      <>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Author</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>Submitted</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingResources.data.map((res) => (
                <tr
                  key={res._id}
                  style={styles.row}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      styles.rowHover.backgroundColor)
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                >
                  <td style={styles.td}>{res.title || "N/A"}</td>
                  <td style={styles.td}>{res.author?.name || "N/A"}</td>
                  <td style={styles.td}>
                    <Badge label={res.type || "N/A"} variant="info" size="sm" />
                  </td>
                  <td style={styles.td}>{timeAgo(res.createdAt)}</td>
                  <td style={styles.td}>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => navigate(`/admin/resources/${res._id}`)}
                    >
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {resPaginationHook.totalPages > 1 && (
          <Pagination
            page={resPaginationHook.page}
            totalPages={resPaginationHook.totalPages}
            onPageChange={resPaginationHook.goToPage}
            total={pendingResources.pagination?.total || 0}
            startIndex={resPaginationHook.startIndex}
            endIndex={resPaginationHook.endIndex}
          />
        )}
      </>
    );
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Verification Queue</h1>
      </div>

      {error && (
        <div style={styles.errorBox}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "cm" ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab("cm")}
        >
          <FiUsers size={18} />
          Community Managers ({pendingCMApplications.pagination?.total || 0})
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === "resources" ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab("resources")}
        >
          <FiBookOpen size={18} />
          Pending Resources ({pendingResources.pagination?.total || 0})
        </button>
      </div>

      <Card padding="lg" shadow="md">
        {activeTab === "cm" ? renderCMApplications() : renderResources()}
      </Card>
    </div>
  );
};

export default VerificationQueue;