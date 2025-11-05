import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getDashboardStats } from "../../store/slices/adminSlice";
import { Card } from "../../components/common/Card";
import { Loader } from "../../components/common/Loader";
import AdminResourceStats from "../../components/admin/AdminResourceStats";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiBriefcase,
  FiCheckSquare,
  FiCalendar,
  FiTrendingUp,
} from "react-icons/fi";
import { formatPoints } from "../../config/formatters";

// Basic inline styles
const styles = {
  header: { marginBottom: "24px" },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    margin: "0 0 8px 0",
    color: "#212121",
  },
  subtitle: { fontSize: "16px", color: "#666", margin: 0 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
  },
  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },
  statContent: { flex: 1 },
  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#212121",
    margin: 0,
  },
  statLabel: { fontSize: "13px", color: "#666", margin: 0 },
  listCard: { marginTop: "20px" },
  listTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#212121",
    margin: "0 0 16px 0",
  },
  list: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #f0f0f0",
    fontSize: "13px",
  },
  listItemName: { fontWeight: "600", color: "#00796B", textDecoration: "none" },
  listItemValue: { fontWeight: "700", color: "#212121" },
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { dashboard, isLoading } = useSelector((state) => state.admin);
  const stats = dashboard?.stats || {};

  useEffect(() => {
    dispatch(getDashboardStats());
  }, [dispatch]);

  if (isLoading && !dashboard) {
    return <Loader size="lg" text="Loading dashboard..." />;
  }

  const kpiStats = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: FiUsers,
      color: "#3b82f6",
      bgColor: "#dbeafe",
    },
    {
      label: "Total Communities",
      value: stats.totalCommunities,
      icon: FiBriefcase,
      color: "#8b5cf6",
      bgColor: "#ede9fe",
    },
    {
      label: "Total Events",
      value: stats.totalEvents,
      icon: FiCalendar,
      color: "#10b981",
      bgColor: "#d1fae5",
    },
    {
      label: "Pending Verifications",
      value: stats.pendingVerifications,
      icon: FiCheckSquare,
      color: "#f59e0b",
      bgColor: "#fef3c7",
    },
    {
      label: "Total Volunteer Hours",
      value: stats.totalVolunteerHours || 0,
      icon: FiTrendingUp,
      color: "#00796B",
      bgColor: "#e0f2f1",
    },
    {
      label: "Total Points Distributed",
      value: formatPoints(stats.totalPointsDistributed || 0),
      icon: FiTrendingUp,
      color: "#ef4444",
      bgColor: "#fee2e2",
    },
  ];

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Admin Dashboard</h1>
        <p style={styles.subtitle}>
          Welcome, Admin! Here's a summary of the platform.
        </p>
      </div>

      <div style={styles.grid}>
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

      <div
        style={{
          ...styles.grid,
          gridTemplateColumns: "1fr 1fr",
          marginTop: "20px",
        }}
      >
        <Card padding="lg" shadow="md" style={styles.listCard}>
          <h3 style={styles.listTitle}>Top 5 Volunteers</h3>
          <ul style={styles.list}>
            {dashboard?.topVolunteers?.map((user) => (
              <li key={user._id} style={styles.listItem}>
                <Link to={`/profile/${user._id}`} style={styles.listItemName}>
                  {user.name}
                </Link>
                <span style={styles.listItemValue}>
                  {formatPoints(user.points)} pts
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card padding="lg" shadow="md" style={styles.listCard}>
          <h3 style={styles.listTitle}>Top 5 Communities</h3>
          <ul style={styles.list}>
            {dashboard?.topCommunities?.map((comm) => (
              <li key={comm._id} style={styles.listItem}>
                <Link
                  to={`/communities/${comm._id}`}
                  style={styles.listItemName}
                >
                  {comm.name}
                </Link>
                <span style={styles.listItemValue}>
                  {formatPoints(comm.totalPoints)} pts
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Include the Resource Stats Component */}
      <AdminResourceStats />
    </div>
  );
};

export default AdminDashboard;
