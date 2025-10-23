import React from "react";
import { FiX } from "react-icons/fi";

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseBtn = true,
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: { maxWidth: "400px", width: "90%" },
    md: { maxWidth: "600px", width: "90%" },
    lg: { maxWidth: "900px", width: "90%" },
    xl: { maxWidth: "1200px", width: "90%" },
  };

  return (
    <>
      {/* Backdrop */}
      <div style={styles.backdrop} onClick={onClose} />

      {/* Modal */}
      <div style={styles.modalContainer}>
        <div style={{ ...styles.modal, ...sizeClasses[size] }}>
          {/* Header */}
          <div style={styles.modalHeader}>
            <h2 style={styles.modalTitle}>{title}</h2>
            {showCloseBtn && (
              <button
                style={styles.closeBtn}
                onClick={onClose}
                aria-label="Close modal"
              >
                <FiX size={24} color="#212121" />
              </button>
            )}
          </div>

          {/* Content */}
          <div style={styles.modalContent}>{children}</div>
        </div>
      </div>
    </>
  );
};

const styles = {
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 999,
    animation: "fadeIn 0.2s ease",
  },
  modalContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },
  modal: {
    backgroundColor: "#FAFAFA",
    borderRadius: "12px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
    display: "flex",
    flexDirection: "column",
    maxHeight: "90vh",
    animation: "slideUp 0.3s ease",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "24px 24px 16px 24px",
    borderBottom: "2px solid #e0e0e0",
  },
  modalTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#212121",
    margin: 0,
  },
  closeBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "6px",
    transition: "background 0.2s ease",
  },
  modalContent: {
    padding: "24px",
    overflowY: "auto",
    flex: 1,
  },
};

export default Modal;
