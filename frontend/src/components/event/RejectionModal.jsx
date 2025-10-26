import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { rejectParticipant } from "../../store/slices/participationSlice";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { FiAlertCircle, FiX } from "react-icons/fi";
import styles from "./styles/RejectionModal.module.css";

const RejectionModal = ({
  isOpen,
  onClose,
  participant,
  eventId,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const { isUpdating, error } = useSelector((state) => state.participation);
  const [rejectionReason, setRejectionReason] = useState("");
  const [localError, setLocalError] = useState("");

  // Predefined rejection reasons
  const rejectionReasons = [
    "Did not attend the event",
    "Did not meet participation requirements",
    "Insufficient hours contributed",
    "Violation of community guidelines",
    "Duplicate registration",
    "Other",
  ];

  // Handle form submission
  const handleSubmit = async () => {
    setLocalError("");

    // Validation
    if (!rejectionReason.trim()) {
      setLocalError("Please provide a rejection reason");
      return;
    }

    const result = await dispatch(
      rejectParticipant({
        participationId: participant._id,
        rejectionReason: rejectionReason.trim(),
      })
    );

    if (result.payload) {
      setRejectionReason("");
      onSuccess?.();
      onClose?.();
    }
  };

  // Handle close
  const handleClose = () => {
    setRejectionReason("");
    setLocalError("");
    onClose?.();
  };

  if (!participant) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reject Participation"
      size="md"
    >
      <div className={styles.container}>
        {/* Warning Alert */}
        <div className={styles.warningAlert}>
          <FiAlertCircle size={20} />
          <div>
            <p className={styles.warningTitle}>Confirm Rejection</p>
            <p className={styles.warningText}>
              This will reject the participant's attendance and prevent points
              from being awarded.
            </p>
          </div>
        </div>

        {/* Participant Info */}
        <Card padding="md" shadow="sm" className={styles.participantCard}>
          <div className={styles.participantHeader}>
            {participant.user?.profileImage ? (
              <img
                src={participant.user.profileImage}
                alt={participant.user?.name}
                className={styles.participantAvatar}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/50?text=User";
                }}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                {participant.user?.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
            <div className={styles.participantInfo}>
              <h3 className={styles.participantName}>
                {participant.user?.name || "Unknown User"}
              </h3>
              <p className={styles.participantEmail}>
                {participant.user?.email}
              </p>
            </div>
          </div>
        </Card>

        {/* Rejection Reason Section */}
        <div className={styles.formSection}>
          <label htmlFor="reason" className={styles.label}>
            Rejection Reason
          </label>

          {/* Quick Select Buttons */}
          <div className={styles.quickReasons}>
            {rejectionReasons.map((reason) => (
              <button
                key={reason}
                onClick={() => {
                  setRejectionReason(reason);
                  setLocalError("");
                }}
                className={`${styles.reasonButton} ${
                  rejectionReason === reason ? styles.reasonButtonActive : ""
                }`}
              >
                {reason}
              </button>
            ))}
          </div>

          {/* Custom Reason Textarea */}
          <textarea
            id="reason"
            placeholder="Provide additional details (optional)..."
            value={rejectionReason}
            onChange={(e) => {
              setRejectionReason(e.target.value);
              setLocalError("");
            }}
            className={styles.textarea}
          />
          <p className={styles.hint}>
            Be respectful and clear about why you're rejecting this participant
          </p>
        </div>

        {/* Error Alert */}
        {(localError || error) && (
          <div className={styles.errorAlert}>
            <FiAlertCircle size={18} />
            <span>{localError || error}</span>
          </div>
        )}

        {/* Info Box */}
        <Card padding="md" shadow="sm" className={styles.infoBox}>
          <p className={styles.infoText}>
            📝 The participant will receive a notification with the rejection
            reason and can appeal if they disagree.
          </p>
        </Card>

        {/* Buttons */}
        <div className={styles.buttonGroup}>
          <Button
            variant="danger"
            size="md"
            fullWidth
            onClick={handleSubmit}
            loading={isUpdating}
            disabled={isUpdating || !rejectionReason.trim()}
            icon={FiX}
          >
            {isUpdating ? "Rejecting..." : "Reject Participation"}
          </Button>
          <Button
            variant="outline"
            size="md"
            fullWidth
            onClick={handleClose}
            disabled={isUpdating}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default RejectionModal;
