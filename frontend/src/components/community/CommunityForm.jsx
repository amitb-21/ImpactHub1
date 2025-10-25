import React, { useState } from "react";
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
import { FiUpload, FiX, FiAlertCircle } from "react-icons/fi";
import styles from "./styles/CommunityForm.module.css";

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
    <Card padding="lg" shadow="md" className={styles.card}>
      <h2 className={styles.title}>
        {community ? "Edit Community" : "Create Community"}
      </h2>

      {/* Error Alert */}
      {error && (
        <div className={styles.errorAlert}>
          <FiAlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Community Image Section */}
      <div className={styles.imageSection}>
        <div className={styles.imageContainer}>
          {imagePreview ? (
            <img src={imagePreview} alt="Community" className={styles.image} />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span className={styles.imageInitial}>👥</span>
            </div>
          )}
          <label className={styles.imageUploadLabel}>
            <FiUpload size={20} />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
          </label>
        </div>
        <div className={styles.imageInfo}>
          <p className={styles.imageTitle}>Community Banner</p>
          <p className={styles.imageDescription}>
            JPG, PNG or GIF. Max size 5MB
          </p>
          {imageFile && (
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                setImagePreview(community?.image || null);
              }}
              className={styles.removeButton}
            >
              <FiX size={16} /> Remove
            </button>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* Name Field */}
        <div className={styles.formGroup}>
          <label htmlFor="name" className={styles.label}>
            Community Name
          </label>
          <div className={styles.inputWrapper}>
            <input
              id="name"
              type="text"
              placeholder="e.g., Green City Volunteers"
              {...register("name")}
              className={`${styles.input} ${
                errors.name ? styles.inputError : ""
              }`}
            />
          </div>
          {errors.name && (
            <span className={styles.errorMessage}>{errors.name.message}</span>
          )}
        </div>

        {/* Description Field */}
        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Description
          </label>
          <textarea
            id="description"
            placeholder="Describe your community..."
            {...register("description")}
            className={`${styles.textarea} ${
              errors.description ? styles.inputError : ""
            }`}
          />
          {errors.description && (
            <span className={styles.errorMessage}>
              {errors.description.message}
            </span>
          )}
        </div>

        {/* Category Field */}
        <div className={styles.formGroup}>
          <label htmlFor="category" className={styles.label}>
            Category
          </label>
          <select
            id="category"
            {...register("category")}
            className={`${styles.input} ${
              errors.category ? styles.inputError : ""
            }`}
          >
            <option value="">Select a category</option>
            {COMMUNITY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && (
            <span className={styles.errorMessage}>
              {errors.category.message}
            </span>
          )}
        </div>

        {/* Location Section */}
        <div className={styles.sectionTitle}>📍 Location</div>

        <div className={styles.gridTwoColumns}>
          {/* City */}
          <div className={styles.formGroup}>
            <label htmlFor="city" className={styles.label}>
              City
            </label>
            <input
              id="city"
              type="text"
              placeholder="City"
              {...register("location.city")}
              className={`${styles.input} ${
                errors.location?.city ? styles.inputError : ""
              }`}
            />
            {errors.location?.city && (
              <span className={styles.errorMessage}>
                {errors.location.city.message}
              </span>
            )}
          </div>

          {/* State */}
          <div className={styles.formGroup}>
            <label htmlFor="state" className={styles.label}>
              State
            </label>
            <input
              id="state"
              type="text"
              placeholder="State"
              {...register("location.state")}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.gridTwoColumns}>
          {/* Address */}
          <div className={styles.formGroup}>
            <label htmlFor="address" className={styles.label}>
              Address
            </label>
            <input
              id="address"
              type="text"
              placeholder="Street address"
              {...register("location.address")}
              className={styles.input}
            />
          </div>

          {/* Zip Code */}
          <div className={styles.formGroup}>
            <label htmlFor="zipCode" className={styles.label}>
              Zip Code
            </label>
            <input
              id="zipCode"
              type="text"
              placeholder="Zip code"
              {...register("location.zipCode")}
              className={styles.input}
            />
          </div>
        </div>

        {/* Organization Details Section */}
        <div className={styles.sectionTitle}>🏢 Organization Details</div>

        <div className={styles.gridTwoColumns}>
          {/* Registration Number */}
          <div className={styles.formGroup}>
            <label htmlFor="registrationNumber" className={styles.label}>
              Registration Number
            </label>
            <input
              id="registrationNumber"
              type="text"
              placeholder="Org. registration"
              {...register("organizationDetails.registrationNumber")}
              className={`${styles.input} ${
                errors.organizationDetails?.registrationNumber
                  ? styles.inputError
                  : ""
              }`}
            />
            {errors.organizationDetails?.registrationNumber && (
              <span className={styles.errorMessage}>
                {errors.organizationDetails.registrationNumber.message}
              </span>
            )}
          </div>

          {/* Founded Year */}
          <div className={styles.formGroup}>
            <label htmlFor="foundedYear" className={styles.label}>
              Founded Year
            </label>
            <input
              id="foundedYear"
              type="number"
              {...register("organizationDetails.foundedYear", {
                valueAsNumber: true,
              })}
              className={`${styles.input} ${
                errors.organizationDetails?.foundedYear ? styles.inputError : ""
              }`}
            />
          </div>
        </div>

        <div className={styles.gridTwoColumns}>
          {/* Member Count */}
          <div className={styles.formGroup}>
            <label htmlFor="memberCount" className={styles.label}>
              Initial Member Count
            </label>
            <input
              id="memberCount"
              type="number"
              min="1"
              {...register("organizationDetails.memberCount", {
                valueAsNumber: true,
              })}
              className={styles.input}
            />
          </div>

          {/* Past Events Count */}
          <div className={styles.formGroup}>
            <label htmlFor="pastEventsCount" className={styles.label}>
              Past Events
            </label>
            <input
              id="pastEventsCount"
              type="number"
              min="0"
              {...register("organizationDetails.pastEventsCount", {
                valueAsNumber: true,
              })}
              className={styles.input}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className={styles.buttonGroup}>
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

export default CommunityForm;
