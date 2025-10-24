import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoginForm from "../components/auth/LoginForm";

const Login = () => {
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
        <LoginForm />
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
    maxWidth: "450px",
  },
};

export default Login;
