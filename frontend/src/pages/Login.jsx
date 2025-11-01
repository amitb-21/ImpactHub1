import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoginForm from "../components/auth/LoginForm";
import { getCurrentUser } from "../store/slices/authSlice";
import { useDispatch } from "react-redux";
import styles from "./styles/Login.module.css";

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
    <div className={styles.page}>
      {/* Animated Background Elements */}
      <div className={styles.backgroundShapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
      </div>

      {/* Left Side - Branding & Info */}
      <div className={styles.brandingSection}>
        <div className={styles.brandingContent}>
          <div className={styles.logoContainer}>
            <div className={styles.logo}>🌍</div>
            <h1 className={styles.brandTitle}>ImpactHub</h1>
          </div>
          
          <h2 className={styles.tagline}>
            Do a small noble act,
            <br />
            <span className={styles.taglineAccent}>To put a large impact!</span>
          </h2>
          
          <p className={styles.description}>
            <p> We are a platform, you are the performers</p>
             We want to transform, you are the transformers!
          </p>

          <div className={styles.features}>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>🎯</span>
              <div>
                <div className={styles.featureTitle}>Find Your Cause</div>
                <div className={styles.featureDesc}>Connect with meaningful opportunities</div>
              </div>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>👥</span>
              <div>
                <div className={styles.featureTitle}>Build Community</div>
                <div className={styles.featureDesc}>Collaborate with like-minded people</div>
              </div>
            </div>
            <div className={styles.featureItem}>
              <span className={styles.featureIcon}>⭐</span>
              <div>
                <div className={styles.featureTitle}>Track Impact</div>
                <div className={styles.featureDesc}>See your real-world difference</div>
              </div>
            </div>
          </div>

          <div className={styles.stats}>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>5000+</div>
              <div className={styles.statLabel}>Active Volunteers</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>500+</div>
              <div className={styles.statLabel}>Communities</div>
            </div>
            <div className={styles.statDivider}></div>
            <div className={styles.statItem}>
              <div className={styles.statNumber}>2000+</div>
              <div className={styles.statLabel}>Events Hosted</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form Only */}
      <div className={styles.formSection}>
        <div className={styles.formContainer}>
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default Login;