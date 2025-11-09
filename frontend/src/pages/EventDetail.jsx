import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";
import { toast } from "react-toastify";
import {
  fetchEventById,
  joinEvent,
  leaveEvent,
  fetchEvents,
} from "../store/slices/eventSlice";
import { fetchCommunityGallery } from "../store/slices/photoSlice";
import { fetchEntityRatings } from "../store/slices/ratingSlice";
import { getParticipationDetails } from "../store/slices/participationSlice";
import RatingStats from "../components/rating/RatingStats";
import RatingList from "../components/rating/RatingList";
import RatingForm from "../components/rating/RatingForm";
import Layout from "../components/common/Layout";
import ParticipantList from "../components/event/ParticipantList";
import AttendanceModal from "../components/event/AttendanceModal";
import RejectionModal from "../components/event/RejectionModal";
import PointsBreakdown from "../components/event/PointsBreakdown";
import CalendarShare from "../components/event/CalendarShare";
import PhotoUploadModal from "../components/photo/PhotoUploadModal";
import CommunityGallery from "../components/community/CommunityGallery";
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
  FiUpload,
} from "react-icons/fi";
import { formatDate, formatDateTime } from "../config/helpers";
import styles from "./styles/EventDetail.module.css";

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { joinEvent: joinEventSocket } = useSocket();

  // Redux selectors
  const { currentEvent, isLoading, error } = useSelector(
    (state) => state.event
  );
  const { entityRatings, myRating } = useSelector((state) => state.rating);
  const { participationDetail } = useSelector((state) => state.participation);

  // Local state
  const [showEditForm, setShowEditForm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [participationId, setParticipationId] = useState(null);

  // Fetch event data on mount
  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventById(eventId));
      dispatch(fetchEntityRatings({ entityType: "Event", entityId: eventId }));
    }
  }, [eventId, dispatch]);

  // Check if current user is participant
  useEffect(() => {
    if (currentEvent && currentUser) {
      const isUserParticipant = currentEvent.participants?.some((p) => {
        const pId = p._id || p;
        const userId = currentUser._id;
        return pId === userId || pId.toString() === userId.toString();
      });

      setIsParticipant(isUserParticipant);

      // Set participation ID
      if (isUserParticipant) {
        const participantId = currentEvent.participants?.find(
          (p) => (p._id || p).toString() === currentUser._id.toString()
        )?._id;
        setParticipationId(participantId);
      } else {
        setParticipationId(null);
      }
    }
  }, [currentEvent, currentUser]);

  // Fetch participation status
  useEffect(() => {
    if (eventId && currentUser && isParticipant && participationId) {
      dispatch(getParticipationDetails(participationId));
    }
  }, [eventId, currentUser, isParticipant, participationId, dispatch]);

  // Fetch community gallery
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

    try {
      const result = await dispatch(joinEvent(eventId));

      if (result.payload) {
        setIsParticipant(true);
        joinEventSocket(eventId);
        toast.success("Successfully joined event!");

        // ✅ Refetch data after small delay to ensure server is updated
        setTimeout(() => {
          dispatch(fetchEventById(eventId));
          dispatch(
            fetchEntityRatings({ entityType: "Event", entityId: eventId })
          );
          // ✅ NEW: Refresh events list in Redux
          dispatch(fetchEvents({ page: 1, limit: 10 }));
        }, 300);
      } else {
        toast.error("Failed to join event");
      }
    } catch (error) {
      toast.error("Failed to join event");
    } finally {
      setIsJoining(false);
    }
  };

  // Handle leave event
  const handleLeaveEvent = async () => {
    if (!window.confirm("Are you sure you want to leave this event?")) {
      return;
    }

    setIsLeaving(true);

    try {
      const result = await dispatch(leaveEvent(eventId));

      if (result.payload === eventId) {
        setIsParticipant(false);
        setParticipationId(null);
        toast.success("Successfully left event!");

        // ✅ Refetch data
        setTimeout(() => {
          dispatch(fetchEventById(eventId));
          // ✅ NEW: Refresh events list in Redux
          dispatch(fetchEvents({ page: 1, limit: 10 }));
        }, 300);
      } else {
        toast.error("Failed to leave event");
      }
    } catch (error) {
      toast.error("Failed to leave event");
    } finally {
      setIsLeaving(false);
    }
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    dispatch(fetchEventById(eventId));
  };

  const handleParticipantAction = (participant, action) => {
    setSelectedParticipant(participant);
    if (action === "approve") {
      setShowAttendanceModal(true);
    } else if (action === "reject") {
      setShowRejectionModal(true);
    }
  };

  // Authorization checks
  const isEventCreator = currentEvent?.createdBy?._id === currentUser?._id;
  const isCommunityModerator =
    currentUser?.role === "community_manager" &&
    currentEvent?.community?.createdBy?._id === currentUser?._id;
  const canManageEvent = isEventCreator || isCommunityModerator;

  // Rating form visibility
  const hasAttended =
    participationDetail &&
    ["Attended", "Completed"].includes(participationDetail.status);

  const showRatingForm =
    isAuthenticated && isParticipant && hasAttended && !myRating;
  const showUpdateForm = isAuthenticated && hasAttended && myRating;
  const showAttendedMessage = isAuthenticated && isParticipant && !hasAttended;

  // Handle rating submission
  const handleRatingSubmitted = () => {
    dispatch(fetchEventById(eventId));
    dispatch(fetchEntityRatings({ entityType: "Event", entityId: eventId }));
  };

  // Error state
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

  // Loading state
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
  const capacity =
    currentEvent.capacity?.total || currentEvent.maxParticipants || 0;
  const isEventFull = capacity > 0 && registeredCount >= capacity;
  const isClosed =
    currentEvent.status === "Cancelled" || currentEvent.status === "Completed";

  return (
    <Layout>
      <div className={styles.container}>
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
              />
            ) : (
              <div className={styles.heroImagePlaceholder}>
                <span className={styles.placeholderIcon}>📅</span>
              </div>
            )}

            {/* Status Badges */}
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
            {/* Header */}
            <div className={styles.heroHeader}>
              <div>
                <h1 className={styles.title}>{currentEvent.title}</h1>
                <p className={styles.subtitle}>{currentEvent.description}</p>
              </div>

              {/* Management Actions */}
              <div className={styles.actions}>
                {canManageEvent && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      icon={FiEdit}
                      onClick={() => setShowEditForm(true)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      icon={FiUpload}
                      onClick={() => setShowUploadModal(true)}
                    >
                      Upload Photo
                    </Button>
                  </>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  icon={FiShare2}
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Event link copied!");
                  }}
                >
                  Share
                </Button>
              </div>
            </div>

            {/* Meta Info */}
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

            {/* Join/Leave Button */}
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
                  {isJoining
                    ? "Joining..."
                    : isEventFull
                    ? "Event Full"
                    : "Join Event"}
                </Button>
              ) : isParticipant && !isClosed ? (
                <Button
                  size="md"
                  variant="outline"
                  onClick={handleLeaveEvent}
                  loading={isLeaving}
                  disabled={isLeaving}
                  fullWidth
                >
                  {isLeaving ? "Leaving..." : "Leave Event"}
                </Button>
              ) : (
                <Button size="md" variant="outline" fullWidth disabled>
                  {currentEvent.status === "Completed"
                    ? "Event Completed"
                    : "Event Cancelled"}
                </Button>
              )}
              <CalendarShare eventId={eventId} />
            </div>

            {/* Discovery Buttons */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginTop: "16px",
                width: "100%",
              }}
            >
              <Button
                size="sm"
                variant="outline"
                fullWidth
                onClick={() => navigate("/nearby-events")}
              >
                🗺️ Find Nearby Events
              </Button>
              {currentEvent.location?.city && (
                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  onClick={() =>
                    navigate(`/events/city/${currentEvent.location.city}`)
                  }
                >
                  📍 More in {currentEvent.location.city}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
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

        {showUploadModal && (
          <PhotoUploadModal
            eventId={eventId}
            onClose={() => setShowUploadModal(false)}
            onSuccess={() => {
              setShowUploadModal(false);
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

        {/* Main Content Grid */}
        <div className={styles.gridContainer}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            {/* Event Details */}
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

            {/* Organizer Info */}
            {currentEvent.createdBy && (
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

            {/* Ratings */}
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

            {/* Rating Form */}
            <div className={styles.section}>
              {showUpdateForm && (
                <RatingForm
                  entityType="Event"
                  entityId={eventId}
                  myRating={myRating}
                  onRatingSubmitted={handleRatingSubmitted}
                />
              )}

              {showRatingForm && (
                <RatingForm
                  entityType="Event"
                  entityId={eventId}
                  onRatingSubmitted={handleRatingSubmitted}
                />
              )}

              {showAttendedMessage && (
                <Card padding="lg" shadow="md">
                  <p className={styles.participantNote}>
                    You must be marked as 'Attended' by the organizer before you
                    can review this event.
                  </p>
                </Card>
              )}

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

            {/* Rating List */}
            <div className={styles.section}>
              <RatingList entityType="Event" entityId={eventId} />
            </div>

            {/* Gallery */}
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
            {/* Stats */}
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

            {/* Location */}
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
                  onClick={() => alert("Map view coming soon!")}
                  style={{ marginTop: "12px" }}
                >
                  View on Map
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Participants Section */}
        {canManageEvent && (
          <div className={styles.section}>
            <ParticipantList
              eventId={eventId}
              isEventOrganizer={true}
              compact={false}
            />
          </div>
        )}

        {!canManageEvent && isParticipant && (
          <Card padding="lg" shadow="md" className={styles.section}>
            <h3 className={styles.cardTitle}>
              Participants ({registeredCount})
            </h3>
            <p className={styles.participantNote}>
              Only the event organizer can view the full participant list.
            </p>
          </Card>
        )}
      </div>
    </Layout>
  );
};

// Helper Components
const DetailItem = ({ label, value, icon: Icon }) => (
  <div className={styles.detailItem}>
    {Icon && <Icon size={16} style={{ color: "#00796B" }} />}
    <div>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  </div>
);

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
