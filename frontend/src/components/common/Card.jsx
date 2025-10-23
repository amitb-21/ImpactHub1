import React from "react";

export const Card = ({
  children,
  className = "",
  onClick,
  shadow = "sm", // sm | md | lg
  padding = "md", // sm | md | lg
  rounded = "md", // sm | md | lg
  hover = false,
  border = false,
  style = {},
  ...props
}) => {
  const shadowMap = {
    sm: "0 1px 3px rgba(0, 0, 0, 0.1)",
    md: "0 4px 12px rgba(0, 0, 0, 0.08)",
    lg: "0 10px 30px rgba(0, 0, 0, 0.12)",
  };

  const paddingMap = {
    sm: "12px",
    md: "20px",
    lg: "28px",
  };

  const roundedMap = {
    sm: "6px",
    md: "10px",
    lg: "16px",
  };

  const cardStyle = {
    backgroundColor: "#FAFAFA",
    borderRadius: roundedMap[rounded],
    padding: paddingMap[padding],
    boxShadow: shadowMap[shadow],
    border: border ? "1px solid #e0e0e0" : "none",
    cursor: onClick ? "pointer" : "default",
    transition: hover ? "all 0.3s ease" : "none",
    ...style,
  };

  const hoverStyle = hover
    ? {
        "&:hover": {
          boxShadow: shadowMap["lg"],
          transform: "translateY(-4px)",
        },
      }
    : {};

  return (
    <div style={cardStyle} onClick={onClick} className={className} {...props}>
      {children}
    </div>
  );
};

export default Card;
