import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ratingSchema } from "../../config/validators";
import { useDispatch, useSelector } from "react-redux";
import { createRating, updateRating } from "../../store/slices/ratingSlice";
import { Button } from "../common/Button";
import { FiStar, FiAlertCircle } from "react-icons/fi";
import styles from "./styles/RatingForm.module.css";

// === FIX 2: Add onRatingSubmitted callback prop ===
const RatingForm = ({
  entityType,
  entityId,
  myRating = null,
  onRatingSubmitted = null, // NEW PROP
}) => {
  const dispatch = useDispatch();
  const { isCreating, isUpdating, error } = useSelector(
    (state) => state.rating
  );
  const [rating, setRating] = useState(myRating?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      review: myRating?.review || "",
    },
  });

  // Reset form when myRating prop changes
  useEffect(() => {
    if (myRating) {
      setRating(myRating.rating);
      reset({ review: myRating.review });
    } else {
      setRating(0);
      reset({ review: "" });
    }
  }, [myRating, reset]);

  // === FIX 2: Updated onSubmit to call callback after successful submission ===
  const onSubmit = (data) => {
    if (rating === 0) {
      alert("Please select a star rating.");
      return;
    }

    const ratingData = {
      entityType,
      entityId,
      rating,
      review: data.review,
    };

    if (myRating) {
      // Update existing rating
      dispatch(updateRating({ ratingId: myRating._id, data: ratingData })).then(
        (result) => {
          if (result.payload) {
            // Call callback after successful update
            onRatingSubmitted?.();
          }
        }
      );
    } else {
      // Create new rating
      dispatch(createRating(ratingData)).then((result) => {
        if (result.payload) {
          // Call callback after successful creation
          onRatingSubmitted?.();
        }
      });
    }
  };

  const isLoading = isCreating || isUpdating;

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>
        {myRating ? "Update Your Review" : "Write a Review"}
      </h4>
      {error && (
        <div className={styles.errorAlert}>
          <FiAlertCircle size={18} /> <span>{error}</span>
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className={styles.starRating}>
          {[1, 2, 3, 4, 5].map((star) => (
            <FiStar
              key={star}
              size={28}
              className={styles.star}
              style={{
                color: (hoverRating || rating) >= star ? "#FFB300" : "#e0e0e0",
                fill: (hoverRating || rating) >= star ? "#FFB300" : "none",
              }}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            />
          ))}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="review" className={styles.label}>
            Your Review (Optional)
          </label>
          <textarea
            id="review"
            {...register("review")}
            placeholder="Share your experience..."
            className={`${styles.textarea} ${
              errors.review ? styles.inputError : ""
            }`}
            rows={4}
          />
          {errors.review && (
            <span className={styles.errorMessage}>{errors.review.message}</span>
          )}
        </div>

        <div className={styles.buttonContainer}>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={isLoading}
            disabled={isLoading || rating === 0}
          >
            {isLoading
              ? "Submitting..."
              : myRating
              ? "Update Review"
              : "Submit Review"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RatingForm;
