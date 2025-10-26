import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";
import {
  fetchEventById,
  joinEvent,
  leaveEvent,
} from "../store/slices/eventSlice";
import Layout from "../components/common/Layout";
import EventCard from "../components/event/EventCard";
import ParticipantList from "../components/event/ParticipantList";
import AttendanceModal from "../components/event/AttendanceModal";
import RejectionModal from "../components/event/RejectionModal";
import PointsBreakdown from "../components/event/PointsBreakdown";
import { Card } from "../components/common/Card";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Loader } from "../components/common/Loader";
import { Modal } from "../components/common/Modal";
import EventForm from "../components/event/EventForm";
import {
  FiArrowLeft,
  FiEdit,
  FiCheckCircle,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiUsers,
  FiShare2,
} from "react-icons/fi";
import { formatDate, formatDateTime, truncate } from "../config/helpers";
import styles from "./styles/EventDetail.module.css";

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: currentUser } = useAuth();
  const { joinEvent: joinEventSocket } = useSocket();

  // Redux selectors
  const { currentEvent, isLoading, error } = useSelector(
    (state) => state.event
  );

  // Local state
  const [showEditForm, setShowEditForm] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);

  // Fetch event data on mount
  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventById(eventId));
    }
  }, [eventId, dispatch]);

  // Check if current user is participant or organizer
  useEffect(() => {
    if (currentEvent && currentUser) {
      const participantIds = currentEvent.participants?.map((p) => p._id) || [];
      setIsParticipant(participantIds.includes(currentUser._id));
      // IMPORTANT: Only the event organizer can manage attendance
      setIsOrganizer(currentEvent.organizer?._id === currentUser._id);
    }
  }, [currentEvent, currentUser]);

  // Join Socket.io event room
  useEffect(() => {
    if (eventId && isParticipant) {
      joinEventSocket(eventId);
    }
  }, [eventId, isParticipant, joinEventSocket]);

  // Handle join event
  const handleJoinEvent = async () => {
    setIsJoining(true);
    const result = await dispatch(joinEvent(eventId));
    setIsJoining(false);
    if (result.payload) {
      setIsParticipant(true);
      joinEventSocket(eventId);
    }
  };

  // Handle leave event
  const handleLeaveEvent = async () => {
    if (window.confirm("Are you sure you want to leave this event?")) {
      const result = await dispatch(leaveEvent(eventId));
      if (result.payload === eventId) {
        setIsParticipant(false);
        navigate("/events");
      }
    }
  };

  // Handle edit success
  const handleEditSuccess = () => {
    setShowEditForm(false);
    dispatch(fetchEventById(eventId));
  };

  // Handle participant action
  const handleParticipantAction = (participant, action) => {
    setSelectedParticipant(participant);
    if (action === "approve") {
      setShowAttendanceModal(true);
    } else if (action === "reject") {
      setShowRejectionModal(true);
    }
  };

  if (error && !currentEvent) {
    return (
      <Layout>
        <div className={styles.container}>
          <Button
            size="sm"
            variant="ghost"
            icon={FiArrowLeft}
            onClick={() => navigate("/events")}
          >
            Back
          </Button>
          <Card padding="lg" shadow="md" className={styles.errorCard}>
            <div className={styles.errorContent}>
              <div className={styles.errorIcon}>❌</div>
              <h2 className={styles.errorTitle}>Event Not Found</h2>
              <p className={styles.errorText}>
                The event you're looking for doesn't exist or has been removed.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate("/events")}
                icon={FiArrowLeft}
              >
                Back to Events
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isLoading || !currentEvent) {
    return (
      <Layout>
        <div className={styles.container}>
          <Loader size="lg" text="Loading event..." fullScreen={false} />
        </div>
      </Layout>
    );
  }

  const registeredCount = currentEvent.participants?.length || 0;
  const capacity = currentEvent.maxParticipants || 0;
  const isEventFull = registeredCount >= capacity;
  const isClosed =
    currentEvent.status === "Cancelled" || currentEvent.status === "Completed";

  return (
    <Layout>
      <div className={styles.container}>
        {/* Back Button */}
        <Button
          size="sm"
          variant="ghost"
          icon={FiArrowLeft}
          onClick={() => navigate("/events")}
          style={{ marginBottom: "20px" }}
        >
          Back to Events
        </Button>

        {/* Event Hero Section */}
        <div className={styles.heroSection}>
          {/* Hero Image */}
          <div className={styles.heroImage}>
            {currentEvent.image ? (
              <img
                src={currentEvent.image}
                alt={currentEvent.title}
                className={styles.heroImageTag}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/1200x300?text=Event";
                }}
              />
            ) : (
              <div className={styles.heroImagePlaceholder}>
                <span className={styles.placeholderIcon}>📅</span>
              </div>
            )}

            {/* Status Badge */}
            <div className={styles.statusBadge}>
              <Badge
                label={currentEvent.status || "Upcoming"}
                variant={
                  currentEvent.status === "Ongoing"
                    ? "success"
                    : currentEvent.status === "Completed"
                    ? "warning"
                    : currentEvent.status === "Cancelled"
                    ? "error"
                    : "info"
                }
                size="md"
              />
              {isEventFull && (
                <Badge
                  label="Event Full"
                  variant="error"
                  size="md"
                  style={{ marginLeft: "8px" }}
                />
              )}
            </div>
          </div>

          {/* Hero Content */}
          <div className={styles.heroContent}>
            <div className={styles.heroHeader}>
              <div>
                <h1 className={styles.title}>{currentEvent.title}</h1>
                <p className={styles.subtitle}>{currentEvent.description}</p>
              </div>
              <div className={styles.actions}>
                {isOrganizer && (
                  <Button
                    size="sm"
                    variant="outline"
                    icon={FiEdit}
                    onClick={() => setShowEditForm(true)}
                  >
                    Edit
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  icon={FiShare2}
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Event link copied!");
                  }}
                >
                  Share
                </Button>
              </div>
            </div>

            {/* Meta Information */}
            <div className={styles.metaContainer}>
              {currentEvent.category && (
                <Badge
                  label={currentEvent.category}
                  variant="primary"
                  size="sm"
                />
              )}
              <div className={styles.metaItem}>
                <FiCalendar size={14} style={{ color: "#00796B" }} />
                <span>{formatDate(currentEvent.startDate)}</span>
              </div>
              {currentEvent.startTime && (
                <div className={styles.metaItem}>
                  <FiClock size={14} style={{ color: "#00796B" }} />
                  <span>{currentEvent.startTime}</span>
                </div>
              )}
              {currentEvent.location?.city && (
                <div className={styles.metaItem}>
                  <FiMapPin size={14} style={{ color: "#00796B" }} />
                  <span>{currentEvent.location.city}</span>
                </div>
              )}
            </div>

            {/* Join Button */}
            <div className={styles.buttonGroup}>
              {!isParticipant && !isClosed ? (
                <Button
                  size="md"
                  variant="primary"
                  onClick={handleJoinEvent}
                  loading={isJoining}
                  disabled={isJoining || isEventFull}
                  fullWidth
                >
                  {isEventFull ? "Event Full" : "Join Event"}
                </Button>
              ) : isParticipant && !isClosed ? (
                <Button
                  size="md"
                  variant="outline"
                  onClick={handleLeaveEvent}
                  fullWidth
                >
                  Leave Event
                </Button>
              ) : (
                <Button size="md" variant="outline" fullWidth disabled>
                  {currentEvent.status === "Completed"
                    ? "Event Completed"
                    : "Event Cancelled"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Edit Event Modal */}
        <Modal
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          title="Edit Event"
          size="lg"
        >
          <EventForm
            event={currentEvent}
            onClose={() => setShowEditForm(false)}
            onSuccess={handleEditSuccess}
          />
        </Modal>

        {/* Attendance Modal */}
        {selectedParticipant && (
          <AttendanceModal
            isOpen={showAttendanceModal}
            onClose={() => {
              setShowAttendanceModal(false);
              setSelectedParticipant(null);
            }}
            participant={selectedParticipant}
            eventId={eventId}
            onSuccess={() => dispatch(fetchEventById(eventId))}
          />
        )}

        {/* Rejection Modal */}
        {selectedParticipant && (
          <RejectionModal
            isOpen={showRejectionModal}
            onClose={() => {
              setShowRejectionModal(false);
              setSelectedParticipant(null);
            }}
            participant={selectedParticipant}
            eventId={eventId}
            onSuccess={() => dispatch(fetchEventById(eventId))}
          />
        )}

        {/* Main Grid */}
        <div className={styles.gridContainer}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            {/* Event Details Card */}
            <Card padding="lg" shadow="md" className={styles.detailsCard}>
              <h3 className={styles.cardTitle}>Event Details</h3>
              <div className={styles.detailsGrid}>
                {currentEvent.startDate && (
                  <DetailItem
                    label="Start Date"
                    value={formatDateTime(currentEvent.startDate)}
                    icon={FiCalendar}
                  />
                )}
                {currentEvent.endDate && (
                  <DetailItem
                    label="End Date"
                    value={formatDateTime(currentEvent.endDate)}
                    icon={FiCalendar}
                  />
                )}
                {currentEvent.location && (
                  <DetailItem
                    label="Location"
                    value={`${currentEvent.location.city}, ${currentEvent.location.state}`}
                    icon={FiMapPin}
                  />
                )}
                <DetailItem
                  label="Capacity"
                  value={`${registeredCount} / ${capacity}`}
                  icon={FiUsers}
                />
              </div>
            </Card>

            {/* Points Breakdown */}
            {isParticipant && (
              <div style={{ marginTop: "20px" }}>
                <PointsBreakdown
                  eventId={eventId}
                  basePoints={50}
                  hourlyMultiplier={10}
                />
              </div>
            )}

            {/* Organizer Card */}
            {currentEvent.organizer && (
              <Card padding="lg" shadow="md" className={styles.organizerCard}>
                <h3 className={styles.cardTitle}>Organized By</h3>
                <div className={styles.organizerContent}>
                  {currentEvent.organizer.profileImage ? (
                    <img
                      src={currentEvent.organizer.profileImage}
                      alt={currentEvent.organizer.name}
                      className={styles.organizerImage}
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/60?text=User";
                      }}
                    />
                  ) : (
                    <div className={styles.organizerImagePlaceholder}>
                      {currentEvent.organizer.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={styles.organizerInfo}>
                    <p className={styles.organizerName}>
                      {currentEvent.organizer.name}
                    </p>
                    <p className={styles.organizerRole}>Event Organizer</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  onClick={() =>
                    navigate(`/profile/${currentEvent.organizer._id}`)
                  }
                  style={{ marginTop: "12px" }}
                >
                  View Profile
                </Button>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>
            {/* Quick Stats */}
            <Card padding="lg" shadow="md" className={styles.statsCard}>
              <h3 className={styles.cardTitle}>Event Stats</h3>
              <div className={styles.statsGrid}>
                <StatItem
                  icon="👥"
                  label="Registered"
                  value={registeredCount}
                />
                <StatItem icon="📊" label="Capacity" value={capacity} />
                <StatItem
                  icon="⭐"
                  label="Rating"
                  value={(currentEvent.averageRating || 0).toFixed(1)}
                />
                <StatItem
                  icon="⏱️"
                  label="Duration"
                  value={`${currentEvent.duration || 2}h`}
                />
              </div>
            </Card>

            {/* Capacity Progress */}
            <Card padding="lg" shadow="md" className={styles.capacityCard}>
              <h3 className={styles.cardTitle}>Registration</h3>
              <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${Math.min(
                        (registeredCount / capacity) * 100,
                        100
                      )}%`,
                      backgroundColor: isEventFull ? "#ef4444" : "#00796B",
                    }}
                  />
                </div>
                <p className={styles.progressText}>
                  {registeredCount} of {capacity} spots filled (
                  {((registeredCount / capacity) * 100).toFixed(0)}%)
                </p>
                {isEventFull && (
                  <p className={styles.fullText}>
                    This event has reached maximum capacity
                  </p>
                )}
              </div>
            </Card>

            {/* Location Card */}
            {currentEvent.location && (
              <Card padding="lg" shadow="md" className={styles.locationCard}>
                <h3 className={styles.cardTitle}>📍 Location</h3>
                <div className={styles.locationInfo}>
                  {currentEvent.location.address && (
                    <p className={styles.locationText}>
                      {currentEvent.location.address}
                    </p>
                  )}
                  <p className={styles.locationText}>
                    {currentEvent.location.city}, {currentEvent.location.state}{" "}
                    {currentEvent.location.zipCode}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  onClick={() => navigate("/nearby-events")}
                  style={{ marginTop: "12px" }}
                >
                  View on Map
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Participants Section - ONLY FOR ORGANIZER */}
        {isOrganizer && (
          <div className={styles.section}>
            <ParticipantList
              eventId={eventId}
              isEventOrganizer={true}
              compact={false}
            />
          </div>
        )}

        {/* View-Only Participant Count for Regular Users */}
        {!isOrganizer && isParticipant && (
          <Card padding="lg" shadow="md" className={styles.section}>
            <h3 className={styles.cardTitle}>
              Participants ({registeredCount})
            </h3>
            <p className={styles.participantNote}>
              Only event organizers can view the full participant list and
              manage attendance.
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
};

// Detail Item Component
const DetailItem = ({ label, value, icon: Icon }) => (
  <div className={styles.detailItem}>
    {Icon && <Icon size={16} style={{ color: "#00796B" }} />}
    <div>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  </div>
);

// Stat Item Component
const StatItem = ({ icon, label, value }) => (
  <div className={styles.statItem}>
    <span className={styles.statIcon}>{icon}</span>
    <div>
      <p className={styles.statValue}>{value}</p>
      <p className={styles.statLabel}>{label}</p>
    </div>
  </div>
);

export default EventDetail;
