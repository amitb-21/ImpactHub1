import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { useGeolocation } from "../../hooks/useGeolocation";
import { createEvent, updateEvent } from "../../store/slices/eventSlice";
import { eventSchema } from "../../config/validators";
import { EVENT_CATEGORIES } from "../../config/constants";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Loader } from "../common/Loader";
import {
  FiUpload,
  FiX,
  FiAlertCircle,
  FiMapPin,
  FiCalendar,
} from "react-icons/fi";
import styles from "./styles/EventForm.module.css";

const EventForm = ({ event = null, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { isCreating, isUpdating, error } = useSelector((state) => state.event);
  const {
    requestLocation,
    latitude,
    longitude,
    error: locationError,
  } = useGeolocation();

  const [eventImage, setEventImage] = useState(event?.image || null);
  const [imagePreview, setImagePreview] = useState(event?.image || null);
  const [imageFile, setImageFile] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: event?.title || "",
      description: event?.description || "",
      startDate: event?.startDate || "",
      endDate: event?.endDate || "",
      startTime: event?.startTime || "",
      endTime: event?.endTime || "",
      location: {
        address: event?.location?.address || "",
        city: event?.location?.city || "",
        state: event?.location?.state || "",
        zipCode: event?.location?.zipCode || "",
        latitude: event?.location?.coordinates?.[1] || "",
        longitude: event?.location?.coordinates?.[0] || "",
      },
      category: event?.category || "",
      maxParticipants: event?.maxParticipants || 20,
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

  // Handle auto-detect location
  const handleAutoDetectLocation = () => {
    requestLocation();
  };

  // Update location fields when geolocation is obtained
  React.useEffect(() => {
    if (latitude && longitude) {
      setValue("location.latitude", latitude.toString());
      setValue("location.longitude", longitude.toString());
    }
  }, [latitude, longitude, setValue]);

  // Handle form submission
  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("startDate", data.startDate);
    formData.append("endDate", data.endDate);
    formData.append("startTime", data.startTime || "");
    formData.append("endTime", data.endTime || "");
    formData.append("location", JSON.stringify(data.location));
    formData.append("category", data.category);
    formData.append("maxParticipants", data.maxParticipants);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    const result = await dispatch(
      event
        ? updateEvent({ eventId: event._id, data: formData })
        : createEvent(formData)
    );

    if (result.payload) {
      onSuccess?.();
      onClose?.();
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Card padding="lg" shadow="md" className={styles.card}>
      <h2 className={styles.title}>{event ? "Edit Event" : "Create Event"}</h2>

      {/* Error Alert */}
      {error && (
        <div className={styles.errorAlert}>
          <FiAlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Event Image Section */}
      <div className={styles.imageSection}>
        <div className={styles.imageContainer}>
          {imagePreview ? (
            <img src={imagePreview} alt="Event" className={styles.image} />
          ) : (
            <div className={styles.imagePlaceholder}>
              <span className={styles.imageInitial}>📅</span>
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
          <p className={styles.imageTitle}>Event Banner</p>
          <p className={styles.imageDescription}>
            JPG, PNG or GIF. Max size 5MB
          </p>
          {imageFile && (
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                setImagePreview(event?.image || null);
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
        {/* Title Field */}
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            Event Title
          </label>
          <input
            id="title"
            type="text"
            placeholder="e.g., Park Cleanup Drive"
            {...register("title")}
            className={`${styles.input} ${
              errors.title ? styles.inputError : ""
            }`}
          />
          {errors.title && (
            <span className={styles.errorMessage}>{errors.title.message}</span>
          )}
        </div>

        {/* Description Field */}
        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Description
          </label>
          <textarea
            id="description"
            placeholder="Describe your event..."
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
            {EVENT_CATEGORIES.map((cat) => (
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

        {/* Date & Time Section */}
        <div className={styles.sectionTitle}>📅 Date & Time</div>

        <div className={styles.gridTwoColumns}>
          {/* Start Date */}
          <div className={styles.formGroup}>
            <label htmlFor="startDate" className={styles.label}>
              Start Date
            </label>
            <input
              id="startDate"
              type="date"
              {...register("startDate")}
              className={`${styles.input} ${
                errors.startDate ? styles.inputError : ""
              }`}
            />
            {errors.startDate && (
              <span className={styles.errorMessage}>
                {errors.startDate.message}
              </span>
            )}
          </div>

          {/* End Date */}
          <div className={styles.formGroup}>
            <label htmlFor="endDate" className={styles.label}>
              End Date
            </label>
            <input
              id="endDate"
              type="date"
              {...register("endDate")}
              className={`${styles.input} ${
                errors.endDate ? styles.inputError : ""
              }`}
            />
            {errors.endDate && (
              <span className={styles.errorMessage}>
                {errors.endDate.message}
              </span>
            )}
          </div>
        </div>

        <div className={styles.gridTwoColumns}>
          {/* Start Time */}
          <div className={styles.formGroup}>
            <label htmlFor="startTime" className={styles.label}>
              Start Time
            </label>
            <input
              id="startTime"
              type="time"
              {...register("startTime")}
              className={styles.input}
            />
          </div>

          {/* End Time */}
          <div className={styles.formGroup}>
            <label htmlFor="endTime" className={styles.label}>
              End Time
            </label>
            <input
              id="endTime"
              type="time"
              {...register("endTime")}
              className={styles.input}
            />
          </div>
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

        {/* Auto-detect Location Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAutoDetectLocation}
          icon={FiMapPin}
          fullWidth
          style={{ marginBottom: "16px" }}
        >
          Auto-detect Current Location
        </Button>

        {locationError && (
          <p className={styles.locationError}>{locationError}</p>
        )}

        {/* Coordinates (Hidden) */}
        <div className={styles.gridTwoColumns}>
          <input type="hidden" {...register("location.latitude")} />
          <input type="hidden" {...register("location.longitude")} />
        </div>

        {/* Participants Section */}
        <div className={styles.sectionTitle}>👥 Participants</div>

        <div className={styles.formGroup}>
          <label htmlFor="maxParticipants" className={styles.label}>
            Maximum Participants
          </label>
          <input
            id="maxParticipants"
            type="number"
            min="1"
            {...register("maxParticipants", { valueAsNumber: true })}
            className={styles.input}
          />
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
            {isLoading ? "Saving..." : event ? "Update Event" : "Create Event"}
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

export default EventForm;
