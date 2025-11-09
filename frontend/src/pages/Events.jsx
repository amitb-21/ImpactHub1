import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import { usePagination } from "../hooks/usePagination";
import { fetchEvents, setFilters } from "../store/slices/eventSlice";
import Layout from "../components/common/Layout";
import EventCard from "../components/event/EventCard";
import EventList from "../components/event/EventList";
import EventFilter from "../components/event/EventFilter";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { Loader } from "../components/common/Loader";
import { Modal } from "../components/common/Modal";
import EventForm from "../components/event/EventForm";
import { FiSearch, FiFilter, FiPlus, FiCalendar } from "react-icons/fi";
import { EVENT_CATEGORIES } from "../config/constants";
import { toast } from "react-toastify";
import styles from "./styles/Events.module.css";

const Events = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth();

  // Redux selectors - ✅ Add default values to prevent undefined errors
  const {
    events: eventsData = { data: [], pagination: null },
    isLoading,
    error,
  } = useSelector(
    (state) =>
      state.event || {
        events: { data: [], pagination: null },
        isLoading: false,
        error: null,
      }
  );

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [appliedFilters, setAppliedFilters] = useState({});

  // ✅ Safe data extraction with fallback
  const events = eventsData?.data || [];
  const pagination = eventsData?.pagination || { total: 0 };

  // Pagination hook
  const {
    page,
    limit,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev,
  } = usePagination(pagination?.total || 0, 1, 10);

  // ✅ FIXED: Fetch events with filters included
  useEffect(() => {
    const filters = {
      page,
      limit,
      search: searchQuery || undefined,
      ...appliedFilters,
    };
    dispatch(fetchEvents(filters));
    dispatch(setFilters(filters));
  }, [page, searchQuery, appliedFilters, dispatch, limit]);

  // ✅ Refresh events when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const filters = {
          page,
          limit,
          search: searchQuery || undefined,
          ...appliedFilters,
        };
        console.log(
          "Refetching events on visibility change with filters:",
          filters
        );
        dispatch(fetchEvents(filters));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [page, limit, searchQuery, appliedFilters, dispatch]);

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    goToPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (filters) => {
    setAppliedFilters(filters);
    dispatch(setFilters(filters));
    goToPage(1);
  };

  // ✅ FIXED: Handle event creation success
  const handleCreateSuccess = (createdEvent) => {
    console.log("✅ Event creation successful:", createdEvent);

    setShowCreateForm(false);

    // Clear search and filters
    setSearchQuery("");
    setAppliedFilters({});

    // Reset to page 1
    goToPage(1);

    // Refetch events after small delay
    setTimeout(() => {
      const filters = {
        page: 1,
        limit,
        search: undefined,
      };

      console.log("Refetching events after creation:", filters);
      dispatch(fetchEvents(filters));
    }, 500);

    // Show success notification
    toast.success("Event created successfully! 🎉");
  };

  // Handle event selection
  const handleEventSelect = (event) => {
    navigate(`/events/${event._id}`);
  };

  return (
    <Layout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Volunteer Events</h1>
            <p className={styles.subtitle}>
              Find and join meaningful volunteer opportunities in your area
            </p>
          </div>

          {/* Conditional Rendering for Community Manager */}
          {isAuthenticated && user?.role === "moderator" && (
            <Button
              size="md"
              variant="primary"
              icon={FiPlus}
              onClick={() => setShowCreateForm(true)}
            >
              Create Event
            </Button>
          )}

          {/* Application Link for Regular Users */}
          {isAuthenticated && user?.role === "user" && (
            <Button
              size="md"
              variant="outline"
              onClick={() => navigate("/apply-community-manager")}
            >
              Apply to Become a Community Manager
            </Button>
          )}
        </div>

        {/* Create Event Modal */}
        <Modal
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          title="Create Event"
          size="lg"
        >
          <EventForm
            onClose={() => setShowCreateForm(false)}
            onSuccess={handleCreateSuccess}
          />
        </Modal>

        {/* Search & Filters Section */}
        <Card padding="lg" shadow="md" className={styles.searchCard}>
          {/* Search Box */}
          <div className={styles.searchWrapper}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search events by name or location..."
              value={searchQuery}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>

          {/* Controls */}
          <div className={styles.controls}>
            <Button
              size="sm"
              variant="outline"
              icon={FiFilter}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>

            {/* View Mode Toggle */}
            <div className={styles.viewToggle}>
              <button
                onClick={() => setViewMode("grid")}
                className={`${styles.viewBtn} ${
                  viewMode === "grid" ? styles.viewBtnActive : ""
                }`}
                title="Grid view"
              >
                ⊞
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`${styles.viewBtn} ${
                  viewMode === "list" ? styles.viewBtnActive : ""
                }`}
                title="List view"
              >
                ≡
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className={styles.filtersPanel}>
              <EventFilter
                onFilterChange={handleFilterChange}
                compact={false}
                showDefaultExpanded={true}
              />
            </div>
          )}
        </Card>

        {/* Results Info */}
        {events && events.length > 0 && (
          <div className={styles.resultsInfo}>
            <p className={styles.resultsText}>
              Found {pagination?.total || 0} events
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Loader size="md" text="Loading events..." />
          </div>
        ) : error ? (
          // ✅ FIXED: Error State with proper error handling
          <Card padding="lg" shadow="md" className={styles.errorCard}>
            <div className={styles.errorContent}>
              <div className={styles.errorIcon}>⚠️</div>
              <p className={styles.errorText}>{error}</p>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  const filters = {
                    page,
                    limit,
                    search: searchQuery || undefined,
                    ...appliedFilters,
                  };
                  dispatch(fetchEvents(filters));
                }}
              >
                Try Again
              </Button>
            </div>
          </Card>
        ) : events && events.length > 0 ? (
          // ✅ FIXED: Events Display with safe check
          <>
            {viewMode === "grid" ? (
              <div className={styles.eventsGrid}>
                {events.map((event) => (
                  <EventCard
                    key={event?._id}
                    event={event}
                    onView={handleEventSelect}
                    onJoin={handleEventSelect}
                  />
                ))}
              </div>
            ) : (
              <EventList
                events={events}
                onEventSelect={handleEventSelect}
                onJoin={handleEventSelect}
              />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={prevPage}
                  disabled={!canGoPrev}
                >
                  Previous
                </Button>

                <div className={styles.pageInfo}>
                  Page {page} of {totalPages}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={nextPage}
                  disabled={!canGoNext}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          // ✅ FIXED: Empty State with safe check
          <Card padding="lg" shadow="md" className={styles.emptyState}>
            <div className={styles.emptyContent}>
              <div className={styles.emptyIcon}>📅</div>
              <h3 className={styles.emptyTitle}>No Events Found</h3>
              <p className={styles.emptyText}>
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : "No volunteer events available right now. Check back soon!"}
              </p>
              {isAuthenticated &&
                !searchQuery &&
                user?.role === "moderator" && (
                  <Button
                    size="md"
                    variant="primary"
                    onClick={() => setShowCreateForm(true)}
                    icon={FiPlus}
                  >
                    Create First Event
                  </Button>
                )}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Events;
