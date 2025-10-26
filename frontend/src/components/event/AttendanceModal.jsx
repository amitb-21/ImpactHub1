import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { markAttendance } from "../../store/slices/participationSlice";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { FiAlertCircle, FiClock } from "react-icons/fi";
import styles from "./styles/AttendanceModal.module.css";

const AttendanceModal = ({
  isOpen,
  onClose,
  participant,
  eventId,
  onSuccess,
}) => {
  const dispatch = useDispatch();
  const { isUpdating, error } = useSelector((state) => state.participation);
  const [hoursContributed, setHoursContributed] = useState("");
  const [localError, setLocalError] = useState("");

  // Handle form submission
  const handleSubmit = async () => {
    setLocalError("");

    // Validation
    if (!hoursContributed || isNaN(hoursContributed) || hoursContributed <= 0) {
      setLocalError("Please enter valid hours (greater than 0)");
      return;
    }

    const result = await dispatch(
      markAttendance({
        participationId: participant._id,
        hoursContributed: parseFloat(hoursContributed),
      })
    );

    if (result.payload) {
      setHoursContributed("");
      onSuccess?.();
      onClose?.();
    }
  };

  // Handle close
  const handleClose = () => {
    setHoursContributed("");
    setLocalError("");
    onClose?.();
  };

  if (!participant) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Mark Attendance"
      size="md"
    >
      <div className={styles.container}>
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

        {/* Hours Input Section */}
        <div className={styles.formSection}>
          <label htmlFor="hours" className={styles.label}>
            <FiClock size={16} style={{ marginRight: "6px" }} />
            Hours Contributed
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="hours"
              type="number"
              min="0.5"
              step="0.5"
              placeholder="e.g., 2, 3.5, 4"
              value={hoursContributed}
              onChange={(e) => {
                setHoursContributed(e.target.value);
                setLocalError("");
              }}
              className={styles.input}
            />
            <span className={styles.inputUnit}>hours</span>
          </div>
          <p className={styles.hint}>
            Enter the number of hours this participant contributed to the event
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
          <p className={styles.infoText}>ℹ️ Approving this participant will:</p>
          <ul className={styles.infoList}>
            <li>✓ Mark them as attended</li>
            <li>✓ Calculate and award points based on hours</li>
            <li>✓ Update their impact metrics</li>
            <li>✓ Contribute to the event's completion</li>
          </ul>
        </Card>

        {/* Buttons */}
        <div className={styles.buttonGroup}>
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={handleSubmit}
            loading={isUpdating}
            disabled={isUpdating || !hoursContributed}
          >
            {isUpdating ? "Marking Attendance..." : "Approve & Award Points"}
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

export default AttendanceModal;
