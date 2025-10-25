import React, { useState } from "react";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { FiFilter, FiX, FiCalendar, FiMapPin, FiUsers } from "react-icons/fi";
import { EVENT_CATEGORIES, EVENT_STATUS } from "../../config/constants";
import styles from "./styles/EventFilter.module.css";

const EventFilter = ({
  onFilterChange,
  compact = false,
  showDefaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(showDefaultExpanded);
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    dateRange: "all", // all, today, upcoming, past
    hasAvailability: false,
  });

  // Handle filter change
  const handleFilterChange = (filterKey, value) => {
    const updatedFilters = {
      ...filters,
      [filterKey]: filters[filterKey] === value ? "" : value,
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  // Handle date range change
  const handleDateRangeChange = (range) => {
    const updatedFilters = {
      ...filters,
      dateRange: filters.dateRange === range ? "all" : range,
    };
    setFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  // Check if any filters are active
  const hasActiveFilters =
    filters.category ||
    filters.status ||
    filters.dateRange !== "all" ||
    filters.hasAvailability;

  // Handle clear filters
  const handleClearFilters = () => {
    const emptyFilters = {
      category: "",
      status: "",
      dateRange: "all",
      hasAvailability: false,
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
  };

  // Count active filters
  const countActiveFilters = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.status) count++;
    if (filters.dateRange !== "all") count++;
    if (filters.hasAvailability) count++;
    return count;
  };

  if (compact) {
    return (
      <div className={styles.compactContainer}>
        <Button
          size="sm"
          variant="outline"
          icon={FiFilter}
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? "Hide Filters" : "Show Filters"}
          {hasActiveFilters && (
            <span className={styles.badgeIndicator}>
              {countActiveFilters()}
            </span>
          )}
        </Button>

        {isExpanded && (
          <div className={styles.compactFilters}>
            <FilterContent
              filters={filters}
              onFilterChange={handleFilterChange}
              onDateRangeChange={handleDateRangeChange}
              onClearFilters={handleClearFilters}
              hasActiveFilters={hasActiveFilters}
            />
          </div>
        )}
      </div>
    );
  }

  // Full view
  return (
    <Card padding="lg" shadow="md" className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.title}>
          <FiFilter size={20} style={{ marginRight: "8px" }} />
          Filters
        </h3>
        {hasActiveFilters && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleClearFilters}
            style={{ color: "#ef4444" }}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Filters */}
      <FilterContent
        filters={filters}
        onFilterChange={handleFilterChange}
        onDateRangeChange={handleDateRangeChange}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
      />
    </Card>
  );
};

/**
 * Filter Content Component - Shared between compact and full views
 */
const FilterContent = ({
  filters,
  onFilterChange,
  onDateRangeChange,
  onClearFilters,
  hasActiveFilters,
}) => {
  return (
    <div className={styles.filtersContent}>
      {/* Category Filter */}
      <div className={styles.filterGroup}>
        <h4 className={styles.filterTitle}>Category</h4>
        <div className={styles.filterChips}>
          {EVENT_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => onFilterChange("category", category)}
              className={`${styles.chip} ${
                filters.category === category ? styles.chipActive : ""
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div className={styles.filterGroup}>
        <h4 className={styles.filterTitle}>Event Status</h4>
        <div className={styles.filterChips}>
          {Object.values(EVENT_STATUS).map((status) => (
            <button
              key={status}
              onClick={() => onFilterChange("status", status)}
              className={`${styles.chip} ${
                filters.status === status ? styles.chipActive : ""
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Date Range Filter */}
      <div className={styles.filterGroup}>
        <h4 className={styles.filterTitle}>
          <FiCalendar
            size={16}
            style={{ display: "inline", marginRight: "6px" }}
          />
          Date Range
        </h4>
        <div className={styles.filterChips}>
          <button
            onClick={() => onDateRangeChange("today")}
            className={`${styles.chip} ${
              filters.dateRange === "today" ? styles.chipActive : ""
            }`}
          >
            Today
          </button>
          <button
            onClick={() => onDateRangeChange("upcoming")}
            className={`${styles.chip} ${
              filters.dateRange === "upcoming" ? styles.chipActive : ""
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => onDateRangeChange("past")}
            className={`${styles.chip} ${
              filters.dateRange === "past" ? styles.chipActive : ""
            }`}
          >
            Past
          </button>
        </div>
      </div>

      {/* Availability Filter */}
      <div className={styles.filterGroup}>
        <h4 className={styles.filterTitle}>
          <FiUsers
            size={16}
            style={{ display: "inline", marginRight: "6px" }}
          />
          Availability
        </h4>
        <button
          onClick={() => onFilterChange("hasAvailability", true)}
          className={`${styles.chip} ${
            filters.hasAvailability ? styles.chipActive : ""
          }`}
        >
          Available Slots Only
        </button>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className={styles.activeFiltersDisplay}>
          <p className={styles.activeFiltersLabel}>Active Filters:</p>
          <div className={styles.activeBadges}>
            {filters.category && (
              <Badge
                label={filters.category}
                variant="primary"
                size="sm"
                onRemove={() => onFilterChange("category", filters.category)}
              />
            )}
            {filters.status && (
              <Badge
                label={filters.status}
                variant="primary"
                size="sm"
                onRemove={() => onFilterChange("status", filters.status)}
              />
            )}
            {filters.dateRange !== "all" && (
              <Badge
                label={`${
                  filters.dateRange.charAt(0).toUpperCase() +
                  filters.dateRange.slice(1)
                } Events`}
                variant="primary"
                size="sm"
                onRemove={() => onDateRangeChange(filters.dateRange)}
              />
            )}
            {filters.hasAvailability && (
              <Badge
                label="Has Availability"
                variant="success"
                size="sm"
                onRemove={() => onFilterChange("hasAvailability", true)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EventFilter;
