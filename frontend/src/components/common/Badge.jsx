import React from "react";

export const Badge = ({
  label,
  variant = "default", // default | success | error | warning | info | primary
  size = "md", // sm | md | lg
  icon: Icon,
  onRemove,
  clickable = false,
  onClick,
  style = {},
  ...props
}) => {
  const variantStyles = {
    default: { bg: "#e0e0e0", color: "#212121" },
    success: { bg: "#d1fae5", color: "#065f46" },
    error: { bg: "#fee2e2", color: "#991b1b" },
    warning: { bg: "#fef3c7", color: "#92400e" },
    info: { bg: "#dbeafe", color: "#0c4a6e" },
    primary: { bg: "#ccf0eb", color: "#004D40" },
  };

  const sizeMap = {
    sm: { padding: "4px 8px", fontSize: "11px" },
    md: { padding: "6px 12px", fontSize: "13px" },
    lg: { padding: "8px 16px", fontSize: "14px" },
  };

  const { bg, color } = variantStyles[variant];
  const { padding, fontSize } = sizeMap[size];

  const badgeStyle = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: bg,
    color: color,
    padding: padding,
    borderRadius: "20px",
    fontSize: fontSize,
    fontWeight: "600",
    cursor: clickable || onRemove ? "pointer" : "default",
    border: "none",
    transition: "all 0.2s ease",
    ...style,
  };

  return (
    <span style={badgeStyle} onClick={onClick} {...props}>
      {Icon && <Icon size={14} />}
      <span>{label}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            padding: "0 2px",
            color: "inherit",
          }}
        >
          ✕
        </button>
      )}
    </span>
  );
};

export default Badge;
