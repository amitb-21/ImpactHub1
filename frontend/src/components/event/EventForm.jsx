import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { useGeolocation } from "../../hooks/useGeolocation";
import debounce from "lodash/debounce";
import { createEvent, updateEvent } from "../../store/slices/eventSlice";
import { eventSchema } from "../../config/validators";
import { EVENT_CATEGORIES } from "../../config/constants";
import { API_KEYS } from "../../config/api";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Loader } from "../common/Loader";
import { FiUpload, FiX, FiAlertCircle, FiMapPin } from "react-icons/fi";
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

  // Image state
  const [eventImage, setEventImage] = useState(event?.image || null);
  const [imagePreview, setImagePreview] = useState(event?.image || null);
  const [imageFile, setImageFile] = useState(null);

  // Location state
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [citySearchTerm, setCitySearchTerm] = useState("");
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [addressLoadingError, setAddressLoadingError] = useState("");
  const cityInputRef = useRef(null);
  const debouncedSearchRef = useRef(null);

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

  // Initialize debounced search
  useEffect(() => {
    debouncedSearchRef.current = debounce(async (term) => {
      await searchCities(term);
    }, 300);

    return () => {
      debouncedSearchRef.current?.cancel();
    };
  }, []);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fetch address from coordinates using Nominatim API (OSM - Free, No API Key Needed)
  const fetchAddressFromCoordinates = async (lat, lng) => {
    setIsAddressLoading(true);
    setAddressLoadingError("");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch address");
      }

      const data = await response.json();

      if (data.address) {
        const address = data.address.road
          ? `${data.address.house_number || ""} ${data.address.road}`.trim()
          : data.display_name;

        const city =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.municipality ||
          data.address.county ||
          "";

        const state = data.address.state || data.address.region || "";

        // Try multiple fields for postal code
        let postalCode =
          data.address.postcode ||
          data.address.postal_code ||
          data.address.zip_code ||
          "";

        setValue("location.address", address);
        setValue("location.city", city);
        setCitySearchTerm(city);
        setValue("location.state", state);
        if (postalCode) {
          setValue("location.zipCode", postalCode);
        }

        if (!postalCode) {
          console.warn("Postal code not found in Nominatim response");
        }
      } else {
        setAddressLoadingError("No address found for these coordinates");
      }
    } catch (error) {
      console.error("Error fetching address:", error);
      setAddressLoadingError(error.message || "Failed to fetch address");
    } finally {
      setIsAddressLoading(false);
    }
  };

  // Search cities from API
  const searchCities = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setCitySuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${searchTerm}&limit=10&sort=-population`,
        {
          headers: {
            "X-RapidAPI-Key": API_KEYS.GEODB_API_KEY,
            "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch cities");
      }

      const data = await response.json();
      setCitySuggestions(data.data || []);
    } catch (error) {
      console.error("Error fetching cities:", error);
      setCitySuggestions([]);
    }
  };

  // Handle city input change
  const handleCityInputChange = (e) => {
    const value = e.target.value;
    setCitySearchTerm(value);
    setValue("location.city", value);
    setShowSuggestions(true);
    debouncedSearchRef.current?.(value);
  };

  // Handle city selection from suggestions
  const handleCitySelect = (city) => {
    setValue("location.city", city.city);
    setValue("location.state", city.region);
    setValue("location.latitude", city.latitude.toString());
    setValue("location.longitude", city.longitude.toString());
    setCitySearchTerm(city.city);
    setShowSuggestions(false);
    fetchAddressFromCoordinates(city.latitude, city.longitude);
  };

  // Handle coordinates detection
  const handleDetectFromCoordinates = () => {
    const lat = watch("location.latitude");
    const lng = watch("location.longitude");

    if (!lat || !lng) {
      setAddressLoadingError("Please enter both latitude and longitude");
      return;
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    if (
      isNaN(latNum) ||
      isNaN(lngNum) ||
      latNum < -90 ||
      latNum > 90 ||
      lngNum < -180 ||
      lngNum > 180
    ) {
      setAddressLoadingError(
        "Invalid coordinates. Latitude: -90 to 90, Longitude: -180 to 180"
      );
      return;
    }

    setAddressLoadingError("");
    fetchAddressFromCoordinates(latNum, lngNum);
  };

  // Handle auto-detect location
  const handleAutoDetectLocation = () => {
    setAddressLoadingError("");
    setIsAddressLoading(true);
    requestLocation();
  };

  // Click outside handler for city suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cityInputRef.current &&
        !cityInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Update location fields when geolocation is obtained
  useEffect(() => {
    if (!latitude || !longitude) return;

    const fetchAddress = async () => {
      try {
        setValue("location.latitude", latitude.toString());
        setValue("location.longitude", longitude.toString());

        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
          {
            headers: {
              "Accept-Language": "en",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch address");
        }

        const data = await response.json();

        if (data.address) {
          const address = data.address.road
            ? `${data.address.house_number || ""} ${data.address.road}`.trim()
            : data.display_name;

          const city =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.municipality ||
            data.address.county ||
            "";

          // Try multiple fields for postal code
          let postalCode =
            data.address.postcode ||
            data.address.postal_code ||
            data.address.zip_code ||
            "";

          setValue("location.address", address);
          setValue("location.city", city);
          setCitySearchTerm(city);
          setValue(
            "location.state",
            data.address.state || data.address.region || ""
          );
          if (postalCode) {
            setValue("location.zipCode", postalCode);
          }
          setAddressLoadingError("");
        }
      } catch (error) {
        console.error("Error fetching address:", error);
        setAddressLoadingError("Failed to fetch address from location");
      } finally {
        setIsAddressLoading(false);
      }
    };

    fetchAddress();
  }, [latitude, longitude, setValue]);

  // Handle location error
  useEffect(() => {
    if (locationError) {
      setAddressLoadingError(locationError);
      setIsAddressLoading(false);
    }
  }, [locationError]);

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

  const isLoading = isCreating || isUpdating || isAddressLoading;

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
              disabled={isLoading}
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
              disabled={isLoading}
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
            Event Title *
          </label>
          <input
            id="title"
            type="text"
            placeholder="e.g., Park Cleanup Drive"
            disabled={isLoading}
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
            Description *
          </label>
          <textarea
            id="description"
            placeholder="Describe your event..."
            disabled={isLoading}
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
            Category *
          </label>
          <select
            id="category"
            disabled={isLoading}
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
          <div className={styles.formGroup}>
            <label htmlFor="startDate" className={styles.label}>
              Start Date *
            </label>
            <input
              id="startDate"
              type="date"
              disabled={isLoading}
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

          <div className={styles.formGroup}>
            <label htmlFor="endDate" className={styles.label}>
              End Date *
            </label>
            <input
              id="endDate"
              type="date"
              disabled={isLoading}
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
          <div className={styles.formGroup}>
            <label htmlFor="startTime" className={styles.label}>
              Start Time
            </label>
            <input
              id="startTime"
              type="time"
              disabled={isLoading}
              {...register("startTime")}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="endTime" className={styles.label}>
              End Time
            </label>
            <input
              id="endTime"
              type="time"
              disabled={isLoading}
              {...register("endTime")}
              className={styles.input}
            />
          </div>
        </div>

        {/* Location Section */}
        <div className={styles.sectionTitle}>📍 Location</div>

        {addressLoadingError && (
          <div className={styles.errorAlert}>
            <FiAlertCircle size={20} />
            <span>{addressLoadingError}</span>
          </div>
        )}

        <div className={styles.gridTwoColumns}>
          <div className={styles.formGroup} ref={cityInputRef}>
            <label htmlFor="city" className={styles.label}>
              City *
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="city"
                type="text"
                placeholder="Start typing city name..."
                value={citySearchTerm}
                onChange={handleCityInputChange}
                disabled={isLoading}
                className={`${styles.input} ${
                  errors.location?.city ? styles.inputError : ""
                }`}
              />
              {isAddressLoading && (
                <Loader
                  size="sm"
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
              )}
            </div>
            {showSuggestions && citySuggestions.length > 0 && (
              <div className={styles.suggestions}>
                {citySuggestions.map((city, index) => (
                  <div
                    key={index}
                    className={styles.suggestionItem}
                    onClick={() => handleCitySelect(city)}
                    style={{ cursor: "pointer" }}
                  >
                    {city.city}, {city.region}, {city.country}
                  </div>
                ))}
              </div>
            )}
            {errors.location?.city && (
              <span className={styles.errorMessage}>
                {errors.location.city.message}
              </span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="state" className={styles.label}>
              State
            </label>
            <input
              id="state"
              type="text"
              placeholder="State"
              disabled={isLoading}
              {...register("location.state")}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.gridTwoColumns}>
          <div className={styles.formGroup}>
            <label htmlFor="address" className={styles.label}>
              Address
            </label>
            <input
              id="address"
              type="text"
              placeholder="Street address"
              disabled={isLoading}
              {...register("location.address")}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="zipCode" className={styles.label}>
              Zip Code
            </label>
            <input
              id="zipCode"
              type="text"
              placeholder="Zip code"
              disabled={isLoading}
              {...register("location.zipCode")}
              className={styles.input}
            />
          </div>
        </div>

        {/* Coordinates Input */}
        <div className={styles.gridTwoColumns}>
          <div className={styles.formGroup}>
            <label htmlFor="latitude" className={styles.label}>
              Latitude
            </label>
            <input
              id="latitude"
              type="text"
              placeholder="e.g. 51.5074"
              disabled={isLoading}
              {...register("location.latitude")}
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="longitude" className={styles.label}>
              Longitude
            </label>
            <input
              id="longitude"
              type="text"
              placeholder="e.g. -0.1278"
              disabled={isLoading}
              {...register("location.longitude")}
              className={styles.input}
            />
          </div>
        </div>

        {/* Location Buttons */}
        <div className={styles.gridTwoColumns} style={{ gap: "12px" }}>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAutoDetectLocation}
            icon={FiMapPin}
            loading={isAddressLoading}
            disabled={isLoading}
          >
            {isAddressLoading ? "Detecting..." : "Auto-detect Location"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDetectFromCoordinates}
            icon={FiMapPin}
            loading={isAddressLoading}
            disabled={isLoading}
          >
            {isAddressLoading ? "Detecting..." : "Detect from Coordinates"}
          </Button>
        </div>

        {/* Participants Section */}
        <div className={styles.sectionTitle}>👥 Participants</div>

        <div className={styles.formGroup}>
          <label htmlFor="maxParticipants" className={styles.label}>
            Maximum Participants *
          </label>
          <input
            id="maxParticipants"
            type="number"
            min="1"
            disabled={isLoading}
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
