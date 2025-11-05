import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllPublishedResources,
  toggleFeaturedResource,
} from "../../store/slices/adminSlice";
import { usePagination } from "../../hooks/usePagination";
import { debounce, timeAgo } from "../../config/helpers";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Loader } from "../../components/common/Loader";
import { Pagination } from "../../components/common/Pagination";
import { Badge } from "../../components/common/Badge";
import { FiSearch, FiStar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { RESOURCE_CATEGORIES, RESOURCE_TYPES } from "../../config/constants";

// Re-using styles
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
  emptyState: { textAlign: "center", padding: "40px", color: "#666" },
};

const AdminFeaturedResources = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // Note: 'publishedResources' is the name of the state slice for *all* resources
  const { publishedResources, isLoading, isUpdating } = useSelector(
    (state) => state.admin
  );

  const [filters, setFilters] = useState({
    isPublished: true,
    type: "",
    search: "",
    category: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [togglingId, setTogglingId] = useState(null);

  const { page, totalPages, goToPage, startIndex, endIndex } = usePagination(
    publishedResources.pagination?.total || 0,
    1,
    20
  );

  const debouncedFetch = useCallback(
    debounce((dispatch, params) => {
      dispatch(getAllPublishedResources(params));
    }, 300),
    []
  );

  useEffect(() => {
    const params = { page, ...filters };
    debouncedFetch(dispatch, params);
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

  const handleToggleFeatured = (e, resourceId) => {
    e.stopPropagation();
    setTogglingId(resourceId);
    dispatch(toggleFeaturedResource(resourceId)).finally(() => {
      setTogglingId(null);
    });
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Manage Featured Resources</h1>
      </div>

      <Card padding="lg" shadow="md">
        <div style={styles.controls}>
          <div style={styles.searchInput}>
            <FiSearch color="#666" />
            <input
              type="text"
              placeholder="Search published resources..."
              style={styles.input}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div style={styles.filters}>
            <select
              style={styles.select}
              value={filters.category}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="">All Categories</option>
              {RESOURCE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
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
                  <th style={styles.th}>Views</th>
                  <th style={styles.th}>Featured</th>
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
                    <td style={styles.td}>{res.views}</td>
                    <td style={styles.td}>
                      {res.isFeatured ? (
                        <Badge
                          label="Featured"
                          variant="success"
                          size="sm"
                          icon={FiStar}
                        />
                      ) : (
                        <Badge label="No" variant="default" size="sm" />
                      )}
                    </td>
                    <td style={styles.td}>
                      <Button
                        size="sm"
                        variant={res.isFeatured ? "outline" : "primary"}
                        onClick={(e) => handleToggleFeatured(e, res._id)}
                        loading={isUpdating && togglingId === res._id}
                        disabled={isUpdating}
                      >
                        {res.isFeatured ? "Unfeature" : "Mark Featured"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && publishedResources.data.length === 0 && (
          <div style={styles.emptyState}>No published resources found.</div>
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

export default AdminFeaturedResources;
