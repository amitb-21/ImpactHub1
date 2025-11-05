/* frontend/src/pages/admin/AdminEventDetail.jsx */
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  getEventAnalytics,
  getEventParticipants,
} from "../../store/slices/adminSlice";
import { usePagination } from "../../hooks/usePagination";
import { debounce, formatDate } from "../../config/helpers";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Loader } from "../../components/common/Loader";
import { Pagination } from "../../components/common/Pagination";
import { Badge } from "../../components/common/Badge";
import {
  FiArrowLeft,
  FiSearch,
  FiUsers,
  FiClock,
  FiStar,
  FiTrendingUp,
} from "react-icons/fi";
import ExportButton from "../../components/admin/ExportButton";
import { formatPoints } from "../../config/formatters";

// Re-using styles
const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  title: { fontSize: "28px", fontWeight: "800", margin: 0, color: "#212121" },
  grid: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" },
  leftCol: { display: "flex", flexDirection: "column", gap: "20px" },
  rightCol: { display: "flex", flexDirection: "column", gap: "20px" },
  section: { marginBottom: "16px" },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#00796B",
    margin: "0 0 12px 0",
    paddingBottom: "8px",
    borderBottom: "2px solid #e0e0e0",
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "16px",
    marginBottom: "16px",
  },
  statBox: {
    padding: "16px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    textAlign: "center",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#00796B",
    display: "block",
  },
  statLabel: {
    fontSize: "12px",
    color: "#666",
    marginTop: "4px",
    textTransform: "uppercase",
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
  select: {
    padding: "8px 12px",
    fontSize: "14px",
    borderRadius: "8px",
    border: "1px solid #e0e0e0",
  },
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
    verticalAlign: "middle",
  },
  userName: { fontWeight: "600", color: "#00796B", textDecoration: "none" },
  emptyState: { textAlign: "center", padding: "40px", color: "#666" },
};

const AdminEventDetail = () => {
  const { eventId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { eventDetail, isLoading } = useSelector((state) => state.admin);
  const analytics = eventDetail.analytics || {};
  const participants = eventDetail.participants;

  const [filters, setFilters] = useState({ status: "", search: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const { page, totalPages, goToPage, startIndex, endIndex } = usePagination(
    participants.pagination?.total || 0,
    1,
    20
  );

  // Fetch analytics (which includes first page of participants)
  useEffect(() => {
    if (eventId) {
      dispatch(getEventAnalytics(eventId));
    }
  }, [eventId, dispatch]);

  // Fetch participants when filters/page change
  const debouncedFetch = useCallback(
    debounce((dispatch, params) => {
      dispatch(getEventParticipants(params));
    }, 300),
    []
  );

  useEffect(() => {
    // Don't refetch on page 1 if analytics just loaded it
    if (page === 1 && analytics) return;
    const params = { eventId, page, ...filters };
    debouncedFetch(dispatch, params);
  }, [dispatch, page, filters, debouncedFetch, eventId, analytics]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    goToPage(1);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchTerm(query);
    handleFilterChange("search", query);
  };

  const kpiStats = [
    {
      label: "Registered",
      value: analytics.totalRegistered,
      icon: FiUsers,
      color: "#3b82f6",
      bgColor: "#dbeafe",
    },
    {
      label: "Attended",
      value: analytics.totalAttended,
      icon: FiCheckSquare,
      color: "#10b981",
      bgColor: "#d1fae5",
    },
    {
      label: "Total Hours",
      value: analytics.totalHours || 0,
      icon: FiClock,
      color: "#8b5cf6",
      bgColor: "#ede9fe",
    },
    {
      label: "Total Points",
      value: formatPoints(analytics.totalPoints || 0),
      icon: FiTrendingUp,
      color: "#f59e0b",
      bgColor: "#fef3c7",
    },
    {
      label: "Avg. Rating",
      value: (analytics.avgRating || 0).toFixed(1),
      icon: FiStar,
      color: "#ef4444",
      bgColor: "#fee2e2",
    },
  ];

  if (isLoading && !analytics) {
    return <Loader size="lg" text="Loading event details..." />;
  }

  return (
    <div>
      <div style={styles.header}>
        <Button
          variant="ghost"
          size="sm"
          icon={FiArrowLeft}
          onClick={() => navigate("/admin/events")}
        >
          Back to Events
        </Button>
        <ExportButton eventId={eventId} />
      </div>

      <div style={styles.statGrid}>
        {kpiStats.map((stat) => (
          <Card key={stat.label} shadow="sm" style={styles.statCard}>
            <div
              style={{
                ...styles.statIcon,
                color: stat.color,
                backgroundColor: stat.bgColor,
              }}
            >
              <stat.icon size={24} />
            </div>
            <div style={styles.statContent}>
              <h4 style={styles.statValue}>{stat.value}</h4>
              <p style={styles.statLabel}>{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card padding="lg" shadow="md" style={{ marginTop: "24px" }}>
        <h3 style={styles.sectionTitle}>
          Participants ({participants.pagination?.total || 0})
        </h3>

        <div style={styles.controls}>
          <div style={styles.searchInput}>
            <FiSearch color="#666" />
            <input
              type="text"
              placeholder="Search by name or email..."
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
              <option value="Registered">Registered</option>
              <option value="Attended">Attended</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {isLoading && participants.data.length === 0 ? (
          <Loader text="Loading participants..." />
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Hours</th>
                  <th style={styles.th}>Points</th>
                  <th style={styles.th}>Rating</th>
                </tr>
              </thead>
              <tbody>
                {participants.data.map((p) => (
                  <tr key={p._id}>
                    <td style={styles.td}>
                      <Link
                        to={`/profile/${p.user?._id}`}
                        style={styles.userName}
                      >
                        {p.user?.name}
                      </Link>
                    </td>
                    <td style={styles.td}>{p.user?.email}</td>
                    <td style={styles.td}>
                      <Badge
                        label={p.status}
                        variant={
                          p.status === "Attended"
                            ? "success"
                            : p.status === "Registered"
                            ? "info"
                            : "default"
                        }
                        size="sm"
                      />
                    </td>
                    <td style={styles.td}>{p.hoursContributed}</td>
                    <td style={styles.td}>{p.pointsEarned}</td>
                    <td style={styles.td}>{p.rating || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && participants.data.length === 0 && (
          <div style={styles.emptyState}>No participants found.</div>
        )}

        {participants.pagination && participants.pagination.totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={goToPage}
            startIndex={startIndex}
            endIndex={endIndex}
            total={participants.pagination.total}
          />
        )}
      </Card>
    </div>
  );
};

export default AdminEventDetail;
