import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getResourceStats } from "../../store/slices/adminSlice";
import { Card } from "../../components/common/Card";
import { Loader } from "../../components/common/Loader";
import { Link } from "react-router-dom";

// Basic styles for this component
const styles = {
  card: { marginBottom: "20px", marginTop: "20px" },
  title: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#212121",
    margin: "0 0 16px 0",
    borderBottom: "1px solid #e0e0e0",
    paddingBottom: "8px",
  },
  grid: {
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
  tableContainer: { maxHeight: "300px", overflowY: "auto" },
};

const AdminResourceStats = () => {
  const dispatch = useDispatch();
  const { resourceStats, isLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    // Only fetch if stats aren't already loaded
    if (!resourceStats) {
      dispatch(getResourceStats());
    }
  }, [dispatch, resourceStats]);

  if (isLoading && !resourceStats) {
    return (
      <Card padding="lg">
        <Loader size="sm" text="Loading resource stats..." />
      </Card>
    );
  }

  if (!resourceStats) {
    return (
      <Card padding="lg">
        <p>No resource stats available.</p>
      </Card>
    );
  }

  const {
    totalResources,
    pendingResources,
    totalViews,
    byCategory = [],
    byType = [],
    topResources = [],
  } = resourceStats;

  return (
    <Card padding="lg" shadow="md" style={styles.card}>
      <h3 style={styles.title}>Resource Statistics</h3>

      <div style={styles.grid}>
        <div style={styles.statBox}>
          <span style={styles.statValue}>{totalResources}</span>
          <span style={styles.statLabel}>Total Published</span>
        </div>
        <div style={styles.statBox}>
          <span
            style={{
              ...styles.statValue,
              color: pendingResources > 0 ? "#f59e0b" : "#00796B"
            }}
          >
            {pendingResources}
          </span>
          <span style={styles.statLabel}>Pending Approval</span>
        </div>
        <div style={styles.statBox}>
          <span style={styles.statValue}>{totalViews}</span>
          <span style={styles.statLabel}>Total Views</span>
        </div>
      </div>

      <div
        style={{
          ...styles.grid,
          gridTemplateColumns: "1fr 1fr",
          marginTop: "20px",
        }}
      >
        <div>
          <h4 style={{ ...styles.title, fontSize: "16px" }}>By Category</h4>
          <ul style={styles.list}>
            {byCategory.map((cat) => (
              <li key={cat._id} style={styles.listItem}>
                <span style={styles.listItemName}>{cat._id}</span>
                <span style={styles.listItemValue}>{cat.count}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 style={{ ...styles.title, fontSize: "16px" }}>By Type</h4>
          <ul style={styles.list}>
            {byType.map((type) => (
              <li key={type._id} style={styles.listItem}>
                <span style={styles.listItemName}>{type._id}</span>
                <span style={styles.listItemValue}>{type.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <h4 style={{ ...styles.title, fontSize: "16px", marginTop: "20px" }}>
        Top 10 Viewed
      </h4>
      <div style={styles.tableContainer}>
        <ul style={styles.list}>
          {topResources.map((res) => (
            <li key={res._id} style={styles.listItem}>
              <Link to={`/resources/${res._id}`} style={styles.listItemName}>
                {res.title}
              </Link>
              <span style={styles.listItemValue}>{res.views} views</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
};

export default AdminResourceStats;
