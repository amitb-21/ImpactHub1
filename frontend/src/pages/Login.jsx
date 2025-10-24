import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoginForm from "../components/auth/LoginForm";
import { getCurrentUser } from "../store/slices/authSlice";
import { useDispatch } from "react-redux";

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const dispatch = useDispatch();

  // If redirected back from OAuth provider with a token, store it and load user
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("token", token);
      // remove token from URL for cleanliness
      const url = new URL(window.location.href);
      url.searchParams.delete("token");
      window.history.replaceState(
        {},
        document.title,
        url.pathname + url.search
      );
      // load current user
      dispatch(getCurrentUser());
      navigate("/dashboard");
    }
  }, [dispatch, navigate]);

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
