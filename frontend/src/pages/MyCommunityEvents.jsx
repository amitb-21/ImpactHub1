import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import { usePagination } from "../hooks/usePagination";
import { eventAPI } from "../api/services";
import Layout from "../components/common/Layout";
import EventCard from "../components/event/EventCard";
import EventList from "../components/event/EventList";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { Loader } from "../components/common/Loader";
import { Modal } from "../components/common/Modal";
import EventForm from "../components/event/EventForm";
import { FiArrowLeft, FiPlus, FiFilter, FiSearch } from "react-icons/fi";
import { toast } from "react-toastify";
import styles from "./styles/MyCommunityEvents.module.css";

const MyCommunityEvents = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  // Local state
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [statusFilter, setStatusFilter] = useState("all");
  const [totalEvents, setTotalEvents] = useState(0);

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
  } = usePagination(totalEvents, 1, 10);

  // ✅ FIXED: Fetch user's created events using direct API call
  const fetchMyEvents = async () => {
    if (!currentUser?._id) return;

    setIsLoading(true);
    setError(null);

    try {
      console.log("📥 Fetching events created by:", currentUser._id);

      // ✅ Use the getMyCreatedEvents API endpoint
      const response = await eventAPI.getMyCreatedEvents(page, {
        search: searchQuery || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
      });

      console.log("✅ Received events:", response.data);

      if (response.data.data) {
        setEvents(response.data.data);
        setTotalEvents(response.data.pagination?.total || 0);
      } else {
        setEvents([]);
        setTotalEvents(0);
      }
    } catch (err) {
      console.error("❌ Error fetching my events:", err);
      setError(err.response?.data?.message || "Failed to load your events");
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch events on mount and when filters change
  useEffect(() => {
    fetchMyEvents();
  }, [page, searchQuery, statusFilter, currentUser?._id]);

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    goToPage(1);
  };

  // Handle status filter
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    goToPage(1);
  };

  // Handle event creation success
  const handleCreateSuccess = (createdEvent) => {
    console.log("✅ Event created successfully:", createdEvent);
    setShowCreateForm(false);

    toast.success("Event created successfully! 🎉");

    // Reset filters and refetch
    setSearchQuery("");
    setStatusFilter("all");
    goToPage(1);

    // Refetch events after small delay
    setTimeout(() => {
      fetchMyEvents();
    }, 500);
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
            <Button
              size="sm"
              variant="ghost"
              icon={FiArrowLeft}
              onClick={() => navigate("/events")}
              style={{ marginBottom: "16px" }}
            >
              Back
            </Button>
            <h1 className={styles.title}>My Events</h1>
            <p className={styles.subtitle}>Manage all events you've created</p>
          </div>

          <Button
            size="md"
            variant="primary"
            icon={FiPlus}
            onClick={() => setShowCreateForm(true)}
          >
            Create New Event
          </Button>
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

        {/* Search & Filter Section */}
        <Card padding="lg" shadow="md" className={styles.controlsCard}>
          {/* Search Box */}
          <div className={styles.searchWrapper}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search your events..."
              value={searchQuery}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>

          {/* Status Filter */}
          <div className={styles.filterSection}>
            <label className={styles.filterLabel}>
              <FiFilter size={16} />
              Filter by Status:
            </label>
            <div className={styles.filterChips}>
              <button
                onClick={() => handleStatusFilter("all")}
                className={`${styles.chip} ${
                  statusFilter === "all" ? styles.chipActive : ""
                }`}
              >
                All Events
              </button>
              <button
                onClick={() => handleStatusFilter("Upcoming")}
                className={`${styles.chip} ${
                  statusFilter === "Upcoming" ? styles.chipActive : ""
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => handleStatusFilter("Ongoing")}
                className={`${styles.chip} ${
                  statusFilter === "Ongoing" ? styles.chipActive : ""
                }`}
              >
                Ongoing
              </button>
              <button
                onClick={() => handleStatusFilter("Completed")}
                className={`${styles.chip} ${
                  statusFilter === "Completed" ? styles.chipActive : ""
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => handleStatusFilter("Cancelled")}
                className={`${styles.chip} ${
                  statusFilter === "Cancelled" ? styles.chipActive : ""
                }`}
              >
                Cancelled
              </button>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className={styles.viewToggle}>
            <button
              onClick={() => setViewMode("grid")}
              className={`${styles.viewBtn} ${
                viewMode === "grid" ? styles.viewBtnActive : ""
              }`}
              title="Grid view"
            >
              ⊞ Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`${styles.viewBtn} ${
                viewMode === "list" ? styles.viewBtnActive : ""
              }`}
              title="List view"
            >
              ≡ List
            </button>
          </div>
        </Card>

        {/* Results Info */}
        {events.length > 0 && (
          <div className={styles.resultsInfo}>
            <p className={styles.resultsText}>
              Found {totalEvents} events
              {searchQuery && ` matching "${searchQuery}"`}
              {statusFilter !== "all" && ` (${statusFilter})`}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Loader size="md" text="Loading your events..." />
          </div>
        ) : error ? (
          // Error State
          <Card padding="lg" shadow="md" className={styles.errorCard}>
            <div className={styles.errorContent}>
              <div className={styles.errorIcon}>⚠️</div>
              <p className={styles.errorText}>{error}</p>
              <Button size="sm" variant="primary" onClick={fetchMyEvents}>
                Try Again
              </Button>
            </div>
          </Card>
        ) : events.length > 0 ? (
          // Events Display
          <>
            {viewMode === "grid" ? (
              <div className={styles.eventsGrid}>
                {events.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    onView={handleEventSelect}
                  />
                ))}
              </div>
            ) : (
              <EventList events={events} onEventSelect={handleEventSelect} />
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
              <h3 className={styles.emptyTitle}>No Events Created</h3>
              <p className={styles.emptyText}>
                {searchQuery
                  ? "No events match your search"
                  : statusFilter !== "all"
                  ? `No ${statusFilter.toLowerCase()} events`
                  : "You haven't created any events yet. Get started by creating your first event!"}
              </p>
              <Button
                size="md"
                variant="primary"
                onClick={() => setShowCreateForm(true)}
                icon={FiPlus}
                style={{ marginTop: "16px" }}
              >
                Create First Event
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default MyCommunityEvents;
