import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { rejectParticipant } from "../../store/slices/participationSlice";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { FiAlertCircle, FiMessageSquare } from "react-icons/fi";
import styles from "./styles/RejectionModal.module.css";

const RejectionModal = ({ isOpen, onClose, participant, onSuccess }) => {
  const dispatch = useDispatch();
  const { isUpdating, error } = useSelector((state) => state.participation);
  const [rejectionReason, setRejectionReason] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSubmit = async () => {
    setLocalError("");
    if (!rejectionReason.trim()) {
      setLocalError("Please provide a rejection reason.");
      return;
    }

    const result = await dispatch(
      rejectParticipant({
        participationId: participant._id,
        rejectionReason,
      })
    );

    if (result.payload) {
      setRejectionReason("");
      onSuccess?.();
      onClose?.();
    }
  };

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
      title="Reject Participant"
      size="md"
    >
      <div className={styles.container}>
        <Card padding="md" shadow="sm" className={styles.participantCard}>
          <div className={styles.participantHeader}>
            <img
              src={
                participant.user.profileImage ||
                "https://via.placeholder.com/50?text=User"
              }
              alt={participant.user?.name}
              className={styles.participantAvatar}
            />
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

        <div className={styles.formSection}>
          <label htmlFor="reason" className={styles.label}>
            <FiMessageSquare size={16} />
            Rejection Reason
          </label>
          <textarea
            id="reason"
            placeholder="Explain why this participant is being rejected (e.g., did not show up, not on list)..."
            value={rejectionReason}
            onChange={(e) => {
              setRejectionReason(e.target.value);
              setLocalError("");
            }}
            className={styles.textarea}
            rows={4}
          />
        </div>

        {(localError || error) && (
          <div className={styles.errorAlert}>
            <FiAlertCircle size={18} />
            <span>{localError || error}</span>
          </div>
        )}

        <div className={styles.buttonGroup}>
          <Button
            variant="danger"
            size="md"
            fullWidth
            onClick={handleSubmit}
            loading={isUpdating}
            disabled={isUpdating || !rejectionReason.trim()}
          >
            {isUpdating ? "Rejecting..." : "Reject Participant"}
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
