import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchEntityRatings } from "../../store/slices/ratingSlice";
import { usePagination } from "../../hooks/usePagination";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { Loader } from "../common/Loader";
import { FiArrowRight, FiTrash2, FiEdit2 } from "react-icons/fi";
import { timeAgo, formatDate } from "../../config/helpers";
import styles from "./styles/RatingList.module.css";
import { toast } from "react-toastify";
import { ratingAPI } from "../../api/services";
import { useAuth } from "../../hooks/useAuth";

const RatingList = ({
  entityType = "Community",
  entityId,
  maxItems = null,
  showViewAll = false,
  compact = false,
  refetchTrigger = 0,
  onRatingDeleted = null,
  onRatingUpdated = null,
}) => {
  const dispatch = useDispatch();
  const { user: currentUser } = useAuth();
  const { entityRatings, isLoading, error } = useSelector(
    (state) => state.rating
  );

  const [page, setPage] = useState(1);
  const [editingRatingId, setEditingRatingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination hook
  const { totalPages, goToPage, nextPage, prevPage, canGoNext, canGoPrev } =
    usePagination(entityRatings.pagination?.total || 0, page, 10);

  // ✅ REFETCH ON TRIGGER OR PARAMS CHANGE
  useEffect(() => {
    if (entityId && entityType) {
      console.log("📊 Fetching ratings for:", {
        entityType,
        entityId,
        refetchTrigger,
      });
      dispatch(
        fetchEntityRatings({
          entityType,
          entityId,
          page,
          limit: 10,
        })
      );
    }
  }, [dispatch, entityType, entityId, page, refetchTrigger]);

  // Loading State
  if (isLoading) {
    return (
      <Card padding="lg" shadow="md">
        <div className={styles.loadingContainer}>
          <Loader size="sm" text="Loading reviews..." />
        </div>
      </Card>
    );
  }

  // Error State
  if (error) {
    return (
      <Card padding="lg" shadow="md">
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <p className={styles.errorText}>{error}</p>
          <Button
            size="sm"
            variant="primary"
            onClick={() =>
              dispatch(
                fetchEntityRatings({
                  entityType,
                  entityId,
                  page,
                  limit: 10,
                })
              )
            }
          >
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  // Empty State
  if (!entityRatings.data || entityRatings.data.length === 0) {
    return (
      <Card padding="lg" shadow="md">
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⭐</div>
          <p className={styles.emptyStateTitle}>No Reviews Yet</p>
          <p className={styles.emptyStateText}>
            Be the first to share your experience!
          </p>
        </div>
      </Card>
    );
  }

  const displayedRatings = maxItems
    ? entityRatings.data.slice(0, maxItems)
    : entityRatings.data;

  // Compact View
  if (compact) {
    return (
      <Card padding="lg" shadow="md">
        <h3 className={styles.title}>Recent Reviews</h3>
        <div className={styles.compactList}>
          {displayedRatings.map((rating) => (
            <CompactRatingItem key={rating._id} rating={rating} />
          ))}
        </div>
      </Card>
    );
  }

  // Full View
  return (
    <Card padding="lg" shadow="md">
      <div className={styles.header}>
        <h3 className={styles.title}>All Reviews</h3>
        <span className={styles.ratingCount}>
          {entityRatings.pagination?.total || 0} reviews
        </span>
      </div>

      {/* Ratings List */}
      <div className={styles.ratingsList}>
        {displayedRatings.map((rating, index) => (
          <RatingListItem
            key={rating._id}
            rating={rating}
            currentUser={currentUser}
            isLast={index === displayedRatings.length - 1}
            isEditing={editingRatingId === rating._id}
            isDeleting={isDeleting}
            onEdit={() => setEditingRatingId(rating._id)}
            onCancelEdit={() => setEditingRatingId(null)}
            onDelete={async () => {
              setIsDeleting(true);
              try {
                await ratingAPI.delete(rating._id);
                toast.success("Review deleted successfully");
                if (onRatingDeleted) onRatingDeleted(rating._id);
                // Refetch ratings
                dispatch(
                  fetchEntityRatings({
                    entityType,
                    entityId,
                    page,
                    limit: 10,
                  })
                );
              } catch (err) {
                toast.error("Failed to delete review");
              } finally {
                setIsDeleting(false);
              }
            }}
          />
        ))}
      </div>

      {/* View All Button */}
      {showViewAll &&
        entityRatings.pagination?.total > displayedRatings.length && (
          <div className={styles.viewAllContainer}>
            <Button
              variant="outline"
              size="sm"
              icon={FiArrowRight}
              iconPosition="right"
            >
              View All Reviews ({entityRatings.pagination.total})
            </Button>
          </div>
        )}

      {/* Pagination */}
      {totalPages > 1 && !maxItems && (
        <div className={styles.pagination}>
          <Button
            size="sm"
            variant="outline"
            onClick={prevPage}
            disabled={!canGoPrev}
          >
            Previous
          </Button>

          <div className={styles.pageInfo}>
            Page {page} of {totalPages}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={nextPage}
            disabled={!canGoNext}
          >
            Next
          </Button>
        </div>
      )}
    </Card>
  );
};

/**
 * Rating List Item Component
 * Displays individual rating with user info, stars, and review text
 */
const RatingListItem = ({
  rating,
  currentUser,
  isLast,
  isEditing,
  isDeleting,
  onEdit,
  onCancelEdit,
  onDelete,
}) => {
  const isOwnRating = currentUser?._id === rating.userId?._id;

  return (
    <div
      className={styles.ratingItem}
      style={{
        borderBottom: isLast ? "none" : "1px solid #e0e0e0",
      }}
    >
      {/* User Info */}
      <div className={styles.ratingHeader}>
        <div className={styles.userInfo}>
          {rating.userId?.profileImage ? (
            <img
              src={rating.userId.profileImage}
              alt={rating.userId.name}
              className={styles.userAvatar}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/40?text=User";
              }}
            />
          ) : (
            <div className={styles.userAvatarPlaceholder}>
              {rating.userId?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}

          <div className={styles.userDetails}>
            <p className={styles.userName}>
              {rating.userId?.name || "Anonymous"}
            </p>
            <p className={styles.ratingDate}>
              {timeAgo(rating.createdAt)}
              {rating.updatedAt && rating.updatedAt !== rating.createdAt && (
                <span className={styles.editedLabel}> (edited)</span>
              )}
            </p>
          </div>
        </div>

        {/* ✅ VERIFIED BADGE */}
        {rating.isVerifiedPurchase && (
          <Badge
            label="Verified"
            variant="success"
            size="sm"
            style={{ marginRight: "12px" }}
          />
        )}

        {/* Action Buttons - Only for own ratings */}
        {isOwnRating && (
          <div className={styles.ratingActions}>
            <button
              className={styles.actionButton}
              onClick={onEdit}
              title="Edit review"
              disabled={isDeleting}
            >
              <FiEdit2 size={16} />
            </button>
            <button
              className={styles.actionButton}
              onClick={onDelete}
              title="Delete review"
              disabled={isDeleting}
            >
              <FiTrash2 size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Rating Stars */}
      <div className={styles.ratingStars}>
        <div className={styles.stars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`${styles.star} ${
                star <= rating.rating ? styles.starFilled : ""
              }`}
            >
              ⭐
            </span>
          ))}
        </div>
        <span className={styles.ratingValue}>{rating.rating}/5</span>
      </div>

      {/* Review Text */}
      {rating.review && <p className={styles.reviewText}>{rating.review}</p>}

      {/* Helpful Section */}
      <div className={styles.helpfulSection}>
        <span className={styles.helpfulLabel}>Was this helpful?</span>
        <div className={styles.helpfulButtons}>
          <button
            className={styles.helpfulButton}
            onClick={() => handleMarkHelpful(rating._id, true)}
          >
            👍 {rating.helpfulCount || 0}
          </button>
          <button
            className={styles.helpfulButton}
            onClick={() => handleMarkHelpful(rating._id, false)}
          >
            👎 {rating.unhelpfulCount || 0}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Compact Rating Item Component
 * Lightweight version for sidebar/reduced-space displays
 */
const CompactRatingItem = ({ rating }) => {
  return (
    <div className={styles.compactRatingItem}>
      <div className={styles.compactHeader}>
        <div className={styles.compactUserName}>{rating.userId?.name}</div>
        <div className={styles.compactStars}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={star <= rating.rating ? styles.compactStarFilled : ""}
            >
              ⭐
            </span>
          ))}
        </div>
      </div>
      {rating.review && (
        <p className={styles.compactReview}>
          {rating.review.substring(0, 100)}...
        </p>
      )}
      <p className={styles.compactDate}>{timeAgo(rating.createdAt)}</p>
    </div>
  );
};

/**
 * Handle marking rating as helpful
 */
const handleMarkHelpful = async (ratingId, helpful) => {
  try {
    await ratingAPI.markHelpful(ratingId, helpful);
    toast.success("Thank you for your feedback!");
  } catch (error) {
    toast.error("Failed to mark helpful");
  }
};

export default RatingList;
