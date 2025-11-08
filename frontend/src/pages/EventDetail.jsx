/* frontend/src/pages/EventDetail.jsx */
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
import { fetchCommunityGallery } from "../store/slices/photoSlice"; // <-- IMPORTED
// --- (1) IMPORTS ADDED ---
import { fetchEntityRatings } from "../store/slices/ratingSlice";
import { getParticipationDetails } from "../store/slices/participationSlice"; // <-- Corrected import
import RatingStats from "../components/rating/RatingStats";
import RatingList from "../components/rating/RatingList";
import RatingForm from "../components/rating/RatingForm";
// --- (End 1) ---
import Layout from "../components/common/Layout";
import ParticipantList from "../components/event/ParticipantList";
import AttendanceModal from "../components/event/AttendanceModal";
import RejectionModal from "../components/event/RejectionModal";
import PointsBreakdown from "../components/event/PointsBreakdown";
import CalendarShare from "../components/event/CalendarShare"; // <-- IMPORTED
import PhotoUploadModal from "../components/photo/PhotoUploadModal"; // <-- IMPORTED
import CommunityGallery from "../components/community/CommunityGallery"; // <-- IMPORTED
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
  FiUpload, // <-- IMPORTED
} from "react-icons/fi";
import { formatDate, formatDateTime, truncate } from "../config/helpers";
import styles from "./styles/EventDetail.module.css";

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: currentUser, isAuthenticated, isModerator } = useAuth(); // <-- Get isAuthenticated
  const { joinEvent: joinEventSocket } = useSocket();

  // Redux selectors
  const { currentEvent, isLoading, error } = useSelector(
    (state) => state.event
  );
  // --- (2) RATING AND PARTICIPATION STATE ---
  const { entityRatings, myRating } = useSelector((state) => state.rating);
  // We need to know the user's participation status for this event
  const { participationDetail } = useSelector((state) => state.participation);
  // --- (End 2) ---

  // Local state
  const [showEditForm, setShowEditForm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false); // <-- ADDED STATE
  const [isParticipant, setIsParticipant] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false); // <-- This is the event creator
  const [isJoining, setIsJoining] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [participationId, setParticipationId] = useState(null);

  // Fetch event data on mount
  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventById(eventId));
      // --- (3) FETCH RATINGS ---
      dispatch(fetchEntityRatings({ entityType: "Event", entityId }));
      // --- (End 3) ---
    }
  }, [eventId, dispatch]);

  // Check if current user is participant or organizer
  useEffect(() => {
    if (currentEvent && currentUser) {
      // Check if participant
      const participant = currentEvent.participants?.find(
        (p) => p._id === currentUser._id
      );
      if (participant) {
        setIsParticipant(true);
        // Find the participation record ID
        const participationRecord = currentEvent.participants.find(
          (p) => p.user === currentUser._id
        );
        if (participationRecord) {
          setParticipationId(participationRecord._id);
        }
      } else {
        setIsParticipant(false);
      }

      // Event organizer check
      setIsOrganizer(currentEvent.createdBy?._id === currentUser._id);
    }
  }, [currentEvent, currentUser]);

  // --- (4) FETCH PARTICIPATION STATUS ---
  // We need to know if the user attended to show the rating form
  useEffect(() => {
    if (eventId && currentUser && isParticipant && participationId) {
      // Fetch the detailed participation record to check 'status'
      dispatch(getParticipationDetails(participationId));
    }
  }, [eventId, currentUser, isParticipant, participationId, dispatch]);
  // --- (End 4) ---

  // Fetch community gallery when event data is loaded
  useEffect(() => {
    if (currentEvent?.community?._id) {
      dispatch(
        fetchCommunityGallery({ communityId: currentEvent.community._id })
      );
    }
  }, [currentEvent?.community?._id, dispatch]);

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
      // Refetch event to get new participant list
      dispatch(fetchEventById(eventId));
    }
  };

  // Handle leave event
  const handleLeaveEvent = async () => {
    if (window.confirm("Are you sure you want to leave this event?")) {
      const result = await dispatch(leaveEvent(eventId));
      if (result.payload === eventId) {
        setIsParticipant(false);
        // Refetch event to update participant list
        dispatch(fetchEventById(eventId));
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
  // Use capacity object if available (from event list) or fall back
  const capacity =
    currentEvent.capacity?.total || currentEvent.maxParticipants || 0;
  const isEventFull = capacity > 0 && registeredCount >= capacity;
  const isClosed =
    currentEvent.status === "Cancelled" || currentEvent.status === "Completed";

  // Moderator/Admin who is *not* the organizer
  const isPrivilegedUser = isModerator() && !isOrganizer;

  // Restrict event management features to community managers
  const isCommunityManager = currentUser?.role === "community_manager";

  // --- (5) RATING FORM VISIBILITY LOGIC ---
  const hasAttended =
    participationDetail &&
    ["Attended", "Completed"].includes(participationDetail.status);

  const showRatingForm =
    isAuthenticated && isParticipant && hasAttended && !myRating;
  const showUpdateForm = isAuthenticated && hasAttended && myRating;
  const showAttendedMessage =
    isAuthenticated && isParticipant && !hasAttended && !isClosed;
  // --- (End 5) ---

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
                {/* --- ADDED UPLOAD BUTTON (Only for event organizer) --- */}
                {isOrganizer && (
                  <Button
                    size="sm"
                    variant="outline"
                    icon={FiUpload}
                    onClick={() => setShowUploadModal(true)}
                  >
                    Upload Photo
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
              {/* --- ADDED CALENDAR SHARE --- */}
              <CalendarShare eventId={eventId} />
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

        {/* --- ADDED UPLOAD MODAL --- */}
        {showUploadModal && (
          <PhotoUploadModal
            eventId={eventId}
            onClose={() => setShowUploadModal(false)}
            onSuccess={() => {
              setShowUploadModal(false);
              // Refetch the community gallery to show the new photo
              if (currentEvent.community?._id) {
                dispatch(
                  fetchCommunityGallery({
                    communityId: currentEvent.community._id,
                  })
                );
              }
            }}
          />
        )}

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
                    value={`${currentEvent.location.city}, ${
                      currentEvent.location.state || ""
                    }`}
                    icon={FiMapPin}
                  />
                )}
                <DetailItem
                  label="Capacity"
                  value={`${registeredCount} / ${capacity || "Unlimited"}`}
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
            {currentEvent.createdBy && ( // Use createdBy instead of organizer
              <Card padding="lg" shadow="md" className={styles.organizerCard}>
                <h3 className={styles.cardTitle}>Organized By</h3>
                <div
                  className={styles.organizerContent}
                  onClick={() =>
                    navigate(`/profile/${currentEvent.createdBy._id}`)
                  }
                  style={{ cursor: "pointer" }}
                >
                  {currentEvent.createdBy.profileImage ? (
                    <img
                      src={currentEvent.createdBy.profileImage}
                      alt={currentEvent.createdBy.name}
                      className={styles.organizerImage}
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/60?text=User";
                      }}
                    />
                  ) : (
                    <div className={styles.organizerImagePlaceholder}>
                      {currentEvent.createdBy.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={styles.organizerInfo}>
                    <p className={styles.organizerName}>
                      {currentEvent.createdBy.name}
                    </p>
                    <p className={styles.organizerRole}>Event Organizer</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  onClick={() =>
                    navigate(`/profile/${currentEvent.createdBy._id}`)
                  }
                  style={{ marginTop: "12px" }}
                >
                  View Profile
                </Button>
              </Card>
            )}

            {/* --- (6) RATING SECTION --- */}
            <div className={styles.section}>
              <h3 className={styles.cardTitle}>Ratings & Reviews</h3>
              <Card padding="lg" shadow="md">
                <RatingStats
                  avgRating={currentEvent.avgRating}
                  totalRatings={currentEvent.totalRatings}
                  distribution={entityRatings.distribution}
                />
              </Card>
            </div>

            <div className={styles.section}>
              {/* Show update form if user has already rated */}
              {showUpdateForm && (
                <RatingForm
                  entityType="Event"
                  entityId={eventId}
                  myRating={myRating}
                />
              )}

              {/* Show create form if user attended but hasn't rated */}
              {showRatingForm && (
                <RatingForm entityType="Event" entityId={eventId} />
              )}

              {/* Show message if user is participant but not yet marked as attended */}
              {showAttendedMessage && (
                <Card padding="lg" shadow="md">
                  <p className={styles.participantNote}>
                    You must be marked as 'Attended' by the organizer before you
                    can review this event.
                  </p>
                </Card>
              )}

              {/* Show login message if not authenticated */}
              {!isAuthenticated && (
                <Card padding="lg" shadow="md">
                  <p className={styles.participantNote}>
                    Please{" "}
                    <a
                      href="/login"
                      style={{
                        fontWeight: "bold",
                        textDecoration: "underline",
                      }}
                    >
                      login
                    </a>{" "}
                    and attend the event to leave a review.
                  </p>
                </Card>
              )}
            </div>

            <div className={styles.section}>
              <RatingList entityType="Event" entityId={eventId} />
            </div>
            {/* --- (End 6) --- */}

            {/* --- ADDED GALLERY --- */}
            <div className={styles.section}>
              <h3 className={styles.cardTitle}>Community Gallery</h3>
              <CommunityGallery
                communityId={currentEvent.community?._id}
                maxPhotos={9}
              />
            </div>
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
                <StatItem
                  icon="📊"
                  label="Capacity"
                  value={capacity || "N/A"}
                />
                <StatItem
                  icon="⭐"
                  label="Rating"
                  value={(currentEvent.avgRating || 0).toFixed(1)}
                />
                <StatItem
                  icon="⏱️"
                  label="Duration"
                  value={`${currentEvent.duration || 2}h`}
                />
              </div>
            </Card>

            {/* Capacity Progress */}
            {capacity > 0 && (
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
            )}

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
                {/* Note: This button is a placeholder. 
                  A real implementation would open a map modal.
                */}
                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  onClick={() => alert("Map view coming soon!")}
                  style={{ marginTop: "12px" }}
                >
                  View on Map
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Participants Section - ONLY FOR ORGANIZER or ADMIN */}
        {(isOrganizer || isPrivilegedUser) && (
          <div className={styles.section}>
            <ParticipantList
              eventId={eventId}
              isEventOrganizer={isOrganizer || isPrivilegedUser}
              compact={false}
            />
          </div>
        )}

        {/* View-Only Participant Count for Regular Users */}
        {!isOrganizer && !isPrivilegedUser && isParticipant && (
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

        {/* Conditional Rendering for Event Management */}
        {isCommunityManager && (
          <Button
            size="md"
            variant="primary"
            icon={FiEdit}
            onClick={() => navigate(`/events/${eventId}/edit`)}
          >
            Manage Event
          </Button>
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
