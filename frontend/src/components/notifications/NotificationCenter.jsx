import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  markAsRead,
  removeNotification,
} from "../../store/slices/notificationSlice";
import { timeAgo } from "../../config/helpers";
import { FiCheck, FiX, FiInfo, FiAlertTriangle, FiAward } from "react-icons/fi";
import styles from "./styles/NotificationCenter.module.css";

const NotificationCenter = ({ onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, unreadCount } = useSelector(
    (state) => state.notification
  );

  const handleNavigate = (notification) => {
    if (!notification.read) {
      dispatch(markAsRead(notification.id));
    }
    if (notification.action?.link) {
      navigate(notification.action.link);
    }
    onClose();
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <FiCheck size={18} style={{ color: "#10b981" }} />;
      case "error":
        return <FiX size={18} style={{ color: "#ef4444" }} />;
      case "warning":
        return <FiAlertTriangle size={18} style={{ color: "#f59e0b" }} />;
      case "info":
      default:
        return <FiInfo size={18} style={{ color: "#3b82f6" }} />;
    }
  };

  // Show 5 most recent notifications in the dropdown
  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Notifications ({unreadCount})</h3>
        <button className={styles.closeButton} onClick={onClose}>
          <FiX size={20} />
        </button>
      </div>

      <div className={styles.list}>
        {recentNotifications.length > 0 ? (
          recentNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`${styles.item} ${
                !notif.read ? styles.itemUnread : ""
              }`}
              onClick={() => handleNavigate(notif)}
            >
              <div
                className={styles.icon}
                style={{
                  backgroundColor: `var(--color-${notif.type}-bg, #f0f0f0)`,
                }}
              >
                {getIcon(notif.type)}
              </div>
              <div className={styles.content}>
                <p className={styles.message}>{notif.message}</p>
                <span className={styles.time}>{timeAgo(notif.timestamp)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <FiAward size={32} />
            <p>All caught up!</p>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button
          className={styles.viewAllButton}
          onClick={() => {
            navigate("/notifications");
            onClose();
          }}
        >
          View All Notifications
        </button>
      </div>
    </div>
  );
};

export default NotificationCenter;
