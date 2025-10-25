import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { useGeolocation } from "../../hooks/useGeolocation";
import {
  createCommunity,
  updateCommunity,
} from "../../store/slices/communitySlice";
import { communitySchema } from "../../config/validators";
import { COMMUNITY_CATEGORIES } from "../../config/constants";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Modal } from "../common/Modal";
import { Loader } from "../common/Loader";
import {
  FiMapPin,
  FiUpload,
  FiX,
  FiAlertCircle,
  FiCheck,
} from "react-icons/fi";

const CommunityForm = ({ community = null, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { isCreating, isUpdating, error } = useSelector(
    (state) => state.community
  );
  const {
    requestLocation,
    latitude,
    longitude,
    error: locationError,
  } = useGeolocation();
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [communityImage, setCommunityImage] = useState(
    community?.image || null
  );
  const [imagePreview, setImagePreview] = useState(community?.image || null);
  const [imageFile, setImageFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(communitySchema),
    defaultValues: {
      name: community?.name || "",
      description: community?.description || "",
      category: community?.category || "",
      location: {
        address: community?.location?.address || "",
        city: community?.location?.city || "",
        state: community?.location?.state || "",
        zipCode: community?.location?.zipCode || "",
      },
      organizationDetails: {
        registrationNumber:
          community?.organizationDetails?.registrationNumber || "",
        foundedYear:
          community?.organizationDetails?.foundedYear ||
          new Date().getFullYear(),
        memberCount: community?.organizationDetails?.memberCount || 1,
        pastEventsCount: community?.organizationDetails?.pastEventsCount || 0,
      },
    },
  });

  const locationValue = watch("location");

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
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("location", JSON.stringify(data.location));
    formData.append(
      "organizationDetails",
      JSON.stringify(data.organizationDetails)
    );

    if (imageFile) {
      formData.append("image", imageFile);
    }

    const result = await dispatch(
      community
        ? updateCommunity({ communityId: community._id, data: formData })
        : createCommunity(formData)
    );

    if (result.payload) {
      onSuccess?.();
      onClose?.();
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Card padding="lg" shadow="md" style={styles.card}>
      <h2 style={styles.title}>
        {community ? "Edit Community" : "Create Community"}
      </h2>

      {/* Error Alert */}
      {error && (
        <div style={styles.errorAlert}>
          <FiAlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Community Image Section */}
      <div style={styles.imageSection}>
        <div style={styles.imageContainer}>
          {imagePreview ? (
            <img src={imagePreview} alt="Community" style={styles.image} />
          ) : (
            <div style={styles.imagePlaceholder}>
              <span style={styles.imageInitial}>👥</span>
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
          <p style={styles.imageTitle}>Community Banner</p>
          <p style={styles.imageDescription}>JPG, PNG or GIF. Max size 5MB</p>
          {imageFile && (
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                setImagePreview(community?.image || null);
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
            Community Name
          </label>
          <input
            id="name"
            type="text"
            placeholder="e.g., Green City Volunteers"
            {...register("name")}
            style={{
              ...styles.input,
              ...(errors.name && styles.inputError),
            }}
          />
          {errors.name && (
            <span style={styles.errorMessage}>{errors.name.message}</span>
          )}
        </div>

        {/* Description Field */}
        <div style={styles.formGroup}>
          <label htmlFor="description" style={styles.label}>
            Description
          </label>
          <textarea
            id="description"
            placeholder="Describe your community..."
            {...register("description")}
            style={{
              ...styles.textarea,
              ...(errors.description && styles.inputError),
            }}
          />
          {errors.description && (
            <span style={styles.errorMessage}>
              {errors.description.message}
            </span>
          )}
        </div>

        {/* Category Field */}
        <div style={styles.formGroup}>
          <label htmlFor="category" style={styles.label}>
            Category
          </label>
          <select
            id="category"
            {...register("category")}
            style={{
              ...styles.input,
              ...(errors.category && styles.inputError),
            }}
          >
            <option value="">Select a category</option>
            {COMMUNITY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <span style={styles.errorMessage}>{errors.category.message}</span>
          )}
        </div>

        {/* Location Fields */}
        <div style={styles.sectionTitle}>📍 Location</div>

        <div style={styles.gridTwoColumns}>
          {/* City */}
          <div style={styles.formGroup}>
            <label htmlFor="city" style={styles.label}>
              City
            </label>
            <input
              id="city"
              type="text"
              placeholder="City"
              {...register("location.city")}
              style={{
                ...styles.input,
                ...(errors.location?.city && styles.inputError),
              }}
            />
            {errors.location?.city && (
              <span style={styles.errorMessage}>
                {errors.location.city.message}
              </span>
            )}
          </div>

          {/* State */}
          <div style={styles.formGroup}>
            <label htmlFor="state" style={styles.label}>
              State
            </label>
            <input
              id="state"
              type="text"
              placeholder="State"
              {...register("location.state")}
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.gridTwoColumns}>
          {/* Address */}
          <div style={styles.formGroup}>
            <label htmlFor="address" style={styles.label}>
              Address
            </label>
            <input
              id="address"
              type="text"
              placeholder="Street address"
              {...register("location.address")}
              style={styles.input}
            />
          </div>

          {/* Zip Code */}
          <div style={styles.formGroup}>
            <label htmlFor="zipCode" style={styles.label}>
              Zip Code
            </label>
            <input
              id="zipCode"
              type="text"
              placeholder="Zip code"
              {...register("location.zipCode")}
              style={styles.input}
            />
          </div>
        </div>

        {/* Organization Details */}
        <div style={styles.sectionTitle}>🏢 Organization Details</div>

        <div style={styles.gridTwoColumns}>
          {/* Registration Number */}
          <div style={styles.formGroup}>
            <label htmlFor="registrationNumber" style={styles.label}>
              Registration Number
            </label>
            <input
              id="registrationNumber"
              type="text"
              placeholder="Org. registration"
              {...register("organizationDetails.registrationNumber")}
              style={{
                ...styles.input,
                ...(errors.organizationDetails?.registrationNumber &&
                  styles.inputError),
              }}
            />
            {errors.organizationDetails?.registrationNumber && (
              <span style={styles.errorMessage}>
                {errors.organizationDetails.registrationNumber.message}
              </span>
            )}
          </div>

          {/* Founded Year */}
          <div style={styles.formGroup}>
            <label htmlFor="foundedYear" style={styles.label}>
              Founded Year
            </label>
            <input
              id="foundedYear"
              type="number"
              {...register("organizationDetails.foundedYear", {
                valueAsNumber: true,
              })}
              style={{
                ...styles.input,
                ...(errors.organizationDetails?.foundedYear &&
                  styles.inputError),
              }}
            />
          </div>
        </div>

        <div style={styles.gridTwoColumns}>
          {/* Member Count */}
          <div style={styles.formGroup}>
            <label htmlFor="memberCount" style={styles.label}>
              Initial Member Count
            </label>
            <input
              id="memberCount"
              type="number"
              min="1"
              {...register("organizationDetails.memberCount", {
                valueAsNumber: true,
              })}
              style={styles.input}
            />
          </div>

          {/* Past Events Count */}
          <div style={styles.formGroup}>
            <label htmlFor="pastEventsCount" style={styles.label}>
              Past Events
            </label>
            <input
              id="pastEventsCount"
              type="number"
              min="0"
              {...register("organizationDetails.pastEventsCount", {
                valueAsNumber: true,
              })}
              style={styles.input}
            />
          </div>
        </div>

        {/* Buttons */}
        <div style={styles.buttonGroup}>
          <Button
            type="submit"
            variant="primary"
            size="md"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
          >
            {isLoading
              ? "Saving..."
              : community
              ? "Update Community"
              : "Create Community"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="md"
            fullWidth
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

const styles = {
  card: {
    width: "100%",
    maxWidth: "700px",
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
    borderRadius: "10px",
    objectFit: "cover",
    border: "4px solid #00796B",
  },

  imagePlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: "10px",
    backgroundColor: "#00796B",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "4px solid #00796B",
  },

  imageInitial: {
    fontSize: "48px",
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

  sectionTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#212121",
    margin: "12px 0 16px 0",
    paddingBottom: "8px",
    borderBottom: "2px solid #e0e0e0",
  },

  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#212121",
  },

  input: {
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

  errorMessage: {
    fontSize: "12px",
    color: "#ef4444",
    fontWeight: "500",
  },

  gridTwoColumns: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },

  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "1px solid #e0e0e0",
  },

  "@media (max-width: 768px)": {
    imageSection: {
      flexDirection: "column",
    },
    gridTwoColumns: {
      gridTemplateColumns: "1fr",
    },
  },
};

export default CommunityForm;
