import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Loader } from "./common/Loader";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Show loader while checking authentication
  if (isLoading) {
    return (
      <div style={styles.loaderContainer}>
        <Loader size="lg" fullScreen={true} text="Loading..." />
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Has required role check
  if (requiredRole) {
    // Check if user has the required role
    if (!user || (user.role !== requiredRole && user.role !== "admin")) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // All checks passed - render children
  return children;
};

export default ProtectedRoute;

const styles = {
  loaderContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#FAFAFA",
  },
};
