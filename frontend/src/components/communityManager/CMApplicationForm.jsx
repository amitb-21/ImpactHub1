import React, { useState, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch, useSelector } from "react-redux";
import { applyAsCommunityManager } from "../../store/slices/communityManagerSlice";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import {
  FiArrowRight,
  FiArrowLeft,
  FiCheck,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";
import { z } from "zod";
import debounce from "lodash/debounce";
import styles from "./styles/CMApplicationForm.module.css";

// Validation schema
const cmApplicationSchema = z.object({
  communityName: z.string().min(3, "Community name required"),
  description: z.string().min(20, "Description min 20 chars"),
  category: z.string().min(1, "Category required"),
  city: z.string().min(2, "City required"),
  registrationNumber: z.string().min(1, "Registration number required"),
  foundedYear: z.number().min(1900).max(new Date().getFullYear()),
  memberCount: z.number().min(1),
  pastEventsCount: z.number().min(0),
  yearsExperience: z.number().min(0),
  previousRoles: z.string().optional(),
  motivation: z.string().min(20, "Motivation min 20 chars"),
  goals: z.string().min(20, "Goals min 20 chars"),
});

const STEPS = [
  {
    title: "Community Details",
    fields: ["communityName", "description", "category", "city"],
  },
  {
    title: "Organization",
    fields: [
      "registrationNumber",
      "foundedYear",
      "memberCount",
      "pastEventsCount",
    ],
  },
  {
    title: "Your Experience",
    fields: ["yearsExperience", "previousRoles", "motivation", "goals"],
  },
  { title: "Review & Submit", fields: [] },
];

const COMMUNITY_CATEGORIES = [
  "Environment",
  "Education",
  "Health",
  "Social",
  "Other",
];

const CMApplicationForm = ({ onSuccess }) => {
  const dispatch = useDispatch();
  const { isSubmitting, error } = useSelector(
    (state) => state.communityManager
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
    setValue,
  } = useForm({
    resolver: zodResolver(cmApplicationSchema),
    mode: "onBlur",
  });

  const formData = watch();

  // Fetch cities from GeoDb API
  const fetchCities = useCallback(
    debounce(async (searchTerm) => {
      if (!searchTerm || searchTerm.length < 2) {
        setCitySuggestions([]);
        setCityLoading(false);
        return;
      }

      setCityLoading(true);
      try {
        const response = await fetch(
          `https://wft-geo-db.p.rapidapi.com/v1/geo/cities?namePrefix=${encodeURIComponent(
            searchTerm
          )}&limit=10&sort=-population`,
          {
            method: "GET",
            headers: {
              "X-RapidAPI-Key": process.env.REACT_APP_GEODB_API_KEY,
              "X-RapidAPI-Host": "wft-geo-db.p.rapidapi.com",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch cities");
        }

        const data = await response.json();
        const cities = data.data || [];
        setCitySuggestions(cities);
      } catch (error) {
        console.error("Error fetching cities:", error);
        setCitySuggestions([]);
      } finally {
        setCityLoading(false);
      }
    }, 300),
    []
  );

  const handleCityChange = (e) => {
    const value = e.target.value;
    setValue("city", value);
    setShowSuggestions(true);
    fetchCities(value);
  };

  const handleCitySelect = (city) => {
    const cityName = `${city.city}, ${city.region}`;
    setValue("city", cityName);
    setCitySuggestions([]);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Validate current step
  const validateStep = async () => {
    const stepFields = STEPS[currentStep - 1].fields;
    const isValid = await trigger(stepFields);
    return isValid;
  };

  // Handle next step
  const handleNext = async () => {
    if (await validateStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle previous step
  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    const result = await dispatch(applyAsCommunityManager(data));
    if (result.payload) {
      onSuccess?.();
    }
  };

  return (
    <div className={styles.container}>
      {/* Progress indicator */}
      <div className={styles.progressContainer}>
        {STEPS.map((step, index) => (
          <div key={index} className={styles.stepContainer}>
            <div
              className={`${styles.stepNumber} ${
                index + 1 <= currentStep ? styles.stepNumberActive : ""
              }`}
            >
              {index + 1 <= currentStep ? <FiCheck size={20} /> : index + 1}
            </div>
            <span className={styles.stepLabel}>{step.title}</span>
            {index < STEPS.length - 1 && (
              <div
                className={`${styles.stepLine} ${
                  index + 1 < currentStep ? styles.stepLineActive : ""
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Error alert */}
      {error && (
        <div className={styles.errorAlert}>
          <FiAlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Form sections */}
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* Step 1: Community Details */}
        {currentStep === 1 && (
          <Card padding="lg" shadow="md">
            <h3 className={styles.stepTitle}>Community Details</h3>
            <p className={styles.stepDescription}>
              Tell us about the community you want to create
            </p>

            <FormField
              label="Community Name"
              error={errors.communityName}
              register={register("communityName")}
              placeholder="e.g., Green City Volunteers"
            />

            <FormField
              label="Description"
              error={errors.description}
              register={register("description")}
              placeholder="What does your community do?"
              textarea
              rows={4}
            />

            <FormField
              label="Category"
              error={errors.category}
              register={register("category")}
              placeholder="Select category"
              select
              options={COMMUNITY_CATEGORIES}
            />

            <div className={styles.formGroup}>
              <label className={styles.label}>Primary City</label>
              <div className={styles.cityInputWrapper}>
                <input
                  {...register("city")}
                  onChange={handleCityChange}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Start typing a city name..."
                  className={`${styles.input} ${
                    errors.city ? styles.inputError : ""
                  }`}
                  autoComplete="off"
                />
                {cityLoading && (
                  <div className={styles.cityLoader}>
                    <FiLoader size={16} className={styles.spinnerIcon} />
                  </div>
                )}
              </div>

              {showSuggestions && citySuggestions.length > 0 && (
                <ul
                  className={styles.citySuggestions}
                  ref={suggestionsRef}
                  role="listbox"
                >
                  {citySuggestions.map((city) => (
                    <li
                      key={city.id}
                      onClick={() => handleCitySelect(city)}
                      className={styles.citySuggestionItem}
                      role="option"
                    >
                      <span className={styles.cityName}>{city.city}</span>
                      <span className={styles.cityRegion}>
                        {city.region && `${city.region}, `}
                        {city.countryCode}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {errors.city && (
                <span className={styles.errorMessage}>
                  {errors.city.message}
                </span>
              )}
            </div>
          </Card>
        )}

        {/* Step 2: Organization Details */}
        {currentStep === 2 && (
          <Card padding="lg" shadow="md">
            <h3 className={styles.stepTitle}>Organization Details</h3>
            <p className={styles.stepDescription}>
              Information about your organization
            </p>

            <FormField
              label="Registration Number"
              error={errors.registrationNumber}
              register={register("registrationNumber")}
              placeholder="Organization registration #"
            />

            <div className={styles.gridTwoColumns}>
              <FormField
                label="Founded Year"
                error={errors.foundedYear}
                register={register("foundedYear", { valueAsNumber: true })}
                type="number"
                placeholder="Year"
              />

              <FormField
                label="Current Members"
                error={errors.memberCount}
                register={register("memberCount", { valueAsNumber: true })}
                type="number"
                placeholder="Approx. count"
              />
            </div>

            <FormField
              label="Past Events Organized"
              error={errors.pastEventsCount}
              register={register("pastEventsCount", { valueAsNumber: true })}
              type="number"
              placeholder="How many events?"
            />
          </Card>
        )}

        {/* Step 3: Your Experience */}
        {currentStep === 3 && (
          <Card padding="lg" shadow="md">
            <h3 className={styles.stepTitle}>Your Experience</h3>
            <p className={styles.stepDescription}>
              Help us understand your background
            </p>

            <FormField
              label="Years of Experience"
              error={errors.yearsExperience}
              register={register("yearsExperience", { valueAsNumber: true })}
              type="number"
              placeholder="Years"
            />

            <FormField
              label="Previous Roles"
              error={errors.previousRoles}
              register={register("previousRoles")}
              placeholder="Coordinator, Manager, Founder, etc."
              textarea
              rows={2}
            />

            <FormField
              label="Motivation"
              error={errors.motivation}
              register={register("motivation")}
              placeholder="Why do you want to create this community?"
              textarea
              rows={3}
            />

            <FormField
              label="Community Goals"
              error={errors.goals}
              register={register("goals")}
              placeholder="What do you want to achieve?"
              textarea
              rows={3}
            />
          </Card>
        )}

        {/* Step 4: Review & Submit */}
        {currentStep === 4 && (
          <Card padding="lg" shadow="md">
            <h3 className={styles.stepTitle}>Review Your Application</h3>
            <p className={styles.stepDescription}>
              Please review all information before submitting
            </p>

            <ReviewSection title="Community Details">
              <ReviewRow label="Name" value={formData.communityName} />
              <ReviewRow label="Category" value={formData.category} />
              <ReviewRow label="City" value={formData.city} />
              <ReviewRow label="Description" value={formData.description} />
            </ReviewSection>

            <ReviewSection title="Organization">
              <ReviewRow
                label="Reg. Number"
                value={formData.registrationNumber}
              />
              <ReviewRow label="Founded" value={formData.foundedYear} />
              <ReviewRow label="Members" value={formData.memberCount} />
              <ReviewRow label="Past Events" value={formData.pastEventsCount} />
            </ReviewSection>

            <ReviewSection title="Your Background">
              <ReviewRow
                label="Experience"
                value={`${formData.yearsExperience} years`}
              />
              <ReviewRow
                label="Previous Roles"
                value={formData.previousRoles || "N/A"}
              />
              <ReviewRow label="Motivation" value={formData.motivation} />
              <ReviewRow label="Goals" value={formData.goals} />
            </ReviewSection>

            <div className={styles.infoBox}>
              <p className={styles.infoText}>
                ℹ️ Your application will be reviewed by our team within 3-5
                business days. You'll receive an email update and can check your
                status anytime.
              </p>
            </div>
          </Card>
        )}

        {/* Buttons */}
        <div className={styles.buttonContainer}>
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handlePrev}
            disabled={currentStep === 1 || isSubmitting}
            icon={FiArrowLeft}
          >
            Previous
          </Button>

          {currentStep < 4 ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleNext}
              disabled={isSubmitting}
              icon={FiArrowRight}
              iconPosition="right"
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              Submit Application
            </Button>
          )}
        </div>

        {/* Step indicator */}
        <p className={styles.stepIndicator}>
          Step {currentStep} of {STEPS.length}
        </p>
      </form>
    </div>
  );
};

// Helper Components
const FormField = ({
  label,
  error,
  register,
  placeholder,
  textarea,
  rows,
  select,
  options,
  type = "text",
}) => (
  <div className={styles.formGroup}>
    <label className={styles.label}>{label}</label>
    {select ? (
      <select
        {...register}
        className={`${styles.input} ${error ? styles.inputError : ""}`}
      >
        <option value="">{placeholder}</option>
        {options?.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    ) : textarea ? (
      <textarea
        {...register}
        placeholder={placeholder}
        rows={rows}
        className={`${styles.textarea} ${error ? styles.inputError : ""}`}
      />
    ) : (
      <input
        {...register}
        type={type}
        placeholder={placeholder}
        className={`${styles.input} ${error ? styles.inputError : ""}`}
      />
    )}
    {error && <span className={styles.errorMessage}>{error.message}</span>}
  </div>
);

const ReviewSection = ({ title, children }) => (
  <div className={styles.reviewSection}>
    <h4 className={styles.reviewTitle}>{title}</h4>
    {children}
  </div>
);

const ReviewRow = ({ label, value }) => (
  <div className={styles.reviewRow}>
    <span className={styles.reviewLabel}>{label}</span>
    <span className={styles.reviewValue}>{value}</span>
  </div>
);

export default CMApplicationForm;
