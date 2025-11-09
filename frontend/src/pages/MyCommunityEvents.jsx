import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { usePagination } from "../hooks/usePagination";
import { eventAPI } from "../api/services";
import Layout from "../components/common/Layout";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { Loader } from "../components/common/Loader";
import { Modal } from "../components/common/Modal";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiCalendar,
  FiUsers,
  FiArrowRight,
  FiFilter,
  FiArrowLeft,
} from "react-icons/fi";
import styles from "./styles/MyCommunityEvents.module.css";

const MyCommunityEvents = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");

  const { page, totalPages, goToPage } = usePagination(0, 1, 10);

  // Fetch created events
  useEffect(() => {
    fetchEvents();
  }, [page, statusFilter]);

  const fetchEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const filters = statusFilter ? { status: statusFilter } : {};
      const response = await eventAPI.getMyCreatedEvents(page, filters);

      if (response.data?.success) {
        setEvents(response.data.data || []);
      } else {
        setError("Failed to load events");
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err.message || "Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      const response = await eventAPI.delete(selectedEvent._id);

      if (response.data?.success) {
        setShowDeleteModal(false);
        setSelectedEvent(null);
        fetchEvents();
      } else {
        setError("Failed to delete event");
      }
    } catch (err) {
      console.error("Error deleting event:", err);
      setError("Failed to delete event");
    }
  };

  // Check if user is community manager
  if (!user || user.role !== "moderator") {
    return (
      <Layout>
        <div className={styles.container}>
          <Card padding="lg" shadow="md">
            <div style={{ textAlign: "center", padding: "40px" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
              <h3 style={{ marginBottom: "8px" }}>Access Denied</h3>
              <p style={{ marginBottom: "24px", color: "#666" }}>
                Only community managers can access this page.
              </p>
              <Button variant="primary" onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

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
              onClick={() => navigate("/dashboard")}
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
            onClick={() => navigate("/events/create")}
          >
            Create New Event
          </Button>
        </div>

        {/* Filter */}
        <Card padding="md" shadow="sm" className={styles.filterCard}>
          <div className={styles.filterGroup}>
            <FiFilter size={16} style={{ marginRight: "8px" }} />
            <label>Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                goToPage(1);
              }}
              className={styles.select}
            >
              <option value="">All Statuses</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Ongoing">Ongoing</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </Card>

        {/* Content */}
        {isLoading ? (
          <Loader size="md" text="Loading your events..." />
        ) : error ? (
          <Card padding="lg" shadow="md">
            <div style={{ color: "#ef4444", textAlign: "center" }}>
              <p style={{ marginBottom: "16px" }}>⚠️ {error}</p>
              <Button size="sm" variant="primary" onClick={fetchEvents}>
                Try Again
              </Button>
            </div>
          </Card>
        ) : events.length === 0 ? (
          <Card padding="lg" shadow="md">
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📭</div>
              <h3 className={styles.emptyTitle}>No Events Created</h3>
              <p className={styles.emptyText}>
                Start by creating your first event
              </p>
              <Button
                size="md"
                variant="primary"
                onClick={() => navigate("/events/create")}
                icon={FiPlus}
              >
                Create Event
              </Button>
            </div>
          </Card>
        ) : (
          <>
            <div className={styles.eventsList}>
              {events.map((event) => (
                <EventManagementCard
                  key={event._id}
                  event={event}
                  onEdit={() => navigate(`/events/${event._id}/edit`)}
                  onDelete={() => {
                    setSelectedEvent(event);
                    setShowDeleteModal(true);
                  }}
                  onView={() => navigate(`/events/${event._id}`)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className={styles.pageInfo}>
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Delete Event"
        >
          <div style={{ padding: "20px" }}>
            <p>
              Are you sure you want to delete{" "}
              <strong>{selectedEvent?.title}</strong>?
            </p>
            <p
              style={{ color: "#666", fontSize: "14px", marginBottom: "20px" }}
            >
              This action cannot be undone.
            </p>
            <div className={styles.modalActions}>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button variant="error" onClick={handleDeleteEvent}>
                Delete Event
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

// Event Management Card Component
const EventManagementCard = ({ event, onEdit, onDelete, onView }) => {
  const statusColors = {
    Upcoming: "#3b82f6",
    Ongoing: "#10b981",
    Completed: "#6b7280",
    Cancelled: "#ef4444",
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card padding="md" shadow="sm" hover className={styles.eventCard}>
      <div className={styles.eventHeader}>
        <div className={styles.eventInfo}>
          <h3 className={styles.eventTitle}>{event.title}</h3>
          <Badge
            label={event.status}
            variant="primary"
            size="sm"
            style={{ backgroundColor: statusColors[event.status] }}
          />
        </div>
        <div className={styles.eventDate}>
          <FiCalendar size={16} />
          <span>{formatDate(event.startDate)}</span>
        </div>
      </div>

      <p className={styles.eventDescription}>{event.description}</p>

      <div className={styles.eventMeta}>
        <div className={styles.metaItem}>
          <FiUsers size={16} />
          <span>{event.participants?.length || 0} participants</span>
        </div>
        {event.capacity && (
          <div className={styles.metaItem}>
            <span>
              Capacity: {event.capacity.registered}/
              {event.capacity.total || "∞"}
            </span>
          </div>
        )}
        {event.community && (
          <div className={styles.metaItem}>
            <span>{event.community.name}</span>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <Button size="sm" variant="ghost" onClick={onView} icon={FiArrowRight}>
          View
        </Button>
        <Button size="sm" variant="outline" onClick={onEdit} icon={FiEdit}>
          Edit
        </Button>
        <Button size="sm" variant="error" onClick={onDelete} icon={FiTrash2}>
          Delete
        </Button>
      </div>
    </Card>
  );
};

export default MyCommunityEvents;
