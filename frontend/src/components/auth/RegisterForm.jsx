import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../store/slices/authSlice";
import { registerSchema } from "../../config/validators";
import Button from "../common/Button";
import {
  FiUser,
  FiMail,
  FiLock,
  FiMapPin,
  FiAlertCircle,
  FiCheck,
} from "react-icons/fi";

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password");

  const onSubmit = async (data) => {
    if (!agreeToTerms) {
      alert("Please agree to the terms and conditions");
      return;
    }

    const result = await dispatch(registerUser(data));

    if (result.payload?.token) {
      navigate("/dashboard");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>
            Join ImpactHub and start making a difference
          </p>
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
          {/* Name Field */}
          <div style={styles.formGroup}>
            <label htmlFor="name" style={styles.label}>
              Full Name
            </label>
            <div style={styles.inputWrapper}>
              <FiUser style={styles.inputIcon} />
              <input
                id="name"
                type="text"
                placeholder="John Doe"
                {...register("name")}
                style={{
                  ...styles.input,
                  ...(errors.name && styles.inputError),
                }}
              />
            </div>
            {errors.name && (
              <span style={styles.errorMessage}>{errors.name.message}</span>
            )}
          </div>

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
            <p style={styles.hint}>
              {password && password.length >= 6 ? (
                <>
                  <FiCheck
                    size={14}
                    style={{
                      display: "inline",
                      marginRight: "4px",
                      color: "#10b981",
                    }}
                  />
                  Strong password
                </>
              ) : (
                "At least 6 characters"
              )}
            </p>
          </div>

          {/* Location Field (Optional) */}
          <div style={styles.formGroup}>
            <label htmlFor="location" style={styles.label}>
              Location <span style={styles.optional}>(Optional)</span>
            </label>
            <div style={styles.inputWrapper}>
              <FiMapPin style={styles.inputIcon} />
              <input
                id="location"
                type="text"
                placeholder="City, Country"
                {...register("location")}
                style={{
                  ...styles.input,
                  ...(errors.location && styles.inputError),
                }}
              />
            </div>
            {errors.location && (
              <span style={styles.errorMessage}>{errors.location.message}</span>
            )}
          </div>

          {/* Terms Checkbox */}
          <div style={styles.checkboxGroup}>
            <input
              id="terms"
              type="checkbox"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              style={styles.checkbox}
            />
            <label htmlFor="terms" style={styles.checkboxLabel}>
              I agree to the{" "}
              <a href="/terms" style={styles.link}>
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" style={styles.link}>
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={isLoading}
            disabled={isLoading || !agreeToTerms}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
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
            window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
          }}
        >
          <span style={styles.googleIcon}>🔐</span> Google
        </Button>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            Already have an account?{" "}
            <a href="/login" style={styles.link}>
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
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
    maxWidth: "480px",
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
    gap: "18px",
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
    display: "flex",
    gap: "4px",
  },
  optional: {
    fontSize: "12px",
    fontWeight: "400",
    color: "#999",
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
  hint: {
    fontSize: "12px",
    color: "#666",
    margin: "4px 0 0 0",
    display: "flex",
    alignItems: "center",
  },
  checkboxGroup: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginTop: "8px",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
    accentColor: "#00796B",
  },
  checkboxLabel: {
    fontSize: "13px",
    color: "#666",
    cursor: "pointer",
    margin: 0,
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
    gap: "8px",
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
  },
};

export default RegisterForm;
