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
import styles from "./styles/Events.module.css";

const Events = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth();

  // Redux selectors
  const { events, isLoading, error } = useSelector((state) => state.event);

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid | list

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
  } = usePagination(events.pagination?.total || 0, 1, 10);

  // Fetch events on mount and when filters change
  useEffect(() => {
    const filters = {
      page,
      limit,
      search: searchQuery || undefined,
    };
    dispatch(fetchEvents(filters));
    dispatch(setFilters(filters));
  }, [page, searchQuery, dispatch]);

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    goToPage(1);
  };

  // Handle event creation success
  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    goToPage(1);
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
          {isAuthenticated && user?.role === "community_manager" && (
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
              onClick={() => navigate("/become-community-manager")}
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
                onFilterChange={(filters) => {
                  dispatch(setFilters(filters));
                  goToPage(1);
                }}
                compact={false}
                showDefaultExpanded={true}
              />
            </div>
          )}
        </Card>

        {/* Results Info */}
        {events.data.length > 0 && (
          <div className={styles.resultsInfo}>
            <p className={styles.resultsText}>
              Found {events.pagination?.total || 0} events
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
          // Error State
          <Card padding="lg" shadow="md" className={styles.errorCard}>
            <div className={styles.errorContent}>
              <div className={styles.errorIcon}>⚠️</div>
              <p className={styles.errorText}>{error}</p>
              <Button
                size="sm"
                variant="primary"
                onClick={() => dispatch(fetchEvents())}
              >
                Try Again
              </Button>
            </div>
          </Card>
        ) : events.data.length > 0 ? (
          // Events Display
          <>
            {viewMode === "grid" ? (
              <div className={styles.eventsGrid}>
                {events.data.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    onView={handleEventSelect}
                    onJoin={handleEventSelect}
                  />
                ))}
              </div>
            ) : (
              <EventList
                events={events.data}
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
          // Empty State
          <Card padding="lg" shadow="md" className={styles.emptyState}>
            <div className={styles.emptyContent}>
              <div className={styles.emptyIcon}>📅</div>
              <h3 className={styles.emptyTitle}>No Events Found</h3>
              <p className={styles.emptyText}>
                {searchQuery
                  ? "Try adjusting your search or filters"
                  : "No volunteer events available right now. Check back soon!"}
              </p>
              {isAuthenticated && !searchQuery && (
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
