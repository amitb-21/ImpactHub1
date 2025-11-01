import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import RegisterForm from "../components/auth/RegisterForm";
import styles from "./styles/Register.module.css";

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
    <div className={styles.page}>
      {/* Animated Background Elements */}
      <div className={styles.backgroundShapes}>
        <div className={styles.shape1}></div>
        <div className={styles.shape2}></div>
        <div className={styles.shape3}></div>
      </div>

      {/* Left Side - Benefits & Info */}
      <div className={styles.brandingSection}>
        <div className={styles.brandingContent}>
          <div className={styles.logoContainer}>
            <div className={styles.logo}>🌍</div>
            <h1 className={styles.brandTitle}>ImpactHub</h1>
          </div>
          
          <h2 className={styles.tagline}>
            Start Your Impact Journey
            <br />
            <span className={styles.taglineAccent}>Join Our Community Today</span>
          </h2>
          
          <p className={styles.description}>
            Create your free account and become part of a global movement making real positive change in communities worldwide.
          </p>

          <div className={styles.benefits}>
            <div className={styles.benefitItem}>
              <span className={styles.benefitIcon}>🚀</span>
              <div>
                <div className={styles.benefitTitle}>Get Started Instantly</div>
                <div className={styles.benefitDesc}>Sign up in seconds and explore opportunities</div>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <span className={styles.benefitIcon}>🎯</span>
              <div>
                <div className={styles.benefitTitle}>Discover Events</div>
                <div className={styles.benefitDesc}>Find volunteer opportunities that match your passion</div>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <span className={styles.benefitIcon}>🏆</span>
              <div>
                <div className={styles.benefitTitle}>Earn Rewards</div>
                <div className={styles.benefitDesc}>Gain points, badges, and recognition for your work</div>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <span className={styles.benefitIcon}>📊</span>
              <div>
                <div className={styles.benefitTitle}>Track Progress</div>
                <div className={styles.benefitDesc}>Monitor your impact with detailed analytics</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form Only */}
      <div className={styles.formSection}>
        <div className={styles.formContainer}>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};

export default Register;