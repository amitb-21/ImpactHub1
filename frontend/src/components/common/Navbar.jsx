// frontend/src/components/common/Navbar.jsx
import React, { useState } from "react";
import { useAuth } from "../../hooks";
import { useSocket } from "../../hooks";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMenu,
  FiX,
  FiBell,
  FiLogOut,
  FiHome,
  FiSearch,
  FiBriefcase,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import Modal from "./Modal";
import UserSearch from "../user/UserSearch";
import NotificationCenter from "../notifications/NotificationCenter";

const Navbar = ({ onMenuClick }) => {
  const { user, isAuthenticated, isModerator, isAdmin, logout } = useAuth();
  const { joinAdmin } = useSocket();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = useSelector((state) => state.notification.unreadCount);

  const handleLogout = async () => {
    try {
      await (typeof logout === "function" ? logout() : Promise.resolve());
    } catch (err) {
      console.error("Logout failed:", err);
      localStorage.removeItem("token");
    } finally {
      navigate("/");
    }
  };

  const handleUserSelect = (selectedUser) => {
    setShowUserSearch(false);
    navigate(`/profile/${selectedUser._id}`);
  };

  React.useEffect(() => {
    if (isAdmin?.()) {
      joinAdmin?.();
    }
  }, [isAdmin, joinAdmin]);

  const isRegularUser = isAuthenticated && user?.role === "user";

  return (
    <>
      <nav className="navbar" style={styles.navbar}>
        {/* Mobile Menu Button */}
        <button
          className="menu-toggle"
          onClick={onMenuClick}
          style={styles.menuToggle}
        >
          <FiMenu size={24} color="#FAFAFA" />
        </button>

        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoText}>ImpactHub</span>
        </Link>

        {/* Center Navigation (Desktop) */}
        <div style={styles.navLinks}>
          <Link to="/events" style={styles.navLink}>
            Events
          </Link>
          <Link to="/communities" style={styles.navLink}>
            Communities
          </Link>
          <Link to="/impact" style={styles.navLink}>
            Impact
          </Link>
          <Link to="/resources" style={styles.navLink}>
            Resources
          </Link>
        </div>

        {/* Right Section */}
        <div style={styles.rightSection}>
          {isAuthenticated ? (
            <>
              {/* User Search Button */}
              <button
                style={styles.searchBtn}
                onClick={() => setShowUserSearch(true)}
                title="Search Users"
              >
                <FiSearch size={20} color="#FAFAFA" />
              </button>

              {/* Notifications Bell */}
              <div style={styles.notificationContainer}>
                <button
                  style={styles.notificationBtn}
                  onClick={() => setShowNotifications(!showNotifications)}
                  title="Notifications"
                >
                  <FiBell size={20} color="#FAFAFA" />
                  {unreadCount > 0 && (
                    <span style={styles.badge}>{unreadCount}</span>
                  )}
                </button>
                {showNotifications && (
                  <NotificationCenter
                    onClose={() => setShowNotifications(false)}
                  />
                )}
              </div>

              {/* User Menu */}
              <div style={styles.userMenuContainer}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  style={styles.userBtn}
                >
                  <img
                    src={user?.profileImage || "https://via.placeholder.com/32"}
                    alt={user?.name}
                    style={styles.avatar}
                  />
                  <span style={styles.userName}>
                    {user?.name?.split(" ")[0]}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div style={styles.dropdown}>
                    {/* FIXED: Dashboard Link Added */}
                    <Link
                      to="/dashboard"
                      style={styles.dropdownItem}
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FiHome size={16} />
                      <span>Dashboard</span>
                    </Link>

                    {/* REMOVED: Profile Link that was here */}

                    {isRegularUser && (
                      <Link
                        to="/apply-community-manager"
                        style={styles.dropdownItem}
                        onClick={() => setShowUserMenu(false)}
                      >
                        <FiBriefcase size={16} />
                        <span>Become a Manager</span>
                      </Link>
                    )}

                    {isAdmin?.() && (
                      <Link
                        to="/admin"
                        style={styles.dropdownItem}
                        onClick={() => setShowUserMenu(false)}
                      >
                        <span>⚙️ Admin Panel</span>
                      </Link>
                    )}

                    {isModerator?.() && (
                      <Link
                        to="/moderation"
                        style={styles.dropdownItem}
                        onClick={() => setShowUserMenu(false)}
                      >
                        <span>👮 Moderation</span>
                      </Link>
                    )}

                    <button onClick={handleLogout} style={styles.dropdownItem}>
                      <FiLogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.registerBtn}>
                Login
              </Link>
              <Link to="/register" style={styles.registerBtn}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* User Search Modal */}
      <Modal
        isOpen={showUserSearch}
        onClose={() => setShowUserSearch(false)}
        title="Search Users"
        size="lg"
      >
        <UserSearch onUserSelect={handleUserSelect} excludeUserId={user?._id} />
      </Modal>
    </>
  );
};

const styles = {
  navbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    backgroundColor: "#00796B",
    height: "70px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  menuToggle: {
    display: "none",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px",
  },
  logo: {
    textDecoration: "none",
    marginRight: "auto",
  },
  logoText: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#FAFAFA",
    letterSpacing: "0.5px",
  },
  navLinks: {
    display: "flex",
    gap: "30px",
    marginLeft: "40px",
  },
  navLink: {
    color: "#FAFAFA",
    textDecoration: "none",
    fontSize: "15px",
    fontWeight: "500",
    transition: "color 0.3s ease",
    cursor: "pointer",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    marginLeft: "auto",
  },
  searchBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "8px",
    display: "flex",
    alignItems: "center",
    transition: "opacity 0.3s ease",
  },
  notificationContainer: {
    position: "relative",
  },
  notificationBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    position: "relative",
    padding: "8px",
    display: "flex",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: "0",
    right: "0",
    backgroundColor: "#FFB300",
    color: "#212121",
    borderRadius: "50%",
    width: "20px",
    height: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "700",
  },
  userMenuContainer: {
    position: "relative",
  },
  userBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "none",
    border: "2px solid #FAFAFA",
    borderRadius: "20px",
    padding: "6px 12px",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  userName: {
    color: "#FAFAFA",
    fontSize: "14px",
    fontWeight: "500",
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    backgroundColor: "#FAFAFA",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    minWidth: "200px",
    marginTop: "10px",
    overflow: "hidden",
    zIndex: 1000,
  },
  dropdownItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    color: "#212121",
    textDecoration: "none",
    fontSize: "14px",
    cursor: "pointer",
    borderBottom: "1px solid #f0f0f0",
    transition: "background 0.2s ease",
    background: "none",
    border: "none",
    width: "100%",
    textAlign: "left",
  },
  authLink: {
    color: "#FAFAFA",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    padding: "8px 16px",
    cursor: "pointer",
    transition: "color 0.3s ease",
  },
  registerBtn: {
    backgroundColor: "#FFB300",
    color: "#212121",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "600",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background 0.3s ease",
  },
};

export default Navbar;
