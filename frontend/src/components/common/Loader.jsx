import React from "react";

export const Loader = ({
  size = "md",
  color = "#00796B",
  text = "Loading...",
  fullScreen = false,
}) => {
  const sizeMap = {
    sm: { size: "30px", borderWidth: "3px" },
    md: { size: "50px", borderWidth: "4px" },
    lg: { size: "70px", borderWidth: "5px" },
  };

  const { size: spinnerSize, borderWidth } = sizeMap[size];

  if (fullScreen) {
    return (
      <div style={styles.fullScreenContainer}>
        <div style={styles.loaderWrapper}>
          <div
            style={{
              ...styles.spinner,
              width: spinnerSize,
              height: spinnerSize,
              borderWidth: borderWidth,
              borderColor: `${color}33`,
              borderTopColor: color,
            }}
          />
          {text && <p style={styles.loadingText}>{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.loaderWrapper}>
      <div
        style={{
          ...styles.spinner,
          width: spinnerSize,
          height: spinnerSize,
          borderWidth: borderWidth,
          borderColor: `${color}33`,
          borderTopColor: color,
        }}
      />
      {text && <p style={styles.loadingText}>{text}</p>}
    </div>
  );
};

const styles = {
  fullScreenContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 9999,
  },
  loaderWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
  },
  spinner: {
    border: "4px solid #e0e0e0",
    borderTop: "4px solid #00796B",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loadingText: {
    fontSize: "14px",
    color: "#212121",
    fontWeight: "500",
    margin: 0,
  },
};

// CSS Animation (add to global styles)
const animationStyles = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export default Loader;
