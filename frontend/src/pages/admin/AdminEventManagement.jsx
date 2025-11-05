import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllEvents } from "../../store/slices/adminSlice";
import { usePagination } from "../../hooks/usePagination";
import { debounce, formatDate } from "../../config/helpers";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Loader } from "../../components/common/Loader";
import { Pagination } from "../../components/common/Pagination";
import { Badge } from "../../components/common/Badge";
import { FiSearch, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import ExportButton from "../../components/admin/ExportButton";

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
  eventName: { fontWeight: "600", color: "#00796B", textDecoration: "none" },
  row: { cursor: "pointer", transition: "background-color 0.2s" },
  rowHover: { backgroundColor: "#f9f9f9" },
  emptyState: { textAlign: "center", padding: "40px", color: "#666" },
};

const AdminEventManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { events, pagination, isLoading } = useSelector((state) => state.admin);

  const [filters, setFilters] = useState({ status: "", search: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const { page, totalPages, goToPage, startIndex, endIndex } = usePagination(
    pagination?.total || 0,
    1,
    15
  );

  const debouncedFetch = useCallback(
    debounce((dispatch, params) => {
      dispatch(getAllEvents(params));
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

  const getStatusBadge = (status) => {
    const statusMap = {
      Upcoming: "info",
      Ongoing: "success",
      Completed: "default",
      Cancelled: "error",
    };
    return (
      <Badge
        label={status}
        variant={statusMap[status] || "default"}
        size="sm"
      />
    );
  };

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Event Management</h1>
      </div>

      <Card padding="lg" shadow="md">
        <div style={styles.controls}>
          <div style={styles.searchInput}>
            <FiSearch color="#666" />
            <input
              type="text"
              placeholder="Search by event or community..."
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
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {isLoading && events.data.length === 0 ? (
          <Loader text="Loading events..." />
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Event</th>
                  <th style={styles.th}>Community</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Registered</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.data.map((event) => (
                  <tr
                    key={event._id}
                    style={styles.row}
                    onClick={() => navigate(`/admin/events/${event._id}`)}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor =
                        styles.rowHover.backgroundColor)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <td style={styles.td}>
                      <span style={styles.eventName}>{event.title}</span>
                    </td>
                    <td style={styles.td}>{event.community?.name || "N/A"}</td>
                    <td style={styles.td}>{formatDate(event.startDate)}</td>
                    <td style={styles.td}>{getStatusBadge(event.status)}</td>
                    <td style={styles.td}>{event.participants?.length || 0}</td>
                    <td style={styles.td}>
                      <Button size="sm" variant="outline" icon={FiEye}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && events.data.length === 0 && (
          <div style={styles.emptyState}>No events found matching filters.</div>
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

export default AdminEventManagement;
