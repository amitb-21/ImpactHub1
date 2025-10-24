import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import RegisterForm from "../components/auth/RegisterForm";

const Register = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Redirect if user object is present (ensure we don't redirect just because a token exists)
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <RegisterForm />
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "calc(100vh - 70px)",
    backgroundColor: "#FAFAFA",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    width: "100%",
    maxWidth: "500px",
  },
};

export default Register;
