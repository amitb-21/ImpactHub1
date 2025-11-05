import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { fetchResourceById } from "../../store/slices/resourceSlice";
import { approveResource, rejectResource } from "../../store/slices/adminSlice";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Loader } from "../../components/common/Loader";
import { Modal } from "../../components/common/Modal";
import { Badge } from "../../components/common/Badge";
import { FiArrowLeft, FiCheck, FiX, FiAlertCircle } from "react-icons/fi";
import { timeAgo } from "../../config/helpers";

// Re-using styles from CM Review
const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
  },
  title: { fontSize: "28px", fontWeight: "800", margin: 0, color: "#212121" },
  grid: { display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" },
  leftCol: { display: "flex", flexDirection: "column", gap: "20px" },
  rightCol: { display: "flex", flexDirection: "column", gap: "20px" },
  section: { marginBottom: "16px" },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#00796B",
    margin: "0 0 12px 0",
    paddingBottom: "8px",
    borderBottom: "2px solid #e0e0e0",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #f0f0f0",
  },
  detailLabel: { fontSize: "13px", color: "#666", fontWeight: "500" },
  detailValue: {
    fontSize: "14px",
    color: "#212121",
    fontWeight: "600",
    textAlign: "right",
  },
  detailBlock: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "8px 0",
  },
  detailBlockValue: {
    fontSize: "14px",
    color: "#212121",
    fontWeight: "500",
    whiteSpace: "pre-wrap",
    background: "#f9f9f9",
    padding: "10px",
    borderRadius: "6px",
  },
  actions: { display: "flex", gap: "12px" },
  modalContent: { display: "flex", flexDirection: "column", gap: "16px" },
  modalText: { fontSize: "14px", color: "#666" },
  textarea: {
    width: "100%",
    minHeight: "100px",
    padding: "12px",
    fontSize: "14px",
    border: "1.5px solid #e0e0e0",
    borderRadius: "8px",
    fontFamily: "inherit",
    resize: "vertical",
  },
  charCount: { fontSize: "12px", color: "#666", textAlign: "right" },
  errorText: { fontSize: "13px", color: "#ef4444", fontWeight: "500" },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "16px",
  },
};

