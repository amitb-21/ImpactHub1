import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  viewApplication,
  approveApplication,
  rejectApplication,
} from "../../store/slices/communityManagerSlice";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { Loader } from "../../components/common/Loader";
import { Modal } from "../../components/common/Modal";
import { FiArrowLeft, FiCheck, FiX, FiAlertCircle } from "react-icons/fi";
import { timeAgo } from "../../config/helpers";

// Basic styles
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

const AdminCMApplicationReview = () => {
  const { appId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    currentApplication: app,
    isLoading,
    isProcessing,
    error,
  } = useSelector((state) => state.communityManager);

  const [modalAction, setModalAction] = useState(null); // 'approve' | 'reject'
  const [notes, setNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (appId) {
      dispatch(viewApplication(appId));
    }
  }, [appId, dispatch]);

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
      dispatch(
        approveApplication({ applicationId: appId, approvalNotes: notes })
      )
        .unwrap()
        .then(() => navigate("/admin/verification"))
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
      dispatch(rejectApplication({ applicationId: appId, rejectionReason }))
        .unwrap()
        .then(() => navigate("/admin/verification"))
        .catch((err) => setActionError(err.message || "Rejection failed"));
    }
  };

  if (isLoading || !app) {
    return <Loader size="lg" text="Loading application..." />;
  }

  if (error && !app) {
    return (
      <Card padding="lg">
        <p style={{ color: "red" }}>{error}</p>
      </Card>
    );
  }

  return (
    <div>
      <div style={styles.header}>
        <Button
          variant="ghost"
          size="sm"
          icon={FiArrowLeft}
          onClick={() => navigate("/admin/verification")}
        >
          Back to Queue
        </Button>
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
      </div>

      <div style={styles.grid}>
        <div style={styles.leftCol}>
          <Card padding="lg" shadow="md">
            <h2 style={{ ...styles.title, fontSize: "24px" }}>
              {app.communityDetails?.name}
            </h2>
            <p style={{ fontSize: "16px", color: "#666" }}>
              Application by {app.applicant?.name}
            </p>
          </Card>

          <Card padding="lg" shadow="md">
            <h3 style={styles.sectionTitle}>Manager Experience</h3>
            <DetailBlock
              label="Years of Experience"
              value={`${app.managerExperience?.yearsOfExperience} years`}
            />
            <DetailBlock
              label="Previous Roles"
              value={app.managerExperience?.previousRoles}
            />
            <DetailBlock
              label="Motivation"
              value={app.managerExperience?.motivation}
            />
            <DetailBlock label="Goals" value={app.managerExperience?.goals} />
          </Card>

          <Card padding="lg" shadow="md">
            <h3 style={styles.sectionTitle}>Supporting Documents</h3>
            {app.documents?.length > 0 ? (
              <ul style={{ ...styles.list, gap: "12px" }}>
                {app.documents.map((doc, idx) => (
                  <li
                    key={idx}
                    style={{
                      ...styles.detailRow,
                      padding: "12px",
                      background: "#f9f9f9",
                      borderRadius: "6px",
                    }}
                  >
                    <span>{doc.type.replace("_", " ")}</span>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#00796B", fontWeight: "600" }}
                    >
                      View Document
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={styles.detailValue}>No documents submitted.</p>
            )}
          </Card>
        </div>

        <div style={styles.rightCol}>
          <Card padding="lg" shadow="md">
            <h3 style={styles.sectionTitle}>Applicant Info</h3>
            <DetailRow label="Name" value={app.applicant?.name} />
            <DetailRow label="Email" value={app.applicant?.email} />
            <DetailRow
              label="Member Since"
              value={timeAgo(app.applicant?.createdAt)}
            />
          </Card>

          <Card padding="lg" shadow="md">
            <h3 style={styles.sectionTitle}>Community Details</h3>
            <DetailRow
              label="Category"
              value={app.communityDetails?.category}
            />
            <DetailRow label="City" value={app.communityDetails?.city} />
            <DetailRow
              label="Contact Email"
              value={app.communityDetails?.contactEmail}
            />
            <DetailBlock
              label="Description"
              value={app.communityDetails?.description}
            />
          </Card>

          <Card padding="lg" shadow="md">
            <h3 style={styles.sectionTitle}>Organization Details</h3>
            <DetailRow
              label="Reg. Number"
              value={app.organizationDetails?.registrationNumber}
            />
            <DetailRow
              label="Type"
              value={app.organizationDetails?.organizationType}
            />
            <DetailRow
              label="Founded"
              value={app.organizationDetails?.foundedYear}
            />
            <DetailRow
              label="Total Members"
              value={app.organizationDetails?.totalMembers}
            />
            <DetailRow
              label="Active Members"
              value={app.organizationDetails?.activeMembers}
            />
            <DetailRow
              label="Past Events"
              value={app.organizationDetails?.pastEventsOrganized}
            />
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
                Approving this will:
                <ul style={{ margin: "10px 0 10px 20px" }}>
                  <li>
                    Create the community "
                    <strong>{app.communityDetails?.name}</strong>"
                  </li>
                  <li>
                    Promote <strong>{app.applicant?.name}</strong> to Moderator
                  </li>
                  <li>Mark the community as Verified</li>
                  <li>Notify the user</li>
                </ul>
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
                Rejecting this application for{" "}
                <strong>{app.applicant?.name}</strong>. Please provide a reason.
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

export default AdminCMApplicationReview;
