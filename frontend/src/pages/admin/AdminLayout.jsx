import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  FiGrid,
  FiUsers,
  FiBriefcase,
  FiCheckSquare,
  FiBookOpen,
  FiActivity,
  FiLogOut,
  FiBarChart2,
} from "react-icons/fi";

// Basic inline styles for layout
const styles = {
  layout: { display: "flex", minHeight: "100vh", backgroundColor: "#f5f7fa" },
  sidebar: {
    width: "240px",
    backgroundColor: "#004D40", // Darker teal
    color: "#FAFAFA",
    display: "flex",
    flexDirection: "column",
    padding: "20px 0",
    position: "fixed",
    top: 0,
    bottom: 0,
    left: 0,
    zIndex: 100,
    boxShadow: "2px 0 8px rgba(0,0,0,0.1)",
  },
  logo: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#FFB300", // Accent color
    textAlign: "center",
    padding: "0 20px 20px 20px",
    borderBottom: "1px solid #00796B",
    textDecoration: "none",
  },
  nav: { flex: 1, overflowY: "auto", paddingTop: "20px" },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 20px",
    color: "rgba(255, 255, 255, 0.8)",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s ease",
    borderLeft: "3px solid transparent",
  },
  navLinkActive: {
    backgroundColor: "#00796B",
    color: "#FFFFFF",
    borderLeft: "3px solid #FFB300",
  },
  footer: { padding: "20px", borderTop: "1px solid #00796B" },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 20px",
    color: "rgba(255, 255, 255, 0.8)",
    background: "none",
    border: "none",
    width: "100%",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    borderRadius: "6px",
  },
  logoutButtonHover: {
    backgroundColor: "#00796B",
  },
  content: {
    marginLeft: "240px", // Same as sidebar width
    flex: 1,
    padding: "30px",
    maxWidth: "calc(100% - 240px)",
  },
};

const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getNavLinkStyle = ({ isActive }) =>
    isActive ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink;

  return (
    <div style={styles.layout}>
      <aside style={styles.sidebar}>
        <NavLink to="/admin" style={styles.logo}>
          ImpactHub Admin
        </NavLink>

        <nav style={styles.nav}>
          <NavLink to="/admin" end style={getNavLinkStyle}>
            <FiGrid size={18} /> Dashboard
          </NavLink>
          <NavLink to="/admin/users" style={getNavLinkStyle}>
            <FiUsers size={18} /> Users
          </NavLink>
          <NavLink to="/admin/communities" style={getNavLinkStyle}>
            <FiBriefcase size={18} /> Communities
          </NavLink>
          <NavLink to="/admin/verification" style={getNavLinkStyle}>
            <FiCheckSquare size={18} /> Verification
          </NavLink>
          <NavLink to="/admin/resources" style={getNavLinkStyle}>
            <FiBookOpen size={18} /> Resources
          </NavLink>
          <NavLink to="/admin/analytics" style={getNavLinkStyle}>
            <FiBarChart2 size={18} /> Analytics
          </NavLink>
          <NavLink to="/admin/audit-log" style={getNavLinkStyle}>
            <FiActivity size={18} /> Audit Log
          </NavLink>
        </nav>

        <footer style={styles.footer}>
          <button
            onClick={handleLogout}
            style={styles.logoutButton}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                styles.navLinkActive.backgroundColor)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <FiLogOut size={18} /> Logout
          </button>
        </footer>
      </aside>

      <main style={styles.content}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
