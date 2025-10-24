import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import RegisterForm from "../components/auth/RegisterForm";

const Register = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <RegisterForm />
      </div>
    </div>
  );
};

const pageStyles = {
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
