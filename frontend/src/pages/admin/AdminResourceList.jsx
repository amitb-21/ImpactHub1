import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllPublishedResources } from "../../store/slices/adminSlice"; 
import { usePagination } from "../../hooks/usePagination";
import { debounce, timeAgo } from "../../config/helpers";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Loader } from "../../components/common/Loader";
import { Pagination } from "../../components/common/Pagination";
import { Badge } from "../../components/common/Badge";
import { FiSearch, FiEdit, FiBookOpen } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { RESOURCE_TYPES } from "../../config/constants";

// Re-using styles from UserManagement
const styles = {
  header: { marginBottom: "24px" },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    margin: "0 0 8px 0",
    color: "#212121",
  },
  controls: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  searchInput: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    padding: "8px 12px",
    flex: 1,
    minWidth: "250px",
  },
  input: {
    border: "none",
    outline: "none",
    fontSize: "14px",
    flex: 1,
    background: "transparent",
  },
  filters: { display: "flex", gap: "12px" },
  select: {
    padding: "8px 12px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
  },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: "900px" },
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
    verticalAlign: "middle",
  },
  resTitle: { fontWeight: "600", color: "#00796B", textDecoration: "none" },
  row: { cursor: "pointer", transition: "background-color 0.2s" },
  rowHover: { backgroundColor: "#f9f9f9" },
  emptyState: { textAlign: "center", padding: "40px", color: "#666" },
};

const AdminResourceList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { publishedResources, isLoading } = useSelector((state) => state.admin);

  const [filters, setFilters] = useState({ status: "", type: "", search: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const { page, totalPages, goToPage, startIndex, endIndex } = usePagination(
    publishedResources.pagination?.total || 0,
    1,
    15
  );

  const debouncedFetch = useCallback(
    debounce((dispatch, params) => {
      dispatch(getAllPublishedResources(params));
    }, 300),
    []
  );

  useEffect(() => {
    // Map frontend 'status' to backend 'isPublished'
    let apiFilters = { page, ...filters };
    if (filters.status === "published") {
      apiFilters.isPublished = true;
    } else if (filters.status === "pending") {
      apiFilters.isPublished = false;
    }
    // 'rejected' status isn't explicitly tracked by 'isPublished' (it's false),
    // we'd need backend to filter by 'rejectionReason: { $exists: true }' if we want a dedicated 'rejected' filter.
    // For now, 'pending' will show unpublished (which includes new and rejected).

    delete apiFilters.status; // remove frontend-only key

    debouncedFetch(dispatch, apiFilters);
  }, [dispatch, page, filters, debouncedFetch]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    goToPage(1);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    handleFilterChange("search", query);
  };

  const getStatusBadge = (resource) => {
    if (resource.isPublished) {
      return <Badge label="Published" variant="success" size="sm" />;
    }
    if (resource.rejectionReason) {
      return <Badge label="Rejected" variant="error" size="sm" />;
    }
    return <Badge label="Pending" variant="warning" size="sm" />;
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Resource Management</h1>
      </div>

      <Card padding="lg" shadow="md">
        <div style={styles.controls}>
          <div style={styles.searchInput}>
            <FiSearch color="#666" />
            <input
              type="text"
              placeholder="Search by title..."
              style={styles.input}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div style={styles.filters}>
            <select
              style={styles.select}
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="pending">Pending</option>
              {/* <option value="rejected">Rejected</option> */}
            </select>
            <select
              style={styles.select}
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
            >
              <option value="">All Types</option>
              {RESOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading && publishedResources.data.length === 0 ? (
          <Loader text="Loading resources..." />
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Title</th>
                  <th style={styles.th}>Author</th>
                  <th style={styles.th}>Type</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Submitted</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {publishedResources.data.map((res) => (
                  <tr
                    key={res._id}
                    style={styles.row}
                    onClick={() => navigate(`/admin/resources/${res._id}`)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        styles.rowHover.backgroundColor)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <td style={styles.td}>
                      <span style={styles.resTitle}>{res.title}</span>
                    </td>
                    <td style={styles.td}>{res.author?.name}</td>
                    <td style={styles.td}>
                      <Badge label={res.type} variant="info" size="sm" />
                    </td>
                    <td style={styles.td}>{getStatusBadge(res)}</td>
                    <td style={styles.td}>{timeAgo(res.createdAt)}</td>
                    <td style={styles.td}>
                      <Button size="sm" variant="outline" icon={FiEdit}>
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && publishedResources.data.length === 0 && (
          <div style={styles.emptyState}>
            No resources found matching filters.
          </div>
        )}

        {pagination && totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={goToPage}
            startIndex={startIndex}
            endIndex={endIndex}
            total={pagination.total}
          />
        )}
      </Card>
    </div>
  );
};

export default AdminResourceList;
