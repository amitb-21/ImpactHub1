import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getMyApplication } from "../../store/slices/communityManagerSlice";
import { useSocket } from "../../hooks/useSocket";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import {
  FiCheckCircle,
  FiClock,
  FiX,
  FiArrowRight,
  FiRefreshCw,
} from "react-icons/fi";
import styles from "./styles/CMApplicationStatus.module.css";

const CMApplicationStatus = ({ onReapply, onViewCommunity }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myApplication, isLoading, error } = useSelector(
    (state) => state.communityManager
  );
  const { socket } = useSocket();
  const [daysUntilReapply, setDaysUntilReapply] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch application on mount
  useEffect(() => {
    dispatch(getMyApplication());
  }, [dispatch]);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleApproved = (data) => {
      console.log("✅ Application approved:", data);
      dispatch(getMyApplication());
    };

    const handleRejected = (data) => {
      console.log("❌ Application rejected:", data);
      dispatch(getMyApplication());
    };

    socket.on("communityManager:approved", handleApproved);
    socket.on("communityManager:rejected", handleRejected);

    return () => {
      socket.off("communityManager:approved", handleApproved);
      socket.off("communityManager:rejected", handleRejected);
    };
  }, [socket, dispatch]);

  // Calculate days until reapply for rejected applications
  useEffect(() => {
    if (myApplication?.status === "rejected" && myApplication?.rejectedAt) {
      const rejectedDate = new Date(myApplication.rejectedAt);
      const reapplyDate = new Date(
        rejectedDate.getTime() + 30 * 24 * 60 * 60 * 1000
      );
      const now = new Date();
      const daysLeft = Math.ceil((reapplyDate - now) / (1000 * 60 * 60 * 24));
      setDaysUntilReapply(Math.max(0, daysLeft));
    }
  }, [myApplication]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(getMyApplication());
    setRefreshing(false);
  };

  if (isLoading && !myApplication) {
    return (
      <Card padding="lg" shadow="md">
        <div className={styles.loadingContainer}>
          <p>Loading application status...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="lg" shadow="md" className={styles.errorCard}>
        <div className={styles.errorContent}>
          <FiX size={24} style={{ color: "#ef4444" }} />
          <span>Error: {error}</span>
        </div>
      </Card>
    );
  }

  if (!myApplication) {
    return null;
  }

  const { status, community, createdAt, rejectionReason, approvalNotes } =
    myApplication;

  // PENDING STATUS
  if (status === "pending") {
    return (
      <Card padding="lg" shadow="md">
        <div className={styles.statusContainer}>
          <div className={styles.statusHeader}>
            <FiClock size={32} className={styles.iconPending} />
            <div className={styles.statusInfo}>
              <h3 className={styles.statusTitle}>Application Under Review</h3>
              <p className={styles.statusDescription}>
                Your community manager application is being reviewed by our
                admin team. This typically takes 3-5 business days.
              </p>
            </div>
          </div>

          <div className={styles.statusDetails}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Submitted:</span>
              <span className={styles.detailValue}>
                {new Date(createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className={styles.actions}>
            <Button
              size="sm"
              variant="outline"
              icon={FiRefreshCw}
              onClick={handleRefresh}
              loading={refreshing}
              disabled={refreshing}
            >
              Refresh Status
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // APPROVED STATUS
  if (status === "approved") {
    return (
      <Card padding="lg" shadow="md">
        <div className={styles.statusContainer}>
          <div className={styles.statusHeader}>
            <FiCheckCircle size={32} className={styles.iconApproved} />
            <div className={styles.statusInfo}>
              <h3 className={styles.statusTitle}>🎉 Application Approved!</h3>
              <p className={styles.statusDescription}>
                Congratulations! You've been approved as a community manager.
                Your community is now live and verified!
              </p>
            </div>
          </div>

          <div className={styles.statusDetails}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Community:</span>
              <span className={styles.detailValue}>{community?.name}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Status:</span>
              <Badge label="Verified" variant="success" size="sm" />
            </div>
            {approvalNotes && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Admin Notes:</span>
                <span className={styles.detailValue}>{approvalNotes}</span>
              </div>
            )}
          </div>

          <div className={styles.actions}>
            <Button
              size="md"
              variant="primary"
              icon={FiArrowRight}
              onClick={() => navigate(`/communities/${community._id}`)}
              iconPosition="right"
            >
              View Community
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // REJECTED STATUS
  if (status === "rejected") {
    const canReapply = daysUntilReapply === 0;
    return (
      <Card padding="lg" shadow="md">
        <div className={styles.statusContainer}>
          <div className={styles.statusHeader}>
            <FiX size={32} className={styles.iconRejected} />
            <div className={styles.statusInfo}>
              <h3 className={styles.statusTitle}>Application Not Approved</h3>
              <p className={styles.statusDescription}>
                Your community manager application was not approved at this
                time.
              </p>
            </div>
          </div>

          <div className={styles.statusDetails}>
            {rejectionReason && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Reason:</span>
                <span className={styles.detailValue}>{rejectionReason}</span>
              </div>
            )}
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Can Reapply In:</span>
              <span
                className={`${styles.detailValue} ${
                  canReapply ? styles.canReapply : ""
                }`}
              >
                {canReapply
                  ? "🎉 Now!"
                  : `${daysUntilReapply} day${
                      daysUntilReapply !== 1 ? "s" : ""
                    }`}
              </span>
            </div>
          </div>

          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              💡 You can improve your application by addressing the feedback
              above and reapply.
            </p>
          </div>

          <div className={styles.actions}>
            <Button
              size="md"
              variant="primary"
              onClick={onReapply}
              disabled={!canReapply}
            >
              {canReapply ? "Reapply Now" : "Reapply Soon"}
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return null;
};

export default CMApplicationStatus;
