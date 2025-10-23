import React from "react";

export const Button = ({
  type = "button",
  variant = "primary", // primary | secondary | outline | ghost | danger
  size = "md", // sm | md | lg
  loading = false,
  disabled = false,
  children,
  onClick,
  className = "",
  style = {},
  fullWidth = false,
  icon: Icon,
  iconPosition = "left",
  ...props
}) => {
  const variantStyles = {
    primary: {
      backgroundColor: "#00796B",
      color: "#FAFAFA",
      border: "none",
    },
    secondary: {
      backgroundColor: "#004D40",
      color: "#FAFAFA",
      border: "none",
    },
    outline: {
      backgroundColor: "transparent",
      color: "#00796B",
      border: "2px solid #00796B",
    },
    ghost: {
      backgroundColor: "transparent",
      color: "#00796B",
      border: "none",
    },
    danger: {
      backgroundColor: "#ef4444",
      color: "#FAFAFA",
      border: "none",
    },
  };

  const sizeStyles = {
    sm: {
      padding: "8px 16px",
      fontSize: "13px",
      borderRadius: "6px",
      minHeight: "32px",
    },
    md: {
      padding: "12px 24px",
      fontSize: "14px",
      borderRadius: "8px",
      minHeight: "40px",
    },
    lg: {
      padding: "16px 32px",
      fontSize: "16px",
      borderRadius: "10px",
      minHeight: "48px",
    },
  };

  const buttonStyle = {
    ...variantStyles[variant],
    ...sizeStyles[size],
    width: fullWidth ? "100%" : "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled || loading ? 0.6 : 1,
    transition: "all 0.3s ease",
    fontWeight: "600",
    border: "2px solid transparent",
    ...style,
  };

  return (
    <button
      type={type}
      style={buttonStyle}
      onClick={onClick}
      disabled={disabled || loading}
      className={className}
      {...props}
    >
      {loading && <div style={styles.spinner} />}
      {Icon && iconPosition === "left" && !loading && <Icon size={18} />}
      {children}
      {Icon && iconPosition === "right" && !loading && <Icon size={18} />}
    </button>
  );
};

const styles = {
  spinner: {
    width: "16px",
    height: "16px",
    border: "2px solid rgba(250, 250, 250, 0.3)",
    borderTop: "2px solid #FAFAFA",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};

export default Button;
