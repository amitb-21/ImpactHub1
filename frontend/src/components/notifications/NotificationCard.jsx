import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  markAsRead,
  removeNotification,
} from "../../store/slices/notificationSlice";
import { timeAgo } from "../../config/helpers";
import {
  FiCheck,
  FiX,
  FiInfo,
  FiAlertTriangle,
  FiAward,
  FiStar,
  FiCalendar,
  FiUsers,
  FiBook,
} from "react-icons/fi";
import styles from "./styles/NotificationCard.module.css";

const NotificationCard = ({ notification }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (!notification.read) {
      dispatch(markAsRead(notification.id));
    }
    if (notification.action?.link) {
      navigate(notification.action.link);
    }
  };

  const handleMarkAsRead = (e) => {
    e.stopPropagation();
    dispatch(markAsRead(notification.id));
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    dispatch(removeNotification(notification.id));
  };

  const getIcon = (type, icon) => {
    if (icon) {
      const iconMap = {
        "⭐": <FiStar size={20} />,
        "🏆": <FiAward size={20} />,
        "✓": <FiCheck size={20} />,
        "📅": <FiCalendar size={20} />,
        "👥": <FiUsers size={20} />,
        "📖": <FiBook size={20} />,
      };
      if (iconMap[icon]) {
        return React.cloneElement(iconMap[icon], {
          style: { color: "var(--color-success, #10b981)" },
        });
      }
    }
    switch (type) {
      case "success":
        return (
          <FiCheck
            size={20}
            style={{ color: "var(--color-success, #10b981)" }}
          />
        );
      case "error":
        return (
          <FiX size={20} style={{ color: "var(--color-error, #ef4444)" }} />
        );
      case "warning":
        return (
          <FiAlertTriangle
            size={20}
            style={{ color: "var(--color-warning, #f59e0b)" }}
          />
        );
      case "info":
      default:
        return (
          <FiInfo size={20} style={{ color: "var(--color-info, #3b82f6)" }} />
        );
    }
  };

  const type = notification.type || "info";
  const icon = notification.icon || null;

  return (
    <div
      className={`${styles.card} ${!notification.read ? styles.unread : ""} ${
        styles[type]
      }`}
      onClick={handleNavigate}
    >
      <div
        className={styles.icon}
        style={{ backgroundColor: `var(--color-${type}-bg, #f0f0f0)` }}
      >
        {getIcon(type, icon)}
      </div>
      <div className={styles.content}>
        <div className={styles.header}>
          <h4 className={styles.title}>{notification.title}</h4>
          <span className={styles.time}>{timeAgo(notification.timestamp)}</span>
        </div>
        <p className={styles.message}>{notification.message}</p>
        <div className={styles.actions}>
          {notification.action?.label && (
            <button className={styles.actionButton}>
              {notification.action.label}
            </button>
          )}
        </div>
      </div>
      <div className={styles.controls}>
        {!notification.read && (
          <button
            className={styles.controlButton}
            title="Mark as read"
            onClick={handleMarkAsRead}
          >
            <span className={styles.unreadDot} />
          </button>
        )}
        <button
          className={styles.controlButton}
          title="Remove notification"
          onClick={handleRemove}
        >
          <FiX size={16} />
        </button>
      </div>
    </div>
  );
};

export default NotificationCard;
