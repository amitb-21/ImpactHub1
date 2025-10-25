import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getPendingParticipants,
  getVerifiedParticipants,
  markAttendance,
  rejectParticipant,
} from "../../store/slices/participationSlice";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { Loader } from "../common/Loader";
import { Modal } from "../common/Modal";
import {
  FiCheckCircle,
  FiXCircle,
  FiUser,
  FiCalendar,
  FiArrowRight,
  FiAlertCircle,
} from "react-icons/fi";
import { formatDate, truncate } from "../../config/helpers";
import { formatPoints } from "../../config/formatters";
import styles from "./styles/ParticipantList.module.css";

const ParticipantList = ({
  eventId,
  isEventOrganizer = false,
  compact = false,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("pending"); // pending | verified
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState(null); // approve | reject
  const [hoursContributed, setHoursContributed] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");

  const {
    pendingParticipants,
    verifiedParticipants,
    isLoading,
    isUpdating,
    error,
  } = useSelector((state) => state.participation);

  // Fetch participants on mount
  useEffect(() => {
    if (eventId) {
      dispatch(getPendingParticipants({ eventId, page: 1 }));
      dispatch(getVerifiedParticipants({ eventId, page: 1 }));
    }
  }, [eventId, dispatch]);

  // Handle approve action
  const handleApprove = (participant) => {
    setSelectedParticipant(participant);
    setModalAction("approve");
    setShowModal(true);
  };

  // Handle reject action
  const handleReject = (participant) => {
    setSelectedParticipant(participant);
    setModalAction("reject");
    setShowModal(true);
  };

  // Submit approval
  const handleSubmitApproval = async () => {
    if (!hoursContributed || isNaN(hoursContributed)) {
      alert("Please enter valid hours contributed");
      return;
    }

    const result = await dispatch(
      markAttendance({
        participationId: selectedParticipant._id,
        hoursContributed: parseFloat(hoursContributed),
      })
    );

    if (result.payload) {
      setShowModal(false);
      setHoursContributed("");
      setSelectedParticipant(null);
    }
  };

  // Submit rejection
  const handleSubmitRejection = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    const result = await dispatch(
      rejectParticipant({
        participationId: selectedParticipant._id,
        rejectionReason,
      })
    );

    if (result.payload) {
      setShowModal(false);
      setRejectionReason("");
      setSelectedParticipant(null);
    }
  };

  const currentData =
    activeTab === "pending"
      ? pendingParticipants.data
      : verifiedParticipants.data;

  if (isLoading) {
    return (
      <Card padding="lg" shadow="md">
        <div className={styles.loadingContainer}>
          <Loader size="sm" text="Loading participants..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="lg" shadow="md">
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <p className={styles.errorText}>{error}</p>
        </div>
      </Card>
    );
  }

  if (!currentData || currentData.length === 0) {
    return (
      <Card padding="lg" shadow="md">
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👥</div>
          <p className={styles.emptyStateTitle}>No Participants</p>
          <p className={styles.emptyStateText}>
            {activeTab === "pending"
              ? "No pending participants yet"
              : "No verified participants yet"}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card padding="lg" shadow="md">
        {/* Header */}
        <div className={styles.header}>
          <h3 className={styles.title}>Event Participants</h3>
          <span className={styles.participantCount}>{currentData.length}</span>
        </div>

        {/* Tabs (Only show if organizer) */}
        {isEventOrganizer && (
          <div className={styles.tabsContainer}>
            <button
              onClick={() => setActiveTab("pending")}
              className={`${styles.tab} ${
                activeTab === "pending" ? styles.tabActive : ""
              }`}
            >
              <FiAlertCircle size={16} />
              Pending ({pendingParticipants.data.length})
            </button>
            <button
              onClick={() => setActiveTab("verified")}
              className={`${styles.tab} ${
                activeTab === "verified" ? styles.tabActive : ""
              }`}
            >
              <FiCheckCircle size={16} />
              Verified ({verifiedParticipants.data.length})
            </button>
          </div>
        )}

        {/* Participants List */}
        <div className={styles.participantsList}>
          {currentData.map((participant, index) => (
            <ParticipantItem
              key={participant._id}
              participant={participant}
              isLast={index === currentData.length - 1}
              isEventOrganizer={isEventOrganizer}
              onApprove={() => handleApprove(participant)}
              onReject={() => handleReject(participant)}
              activeTab={activeTab}
            />
          ))}
        </div>
      </Card>

      {/* Action Modal */}
      {showModal && selectedParticipant && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedParticipant(null);
            setHoursContributed("");
            setRejectionReason("");
          }}
          title={
            modalAction === "approve"
              ? "Approve Participation"
              : "Reject Participation"
          }
          size="md"
        >
          <div className={styles.modalContent}>
            <p className={styles.participantName}>
              {selectedParticipant.user?.name || "Participant"}
            </p>

            {modalAction === "approve" ? (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Hours Contributed</label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="Enter hours (e.g., 2, 3.5, 4)"
                    value={hoursContributed}
                    onChange={(e) => setHoursContributed(e.target.value)}
                    className={styles.input}
                  />
                </div>
                <div className={styles.buttonGroup}>
                  <Button
                    variant="primary"
                    size="md"
                    fullWidth
                    onClick={handleSubmitApproval}
                    loading={isUpdating}
                    disabled={isUpdating}
                  >
                    Approve & Award Points
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    onClick={() => setShowModal(false)}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Rejection Reason</label>
                  <textarea
                    placeholder="Explain why this participant is being rejected..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className={styles.textarea}
                  />
                </div>
                <div className={styles.buttonGroup}>
                  <Button
                    variant="danger"
                    size="md"
                    fullWidth
                    onClick={handleSubmitRejection}
                    loading={isUpdating}
                    disabled={isUpdating}
                  >
                    Reject Participation
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    onClick={() => setShowModal(false)}
                    disabled={isUpdating}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};

/**
 * Participant Item Component
 */
const ParticipantItem = ({
  participant,
  isLast,
  isEventOrganizer,
  onApprove,
  onReject,
  activeTab,
}) => {
  const navigate = useNavigate();

  return (
    <div
      className={styles.participantItem}
      style={{
        borderBottom: isLast ? "none" : "1px solid #e0e0e0",
      }}
    >
      {/* Avatar & Info */}
      <div className={styles.participantInfo}>
        {/* Avatar */}
        <div className={styles.avatarWrapper}>
          {participant.user?.profileImage ? (
            <img
              src={participant.user.profileImage}
              alt={participant.user.name}
              className={styles.avatar}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/50?text=User";
              }}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {participant.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </div>

        {/* Name & Email */}
        <div className={styles.nameSection}>
          <button
            onClick={() => navigate(`/profile/${participant.user?._id}`)}
            className={styles.participantName}
          >
            {participant.user?.name || "Unknown User"}
          </button>
          <p className={styles.participantEmail}>
            {truncate(participant.user?.email, 30)}
          </p>
          {participant.user?.location && (
            <p className={styles.participantLocation}>
              📍 {participant.user.location}
            </p>
          )}
        </div>
      </div>

      {/* Status Badge */}
      {activeTab === "verified" && (
        <Badge
          label={`${participant.hoursContributed || 0}h contributed`}
          variant="success"
          size="sm"
        />
      )}

      {/* Action Buttons (Only for organizer) */}
      {isEventOrganizer && activeTab === "pending" && (
        <div className={styles.actions}>
          <Button
            size="sm"
            variant="primary"
            icon={FiCheckCircle}
            onClick={onApprove}
            title="Approve participant"
          >
            Approve
          </Button>
          <Button
            size="sm"
            variant="danger"
            icon={FiXCircle}
            onClick={onReject}
            title="Reject participant"
          >
            Reject
          </Button>
        </div>
      )}

      {/* View Profile Button */}
      {activeTab === "verified" && (
        <Button
          size="sm"
          variant="ghost"
          icon={FiArrowRight}
          onClick={() => navigate(`/profile/${participant.user?._id}`)}
        >
          View
        </Button>
      )}
    </div>
  );
};

export default ParticipantList;
