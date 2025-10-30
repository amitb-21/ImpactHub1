import React, { useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { markAttendance } from "../../store/slices/participationSlice";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import { Card } from "../common/Card";
import { FiAlertCircle, FiClock, FiTrendingUp } from "react-icons/fi";
import styles from "./styles/AttendanceModal.module.css";
import { POINTS_CONFIG } from "../../config/constants";

const AttendanceModal = ({ isOpen, onClose, participant, onSuccess }) => {
  const dispatch = useDispatch();
  const { isUpdating, error } = useSelector((state) => state.participation);
  const [hoursContributed, setHoursContributed] = useState("");
  const [localError, setLocalError] = useState("");

  // Calculate points preview
  const pointsBreakdown = useMemo(() => {
    const hours = parseFloat(hoursContributed) || 0;
    const basePoints = POINTS_CONFIG.EVENT_PARTICIPATED;
    const hourPoints = hours * POINTS_CONFIG.HOURS_VOLUNTEERED;
    const totalPoints = basePoints + hourPoints;
    return { basePoints, hourPoints, totalPoints, hours };
  }, [hoursContributed]);

  // Handle form submission
  const handleSubmit = async () => {
    setLocalError("");
    const hours = parseFloat(hoursContributed);

    if (isNaN(hours) || hours < 0) {
      setLocalError("Please enter valid hours (0 or greater)");
      return;
    }

    const result = await dispatch(
      markAttendance({
        participationId: participant._id,
        hoursContributed: hours,
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
          <label htmlFor="hours" className={styles.label}>
            <FiClock size={16} />
            Hours Contributed
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="hours"
              type="number"
              min="0"
              step="0.5"
              placeholder="e.g., 0, 2, 3.5"
              value={hoursContributed}
              onChange={(e) => {
                setHoursContributed(e.target.value);
                setLocalError("");
              }}
              className={styles.input}
            />
            <span className={styles.inputUnit}>hours</span>
          </div>
        </div>

        {/* Points Calculation Preview */}
        <Card padding="md" shadow="sm" className={styles.infoBox}>
          <p className={styles.infoText} style={{ color: "#004D40" }}>
            <FiTrendingUp size={16} />
            Points Calculation
          </p>
          <ul className={styles.infoList}>
            <li>Base Points: {pointsBreakdown.basePoints} pts</li>
            <li>
              Hour Bonus: {pointsBreakdown.hours}h ×{" "}
              {POINTS_CONFIG.HOURS_VOLUNTEERED} pts/hr ={" "}
              {pointsBreakdown.hourPoints} pts
            </li>
            <li className={styles.totalPoints}>
              Total to Award: {pointsBreakdown.totalPoints} pts
            </li>
          </ul>
        </Card>

        {(localError || error) && (
          <div className={styles.errorAlert}>
            <FiAlertCircle size={18} />
            <span>{localError || error}</span>
          </div>
        )}

        <div className={styles.buttonGroup}>
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={handleSubmit}
            loading={isUpdating}
            disabled={isUpdating || hoursContributed === ""}
          >
            {isUpdating ? "Marking..." : "Mark as Attended"}
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
