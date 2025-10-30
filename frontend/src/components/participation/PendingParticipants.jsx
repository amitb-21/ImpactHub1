import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../common/Button";
import { FiCheckCircle, FiXCircle, FiUserCheck } from "react-icons/fi";
import { timeAgo } from "../../config/helpers";
import AttendanceModal from "./AttendanceModal";
import RejectionModal from "./RejectionModal";
import styles from "./styles/PendingParticipants.module.css";

const PendingParticipants = ({ participants = [] }) => {
  const navigate = useNavigate();
  const [modalType, setModalType] = useState(null); // 'approve' | 'reject'
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  const openModal = (type, participant) => {
    setSelectedParticipant(participant);
    setModalType(type);
  };

  const closeModal = () => {
    setSelectedParticipant(null);
    setModalType(null);
  };

  if (participants.length === 0) {
    return (
      <div className={styles.emptyState}>
        <FiUserCheck size={48} className={styles.emptyIcon} />
        <h4 className={styles.emptyTitle}>All Clear!</h4>
        <p className={styles.emptyText}>
          There are no participants pending verification.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.listContainer}>
        {participants.map((participant) => (
          <div key={participant._id} className={styles.participantItem}>
            <div className={styles.participantInfo}>
              <img
                src={
                  participant.user.profileImage ||
                  "https://via.placeholder.com/50?text=User"
                }
                alt={participant.user.name}
                className={styles.avatar}
                onClick={() => navigate(`/profile/${participant.user._id}`)}
              />
              <div>
                <span
                  className={styles.name}
                  onClick={() => navigate(`/profile/${participant.user._id}`)}
                >
                  {participant.user.name}
                </span>
                <span className={styles.date}>
                  Registered {timeAgo(participant.createdAt)}
                </span>
              </div>
            </div>
            <div className={styles.actions}>
              <Button
                size="sm"
                variant="primary"
                icon={FiCheckCircle}
                onClick={() => openModal("approve", participant)}
              >
                Mark Attended
              </Button>
              <Button
                size="sm"
                variant="danger"
                icon={FiXCircle}
                onClick={() => openModal("reject", participant)}
              >
                Reject
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AttendanceModal
        isOpen={modalType === "approve"}
        onClose={closeModal}
        participant={selectedParticipant}
        onSuccess={closeModal}
      />

      <RejectionModal
        isOpen={modalType === "reject"}
        onClose={closeModal}
        participant={selectedParticipant}
        onSuccess={closeModal}
      />
    </>
  );
};

export default PendingParticipants;
