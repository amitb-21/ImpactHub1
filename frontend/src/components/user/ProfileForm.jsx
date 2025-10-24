import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { z } from "zod";
import { updateUserProfile } from "../../store/slices/userSlice";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Loader } from "../common/Loader";
import { Modal } from "../common/Modal";
import {
  FiUser,
  FiMail,
  FiMapPin,
  FiEdit,
  FiUpload,
  FiX,
  FiAlertCircle,
} from "react-icons/fi";

// Validation schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  location: z.string().optional(),
});

const ProfileForm = ({ user, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { isUpdating, error } = useSelector((state) => state.user);
  const [profileImage, setProfileImage] = useState(user?.profileImage || null);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || null);
  const [imageFile, setImageFile] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      bio: user?.bio || "",
      location: user?.location || "",
    },
  });

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }

      setImageFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("bio", data.bio || "");
    formData.append("location", data.location || "");

    if (imageFile) {
      formData.append("profileImage", imageFile);
    }

    const result = await dispatch(
      updateUserProfile({
        userId: user._id,
        data: formData,
      })
    );

    if (result.payload) {
      onSuccess?.();
      onClose?.();
    }
  };

  return (
    <div>
      {/* Form Card */}
      <Card padding="lg" shadow="md" style={styles.card}>
        <h2 style={styles.title}>Edit Profile</h2>

        {/* Error Alert */}
        {error && (
          <div style={styles.errorAlert}>
            <FiAlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Profile Picture Section */}
        <div style={styles.imageSection}>
          <div style={styles.imageContainer}>
            {imagePreview ? (
              <img src={imagePreview} alt="Profile" style={styles.image} />
            ) : (
              <div style={styles.imagePlaceholder}>
                <span style={styles.imageInitial}>
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            )}
            <label style={styles.imageUploadLabel}>
              <FiUpload size={20} />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </label>
          </div>
          <div style={styles.imageInfo}>
            <p style={styles.imageTitle}>Profile Picture</p>
            <p style={styles.imageDescription}>JPG, PNG or GIF. Max size 5MB</p>
            {imageFile && (
              <button
                type="button"
                onClick={() => {
                  setImageFile(null);
                  setImagePreview(user?.profileImage || null);
                }}
                style={styles.removeButton}
              >
                <FiX size={16} /> Remove
              </button>
            )}
          </div>
        </div>

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

          {/* Location Field */}
          <div style={styles.formGroup}>
            <label htmlFor="location" style={styles.label}>
              Location
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

          {/* Bio Field */}
          <div style={styles.formGroup}>
            <label htmlFor="bio" style={styles.label}>
              Bio
            </label>
            <textarea
              id="bio"
              placeholder="Tell us about yourself (max 500 characters)"
              {...register("bio")}
              style={{
                ...styles.textarea,
                ...(errors.bio && styles.inputError),
              }}
            />
            {errors.bio && (
              <span style={styles.errorMessage}>{errors.bio.message}</span>
            )}
          </div>

          {/* Buttons */}
          <div style={styles.buttonGroup}>
            <Button
              type="submit"
              variant="primary"
              size="md"
              fullWidth
              loading={isUpdating}
              disabled={isUpdating}
              style={{ marginRight: "12px" }}
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="md"
              fullWidth
              onClick={onClose}
              disabled={isUpdating}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const styles = {
  card: {
    width: "100%",
    maxWidth: "600px",
    margin: "0 auto",
  },
  title: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#212121",
    margin: "0 0 24px 0",
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
  imageSection: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    padding: "24px",
    backgroundColor: "#f9f9f9",
    borderRadius: "12px",
    marginBottom: "24px",
    border: "1px solid #e0e0e0",
  },
  imageContainer: {
    position: "relative",
    width: "120px",
    height: "120px",
    flexShrink: 0,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #00796B",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    backgroundColor: "#00796B",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "4px solid #00796B",
  },
  imageInitial: {
    fontSize: "48px",
    fontWeight: "700",
    color: "#FAFAFA",
  },
  imageUploadLabel: {
    position: "absolute",
    bottom: "0",
    right: "0",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "#FFB300",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#212121",
    border: "3px solid #FAFAFA",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "all 0.3s ease",
  },
  imageInfo: {
    flex: 1,
  },
  imageTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#212121",
    margin: "0 0 4px 0",
  },
  imageDescription: {
    fontSize: "13px",
    color: "#666",
    margin: "0 0 12px 0",
  },
  removeButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "8px 12px",
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fca5a5",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
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
  textarea: {
    width: "100%",
    padding: "12px 16px",
    fontSize: "14px",
    border: "1.5px solid #e0e0e0",
    borderRadius: "8px",
    backgroundColor: "#FAFAFA",
    color: "#212121",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    outline: "none",
    resize: "vertical",
    minHeight: "120px",
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
  errorMessage: {
    fontSize: "12px",
    color: "#ef4444",
    fontWeight: "500",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "1px solid #e0e0e0",
  },
};

export default ProfileForm;
