import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../store/slices/authSlice";
import { loginSchema } from "../../config/validators";
import Button from "../common/Button";
import { API_URL } from "../../config/constants";
import { FiMail, FiLock, FiAlertCircle } from "react-icons/fi";
import googleIcon from '../../assets/google.png';

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const result = await dispatch(loginUser(data));

    if (result.payload?.token) {
      navigate("/dashboard");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Sign in to continue to ImpactHub</p>
          <a
            href="/"
            style={styles.backLink}
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
          >
            ← Back to Home
          </a>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={styles.errorAlert}>
            <FiAlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          {/* Email Field */}
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Email Address
            </label>
            <div style={styles.inputWrapper}>
              <FiMail style={styles.inputIcon} />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                {...register("email")}
                style={{
                  ...styles.input,
                  ...(errors.email && styles.inputError),
                }}
              />
            </div>
            {errors.email && (
              <span style={styles.errorMessage}>{errors.email.message}</span>
            )}
          </div>

          {/* Password Field */}
          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <div style={styles.inputWrapper}>
              <FiLock style={styles.inputIcon} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                style={{
                  ...styles.input,
                  ...(errors.password && styles.inputError),
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.toggleButton}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.password && (
              <span style={styles.errorMessage}>{errors.password.message}</span>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Divider */}
        <div style={styles.divider}>
          <span style={styles.dividerText}>Or continue with</span>
        </div>

        {/* Google OAuth Button */}
       <Button
  type="button"
  variant="outline"
  size="md"
  fullWidth
  onClick={() => {
    // Redirect to Google OAuth on backend
    window.location.href = `${API_URL}/auth/google`;
  }}
>
  <span style={styles.googleIcon}>
<img
  src={googleIcon}
  alt="Google Icon"
  height="24"
  width="34"
  style={{ marginRight: '8px' }}
/>
  </span>
  Continue with Google
</Button>


        {/* Footer Links */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Don't have an account?{" "}
            <a href="/register" style={styles.link}>
              Sign up
            </a>
          </p>
          <p style={styles.footerText}>
            <a href="/forgot-password" style={styles.link}>
              Forgot password?
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  backLink: {
    display: "inline-block",
    color: "#00796B",
    textDecoration: "none",
    fontSize: "14px",
    marginTop: "8px",
    cursor: "pointer",
    transition: "color 0.2s",
  },
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "calc(100vh - 70px)",
    backgroundColor: "#FAFAFA",
    padding: "20px",
  },
  formWrapper: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#FAFAFA",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    padding: "40px",
    border: "1px solid #e0e0e0",
  },
  header: {
    marginBottom: "32px",
    textAlign: "center",
  },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#212121",
    margin: 0,
    marginBottom: "8px",
  },
  subtitle: {
    fontSize: "14px",
    color: "#666",
    margin: 0,
  },
  errorAlert: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: "8px",
    marginBottom: "20px",
    fontSize: "13px",
    fontWeight: "500",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    marginBottom: "24px",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#212121",
    display: "block",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "12px 16px 12px 40px",
    fontSize: "14px",
    border: "1.5px solid #e0e0e0",
    borderRadius: "8px",
    backgroundColor: "#FAFAFA",
    color: "#212121",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    outline: "none",
  },
  inputError: {
    borderColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  inputIcon: {
    position: "absolute",
    left: "12px",
    color: "#00796B",
    size: "18px",
    pointerEvents: "none",
  },
  toggleButton: {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    padding: "4px 8px",
  },
  errorMessage: {
    fontSize: "12px",
    color: "#ef4444",
    fontWeight: "500",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "24px 0",
  },
  dividerText: {
    fontSize: "12px",
    color: "#999",
    fontWeight: "500",
  },
  googleIcon: {
    marginRight: "6px",
  },
  footer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "1px solid #e0e0e0",
  },
  footerText: {
    fontSize: "13px",
    color: "#666",
    margin: 0,
  },
  link: {
    color: "#00796B",
    textDecoration: "none",
    fontWeight: "600",
    cursor: "pointer",
    transition: "color 0.2s ease",
  },
};

export default LoginForm;
