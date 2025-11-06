import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "../common/Card";
import { fetchAllActivities } from "../../store/slices/activitySlice";
import styles from "./styles/ActivityFilter.module.css";
import PropTypes from 'prop-types';

const ActivityFilter = ({
  onFilterChange,
  initialFilters = {},
  isGlobal = true,
}) => {
  const dispatch = useDispatch();
  const { status } = useSelector((state) => state.activities);
  const isLoading = status === "loading";

  // Initialize state with props or defaults
  const [sortBy, setSortBy] = useState(initialFilters.sortBy || "recent");
  const [type, setType] = useState(initialFilters.type || "all");
  const [dateRange, setDateRange] = useState(initialFilters.dateRange || "30");
  const [customStartDate, setCustomStartDate] = useState(
    initialFilters.customStartDate || ""
  );
  const [customEndDate, setCustomEndDate] = useState(
    initialFilters.customEndDate || ""
  );

  // Effect to apply initial filters
  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      dispatchFilters(initialFilters);
    }
  }, []);

  const dispatchFilters = (filters) => {
    const filterPayload = {
      sortBy: filters.sortBy,
      type: filters.type,
      dateRange: filters.dateRange,
      ...(filters.dateRange === "custom" && {
        customStartDate: filters.customStartDate,
        customEndDate: filters.customEndDate,
      }),
    };

    // Notify parent component
    onFilterChange(filterPayload);

    // If global feed, fetch activities directly
    if (isGlobal) {
      dispatch(fetchAllActivities({ page: 1, filters: filterPayload }));
    }
  };

  const handleSortChange = (e) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    dispatchFilters({ sortBy: newSortBy, type, dateRange });
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    setType(newType);
    dispatchFilters({ sortBy, type: newType, dateRange });
  };

  const handleDateRangeChange = (e) => {
    const newRange = e.target.value;
    setDateRange(newRange);
    if (newRange !== "custom") {
      dispatchFilters({ sortBy, type, dateRange: newRange });
    }
  };

  const handleCustomDateChange = (isStart, date) => {
    if (isStart) {
      setCustomStartDate(date);
    } else {
      setCustomEndDate(date);
    }

    if (customStartDate && customEndDate) {
      onFilterChange({
        sortBy,
        type,
        dateRange: "custom",
        customStartDate: customStartDate,
        customEndDate: customEndDate,
      });
    }
  };

  return (
    <Card padding="md" shadow="sm" className={styles.container}>
      <div className={styles.filterGroup}>
        <label htmlFor="sort-by" className={styles.label}>
          Sort By
        </label>
        <select
          id="sort-by"
          value={sortBy}
          onChange={handleSortChange}
          className={styles.select}
          disabled={isLoading}
        >
          <option value="recent">Most Recent</option>
          <option value="oldest">Oldest First</option>
          <option value="points">Most Points Earned</option>
        </select>
      </div>
      <div className={styles.filterGroup}>
        <label htmlFor="type" className={styles.label}>
          Type
        </label>
        <select
          id="type"
          value={type}
          onChange={handleTypeChange}
          className={styles.select}
          disabled={isLoading}
        >
          <option value="all">All Activities</option>
          <option value="event_joined">Events Joined</option>
          <option value="event_created">Events Created</option>
          <option value="community_joined">Communities Joined</option>
          <option value="community_created">Communities Created</option>
          <option value="event_attended">Attended Events</option>
          <option value="rating_created">Ratings Created</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="date-range" className={styles.label}>
          Date Range
        </label>
        <select
          id="date-range"
          value={dateRange}
          onChange={handleDateRangeChange}
          className={styles.select}
          disabled={isLoading}
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="custom">Custom range</option>
          <option value="all">All time</option>
        </select>

        {dateRange === "custom" && (
          <div className={styles.customDateRange}>
            <div className={styles.dateInput}>
              <label htmlFor="start-date">Start Date</label>
              <input
                type="date"
                id="start-date"
                value={customStartDate}
                onChange={(e) => handleCustomDateChange(true, e.target.value)}
                disabled={isLoading}
                max={customEndDate || undefined}
              />
            </div>
            <div className={styles.dateInput}>
              <label htmlFor="end-date">End Date</label>
              <input
                type="date"
                id="end-date"
                value={customEndDate}
                onChange={(e) => handleCustomDateChange(false, e.target.value)}
                disabled={isLoading}
                min={customStartDate || undefined}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// PropTypes
//import PropTypes from "prop-types";

ActivityFilter.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  initialFilters: PropTypes.shape({
    sortBy: PropTypes.string,
    type: PropTypes.string,
    dateRange: PropTypes.string,
    customStartDate: PropTypes.string,
    customEndDate: PropTypes.string,
  }),
  isGlobal: PropTypes.bool,
};

export default ActivityFilter;
