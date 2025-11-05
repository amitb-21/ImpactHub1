import React, { useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  clearAllNotifications,
  markAllAsRead,
} from "../store/slices/notificationSlice";
import Layout from "../components/common/Layout";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import NotificationCard from "../components/notifications/NotificationCard";
import { FiInbox, FiCheck, FiTrash } from "react-icons/fi";
import styles from "./styles/Notifications.module.css";

const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector(
    (state) => state.notification
  );
  const [filter, setFilter] = useState("all"); // 'all' | 'unread'

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, filter]);

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      dispatch(clearAllNotifications());
    }
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  return (
    <Layout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Notifications</h1>
          <div className={styles.actions}>
            <Button
              variant="outline"
              size="sm"
              icon={FiCheck}
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
            >
              Mark All as Read
            </Button>
            <Button
              variant="danger"
              size="sm"
              icon={FiTrash}
              onClick={handleClearAll}
              disabled={notifications.length === 0}
            >
              Clear All
            </Button>
          </div>
        </div>

        <Card padding="lg" shadow="md">
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${
                filter === "all" ? styles.tabActive : ""
              }`}
              onClick={() => setFilter("all")}
            >
              All ({notifications.length})
            </button>
            <button
              className={`${styles.tab} ${
                filter === "unread" ? styles.tabActive : ""
              }`}
              onClick={() => setFilter("unread")}
            >
              Unread ({unreadCount})
            </button>
          </div>

          <div className={styles.list}>
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
                <NotificationCard key={notif.id} notification={notif} />
              ))
            ) : (
              <div className={styles.emptyState}>
                <FiInbox size={48} />
                <h3>
                  {filter === "unread"
                    ? "All caught up!"
                    : "No notifications yet"}
                </h3>
                <p>
                  {filter === "unread"
                    ? "You have no unread notifications."
                    : "New notifications will appear here."}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Notifications;