const AdminResourceReview = () => {
  const { resourceId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentResource: res, status } = useSelector(
    (state) => state.resources
  );
  const { isUpdating: isProcessing, error: adminError } = useSelector(
    (state) => state.admin
  );

  const [modalAction, setModalAction] = useState(null); // 'approve' | 'reject'
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (resourceId) {
      dispatch(fetchResourceById(resourceId));
    }
  }, [resourceId, dispatch]);

  const handleApprove = () => {
    setActionError("");
    setModalAction("approve");
  };

  const handleReject = () => {
    setActionError("");
    setModalAction("reject");
  };

  const closeModal = () => {
    setModalAction(null);
    setNotes("");
    setRejectionReason("");
    setActionError("");
  };

  const handleConfirmAction = () => {
    if (modalAction === "approve") {
      dispatch(approveResource({ resourceId, notes }))
        .unwrap()
        .then(() => navigate("/admin/resources"))
        .catch((err) => setActionError(err.message || "Approval failed"));
    }

    if (modalAction === "reject") {
      if (
        !rejectionReason ||
        rejectionReason.length < 1 ||
        rejectionReason.length > 500
      ) {
        setActionError(
          "Rejection reason must be between 1 and 500 characters."
        );
        return;
      }
      dispatch(rejectResource({ resourceId, rejectionReason }))
        .unwrap()
        .then(() => navigate("/admin/resources"))
        .catch((err) => setActionError(err.message || "Rejection failed"));
    }
  };

  if (status === "loading" || !res) {
    return <Loader size="lg" text="Loading resource..." />;
  }

  if (status === "failed" && !res) {
    return (
      <Card padding="lg">
        <p style={{ color: "red" }}>Failed to load resource.</p>
      </Card>
    );
  }

  const getStatusBadge = (resource) => {
    if (resource.isPublished) {
      return <Badge label="Published" variant="success" size="sm" />;
    }
    if (resource.rejectionReason) {
      return <Badge label="Rejected" variant="error" size="sm" />;
    }
    return <Badge label="Pending Approval" variant="warning" size="sm" />;
  };

  return (
    <div>
      <div style={styles.header}>
        <Button
          variant="ghost"
          size="sm"
          icon={FiArrowLeft}
          onClick={() => navigate("/admin/resources")}
        >
          Back to Resources
        </Button>
        {!res.isPublished && (
          <div style={styles.actions}>
            <Button
              variant="danger"
              size="md"
              icon={FiX}
              onClick={handleReject}
              disabled={isProcessing}
            >
              Reject
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={FiCheck}
              onClick={handleApprove}
              disabled={isProcessing}
            >
              Approve
            </Button>
          </div>
        )}
      </div>

      <div style={styles.grid}>
        <div style={styles.leftCol}>
          <Card padding="lg" shadow="md">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <h2 style={{ ...styles.title, fontSize: "24px" }}>{res.title}</h2>
              {getStatusBadge(res)}
            </div>
            <p style={{ fontSize: "16px", color: "#666" }}>
              By {res.author?.name}
            </p>
            <div style={{ display: "flex", gap: "8px", margin: "16px 0" }}>
              <Badge label={res.category} variant="primary" size="sm" />
              <Badge label={res.type} variant="info" size="sm" />
              <Badge label={res.difficulty} variant="warning" size="sm" />
            </div>
          </Card>

          <Card padding="lg" shadow="md">
            <h3 style={styles.sectionTitle}>Content</h3>
            <DetailBlock label="Description" value={res.description} />
            <DetailBlock label="Full Content" value={res.content} />
          </Card>

          {res.rejectionReason && (
            <Card
              padding="lg"
              shadow="md"
              style={{ borderColor: "#ef4444", background: "#fef2f2" }}
            >
              <h3 style={{ ...styles.sectionTitle, color: "#991b1b" }}>
                Rejection Reason
              </h3>
              <p style={styles.detailBlockValue}>{res.rejectionReason}</p>
            </Card>
          )}
        </div>

        <div style={styles.rightCol}>
          <Card padding="lg" shadow="md">
            <h3 style={styles.sectionTitle}>Author Info</h3>
            <DetailRow label="Name" value={res.author?.name} />
            <DetailRow label="Email" value={res.author?.email || "N/A"} />
            <DetailRow label="Submitted" value={timeAgo(res.createdAt)} />
          </Card>

          <Card padding="lg" shadow="md">
            <h3 style={styles.sectionTitle}>Details</h3>
            <DetailRow label="Views" value={res.views} />
            <DetailRow label="Likes" value={res.likes} />
            <DetailRow
              label="Read Time"
              value={`${res.estimatedReadTime} min`}
            />
            <DetailRow label="Video URL" value={res.videoUrl || "N/A"} />
            <DetailRow label="Download URL" value={res.downloadUrl || "N/A"} />
            <DetailBlock label="Tags" value={res.tags?.join(", ") || "None"} />
          </Card>
        </div>
      </div>

      {/* Confirmation Modals */}
      <Modal
        isOpen={!!modalAction}
        onClose={closeModal}
        title={`Confirm ${modalAction}`}
      >
        <div style={styles.modalContent}>
          {actionError && (
            <div
              style={{
                ...styles.errorText,
                padding: "10px",
                background: "#fee2e2",
                borderRadius: "6px",
              }}
            >
              <FiAlertCircle
                size={18}
                style={{ verticalAlign: "middle", marginRight: "8px" }}
              />
              {actionError}
            </div>
          )}

          {modalAction === "approve" && (
            <>
              <p style={styles.modalText}>
                Approving "<strong>{res.title}</strong>" will make it public.
              </p>
              <label htmlFor="notes" style={styles.detailLabel}>
                Approval Notes (Optional)
              </label>
              <textarea
                id="notes"
                style={styles.textarea}
                placeholder="Internal notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </>
          )}

          {modalAction === "reject" && (
            <>
              <p style={styles.modalText}>
                Rejecting "<strong>{res.title}</strong>". Please provide a
                reason.
              </p>
              <label htmlFor="reason" style={styles.detailLabel}>
                Rejection Reason (Required)
              </label>
              <textarea
                id="reason"
                style={{
                  ...styles.textarea,
                  borderColor: actionError ? "#ef4444" : "#e0e0e0",
                }}
                placeholder="Reason for rejection (will be sent to user)..."
                value={rejectionReason}
                onChange={(e) => {
                  setRejectionReason(e.target.value);
                  if (actionError) setActionError("");
                }}
                maxLength={500}
              />
              <p style={styles.charCount}>{rejectionReason.length}/500</p>
            </>
          )}

          <div style={styles.modalActions}>
            <Button
              variant="outline"
              onClick={closeModal}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant={modalAction === "reject" ? "danger" : "primary"}
              onClick={handleConfirmAction}
              loading={isProcessing}
            >
              {isProcessing ? "Processing..." : `Confirm ${modalAction}`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const DetailRow = ({ label, value }) => (
  <div style={styles.detailRow}>
    <span style={styles.detailLabel}>{label}</span>
    <span style={styles.detailValue}>{value || "N/A"}</span>
  </div>
);

const DetailBlock = ({ label, value }) => (
  <div style={styles.detailBlock}>
    <span style={styles.detailLabel}>{label}</span>
    <span style={styles.detailBlockValue}>{value || "N/A"}</span>
  </div>
);

export default AdminResourceReview;
