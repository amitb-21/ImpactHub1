import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks";
import {
  FiHome,
  FiCalendar,
  FiUsers,
  FiTrendingUp,
  FiBook,
  FiActivity,
  FiSettings,
  FiX,
  FiAward, // --- ADDED ---
  FiGlobe, // --- ADDED ---
} from "react-icons/fi";

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { isAdmin, isModerator } = useAuth();

  const isActive = (path) => location.pathname.startsWith(path);

  const menuItems = [
    {
      label: "Home",
      path: "/",
      icon: FiHome,
    },
    {
      label: "Events",
      path: "/events",
      icon: FiCalendar,
    },
    {
      label: "Communities",
      path: "/communities",
      icon: FiUsers,
    },
    {
      label: "My Impact", // --- RENAMED ---
      path: "/impact",
      icon: FiTrendingUp, // --- CHANGED ICON ---
    },
    {
      label: "Leaderboard", // --- NEW ---
      path: "/leaderboard",
      icon: FiAward,
    },
    {
      label: "Platform Stats", // --- NEW ---
      path: "/impact/summary",
      icon: FiGlobe,
    },
    {
      label: "Resources",
      path: "/resources",
      icon: FiBook,
    },
    {
      label: "Activity",
      path: "/activity",
      icon: FiActivity,
    },
  ];

  const adminMenuItems = [
    {
      label: "Admin Panel",
      path: "/admin",
      icon: FiSettings,
    },
  ];

  const handleLinkClick = () => {
    onClose?.();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div style={styles.overlay} onClick={onClose} />}

      {/* Sidebar */}
      <aside
        style={{
          ...styles.sidebar,
          ...(isOpen ? styles.sidebarOpen : styles.sidebarClosed),
        }}
      >
        {/* Close Button (Mobile) */}
        <button style={styles.closeBtn} onClick={onClose}>
          <FiX size={24} color="#FAFAFA" />
        </button>

        {/* Menu Items */}
        <nav style={styles.nav}>
          <div style={styles.menuSection}>
            <h3 style={styles.sectionTitle}>Main</h3>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleLinkClick}
                  style={{
                    ...styles.menuItem,
                    ...(active ? styles.menuItemActive : {}),
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Admin Section */}
          {isAdmin?.() && (
            <div style={styles.menuSection}>
              <h3 style={styles.sectionTitle}>Admin</h3>
              {adminMenuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleLinkClick}
                    style={{
                      ...styles.menuItem,
                      ...(active ? styles.menuItemActive : {}),
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}

          {/* Moderator Section */}
          {isModerator?.() && !isAdmin?.() && (
            <div style={styles.menuSection}>
              <h3 style={styles.sectionTitle}>Moderation</h3>
              <Link
                to="/moderation"
                onClick={handleLinkClick}
                style={{
                  ...styles.menuItem,
                  ...(isActive("/moderation") ? styles.menuItemActive : {}),
                }}
              >
                <FiSettings size={18} />
                <span>Moderation</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.version}>ImpactHub v1.0</p>
        </div>
      </aside>
    </>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 99,
  },
  sidebar: {
    position: "fixed",
    left: 0,
    top: "70px",
    width: "250px",
    height: "calc(100vh - 70px)",
    backgroundColor: "#004D40",
    overflowY: "auto",
    boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
    zIndex: 100,
    transition: "transform 0.3s ease",
  },
  sidebarOpen: {
    transform: "translateX(0)",
  },
  sidebarClosed: {
    transform: "translateX(-100%)",
  },
  closeBtn: {
    display: "none",
    position: "absolute",
    top: "15px",
    right: "15px",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "5px",
    "@media (maxWidth: 768px)": {
      display: "block",
    },
  },
  nav: {
    padding: "20px 0",
  },
  menuSection: {
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#FFB300",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    padding: "0 15px",
    marginBottom: "10px",
  },
  menuItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 15px",
    color: "#FAFAFA",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    borderLeft: "3px solid transparent",
  },
  menuItemActive: {
    backgroundColor: "#00796B",
    color: "#FFB300",
    borderLeftColor: "#FFB300",
  },
  footer: {
    position: "absolute",
    bottom: "20px",
    left: 0,
    right: 0,
    padding: "0 15px",
  },
  version: {
    fontSize: "12px",
    color: "rgba(250,250,250,0.6)",
    margin: 0,
    textAlign: "center",
  },
};

export default Sidebar;
