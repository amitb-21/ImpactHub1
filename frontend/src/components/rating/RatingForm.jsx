import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Badge } from "../common/Badge";
import { FiStar, FiX } from "react-icons/fi";
import { ratingAPI } from "../../api/services";
import { fetchEntityRatings } from "../../store/slices/ratingSlice";
import { toast } from "react-toastify";
import styles from "./styles/RatingForm.module.css";

const RatingForm = ({
  entityType = "Community",
  entityId,
  myRating = null,
  onSuccess = null,
  onCancel = null,
  compact = false,
}) => {
  const dispatch = useDispatch();

  // Local state
  const [rating, setRating] = useState(myRating?.rating || 0);
  const [review, setReview] = useState(myRating?.review || "");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(!!myRating);
  const [errors, setErrors] = useState({});

  // ✅ VALIDATION FUNCTION
  const validateForm = () => {
    const newErrors = {};

    if (!rating || rating < 1 || rating > 5) {
      newErrors.rating = "Please select a rating (1-5 stars)";
    }

    if (review.trim().length < 10) {
      newErrors.review = "Review must be at least 10 characters";
    }

    if (review.trim().length > 500) {
      newErrors.review = "Review must be 500 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ HANDLE FORM SUBMISSION
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate before submitting
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const ratingData = {
        entityType,
        entityId,
        rating,
        review: review.trim(),
      };

      console.log("📝 Submitting rating:", ratingData);

      if (isEditing && myRating?._id) {
        // Update existing rating
        console.log("✏️ Updating rating:", myRating._id);
        const response = await ratingAPI.update(myRating._id, ratingData);
        console.log("✅ Rating updated:", response.data);
        toast.success("Review updated successfully!");
      } else {
        // Create new rating
        console.log("✨ Creating new rating");
        const response = await ratingAPI.create(ratingData);
        console.log("✅ Rating created:", response.data);
        toast.success("Review submitted successfully!");
      }

      // ✅ CRITICAL: Refetch ratings to update the list
      console.log("🔄 Refetching ratings...");
      await dispatch(
        fetchEntityRatings({
          entityType,
          entityId,
          page: 1,
          limit: 10,
        })
      );

      // Reset form
      setRating(0);
      setReview("");
      setIsEditing(false);

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("❌ Error submitting rating:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to submit review";
      toast.error(errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ HANDLE CANCEL
  const handleCancel = () => {
    setRating(myRating?.rating || 0);
    setReview(myRating?.review || "");
    setErrors({});
    setIsEditing(false);

    if (onCancel) {
      onCancel();
    }
  };

  // ✅ HANDLE EDIT MODE
  const handleEditClick = () => {
    setIsEditing(true);
    setRating(myRating.rating);
    setReview(myRating.review);
  };

  // Compact View
  if (compact) {
    return (
      <Card padding="md" shadow="sm">
        <div className={styles.compactContainer}>
          <h4 className={styles.compactTitle}>
            {isEditing ? "Edit Your Review" : "Share Your Review"}
          </h4>

          <form onSubmit={handleSubmit} className={styles.compactForm}>
            {/* Star Rating */}
            <div className={styles.compactStarRating}>
              <label className={styles.label}>Your Rating</label>
              <div className={styles.compactStars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`${styles.compactStar} ${
                      star <= (hoveredRating || rating)
                        ? styles.compactStarFilled
                        : ""
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              {errors.rating && (
                <span className={styles.error}>{errors.rating}</span>
              )}
            </div>

            {/* Review Text (Compact) */}
            <div className={styles.compactTextarea}>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience... (10-500 characters)"
                maxLength={500}
                rows={2}
                className={`${styles.textarea} ${
                  errors.review ? styles.textareaError : ""
                }`}
              />
              <div className={styles.charCount}>{review.length}/500</div>
              {errors.review && (
                <span className={styles.error}>{errors.review}</span>
              )}
            </div>

            {/* Buttons */}
            <div className={styles.compactButtons}>
              <Button
                type="submit"
                size="sm"
                variant="primary"
                loading={isSubmitting}
                disabled={isSubmitting}
                fullWidth
              >
                {isSubmitting
                  ? "Submitting..."
                  : isEditing
                  ? "Update Review"
                  : "Submit Review"}
              </Button>
              {isEditing && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  fullWidth
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>
      </Card>
    );
  }

  // Full View
  return (
    <Card padding="lg" shadow="md" className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          {isEditing ? "Edit Your Review" : "Share Your Review"}
        </h3>
        {myRating && !isEditing && (
          <Badge label="You have reviewed" variant="success" size="sm" />
        )}
      </div>

      {/* Only show form if not editing or if editing */}
      {!isEditing && myRating && (
        <div className={styles.existingReview}>
          <div className={styles.existingHeader}>
            <p className={styles.existingTitle}>Your Review</p>
            <Button size="sm" variant="outline" onClick={handleEditClick}>
              Edit Review
            </Button>
          </div>

          <div className={styles.existingStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`${styles.star} ${
                  star <= myRating.rating ? styles.starFilled : ""
                }`}
              >
                ⭐
              </span>
            ))}
            <span className={styles.ratingText}>{myRating.rating}/5</span>
          </div>

          {myRating.review && (
            <p className={styles.existingReviewText}>{myRating.review}</p>
          )}

          <p className={styles.existingDate}>
            Reviewed {new Date(myRating.createdAt).toLocaleDateString()}
            {myRating.updatedAt &&
              myRating.updatedAt !== myRating.createdAt && (
                <span className={styles.editedLabel}>
                  {" "}
                  (updated {new Date(myRating.updatedAt).toLocaleDateString()})
                </span>
              )}
          </p>
        </div>
      )}

      {/* Form - Show when creating or editing */}
      {(isEditing || !myRating) && (
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Error Alert */}
          {errors.submit && (
            <div className={styles.errorAlert}>
              <p>{errors.submit}</p>
            </div>
          )}

          {/* Star Rating Section */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Your Rating *</label>
            <div className={styles.starRating}>
              <div className={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`${styles.star} ${
                      star <= (hoveredRating || rating) ? styles.starFilled : ""
                    }`}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    title={`${star} star${star !== 1 ? "s" : ""}`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              <span className={styles.ratingLabel}>
                {rating ? `${rating}/5 stars` : "Click to rate"}
              </span>
            </div>
            {errors.rating && (
              <span className={styles.errorMessage}>{errors.rating}</span>
            )}
          </div>

          {/* Review Text Section */}
          <div className={styles.formGroup}>
            <label htmlFor="review" className={styles.label}>
              Your Review *
            </label>
            <textarea
              id="review"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your experience with this community... (minimum 10 characters)"
              maxLength={500}
              rows={5}
              className={`${styles.textarea} ${
                errors.review ? styles.textareaError : ""
              }`}
            />
            <div className={styles.charCountContainer}>
              <span className={styles.charCount}>
                {review.length}/500 characters
              </span>
              {review.length < 10 && review.length > 0 && (
                <span className={styles.charWarning}>
                  {10 - review.length} more characters needed
                </span>
              )}
            </div>
            {errors.review && (
              <span className={styles.errorMessage}>{errors.review}</span>
            )}
          </div>

          {/* Info Box */}
          <div className={styles.infoBox}>
            <p className={styles.infoText}>
              ℹ️ Please be honest and constructive in your review. Your feedback
              helps the community improve.
            </p>
          </div>

          {/* Action Buttons */}
          <div className={styles.buttonGroup}>
            <Button
              type="submit"
              size="md"
              variant="primary"
              loading={isSubmitting}
              disabled={isSubmitting}
              fullWidth
            >
              {isSubmitting
                ? "Submitting..."
                : isEditing
                ? "Update Review"
                : "Submit Review"}
            </Button>

            {isEditing && (
              <Button
                type="button"
                size="md"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                fullWidth
              >
                Cancel Edit
              </Button>
            )}
          </div>
        </form>
      )}
    </Card>
  );
};

export default RatingForm;
