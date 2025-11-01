import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div style={styles.layoutContainer}>
      {/* Navbar */}
      <Navbar onMenuClick={handleMenuClick} />

      {/* Main Content Area */}
      <div style={styles.mainContainer}>
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

        {/* Content */}
        <main style={styles.content}>{children}</main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

const styles = {
  layoutContainer: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100vh",
    backgroundColor: "#FAFAFA",
  },
  mainContainer: {
    display: "flex",
    flex: 1,
  },
  content: {
    flex: 1,
    padding: "30px 20px",
    backgroundColor: "#FAFAFA",
    transition: "margin-left 0.3s ease",
  },

  // Mobile styles
  "@media (maxWidth: 768px)": {
    mainContainer: {
      flexDirection: "column",
    },
    content: {
      marginLeft: 0,
      padding: "20px 15px",
    },
  },
};

export default Layout;
