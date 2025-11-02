import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { markHelpful } from "../../store/slices/ratingSlice";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import {
  FiStar,
  FiCheckCircle,
  FiThumbsUp,
  FiThumbsDown,
} from "react-icons/fi";
import { timeAgo, truncate, getInitials } from "../../config/helpers";
import styles from "./styles/RatingItem.module.css";

const RatingItem = ({ rating }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleHelpful = (helpful) => {
    dispatch(markHelpful({ ratingId: rating._id, helpful }));
  };

  const handleUserClick = () => {
    if (rating.ratedBy?._id) {
      navigate(`/profile/${rating.ratedBy._id}`);
    }
  };

  return (
    <Card padding="md" shadow="sm" className={styles.container}>
      <div className={styles.header}>
        <div className={styles.userInfo} onClick={handleUserClick}>
          {rating.ratedBy?.profileImage ? (
            <img
              src={rating.ratedBy.profileImage}
              alt={rating.ratedBy.name}
              className={styles.avatar}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {getInitials(rating.ratedBy?.name)}
            </div>
          )}
          <div className={styles.nameContainer}>
            <span className={styles.name}>{rating.ratedBy?.name}</span>
            {rating.isVerifiedParticipant && (
              <Badge
                label="Verified Participant"
                variant="success"
                size="sm"
                icon={FiCheckCircle}
              />
            )}
          </div>
        </div>
        <div className={styles.ratingInfo}>
          <div className={styles.stars}>
            {[...Array(5)].map((_, i) => (
              <FiStar
                key={i}
                size={16}
                style={{
                  fill: i < rating.rating ? "#FFB300" : "none",
                  color: i < rating.rating ? "#FFB300" : "#e0e0e0",
                }}
              />
            ))}
          </div>
          <span className={styles.time}>{timeAgo(rating.createdAt)}</span>
        </div>
      </div>

      <div className={styles.reviewContent}>
        <p className={styles.reviewText}>
          {isExpanded ? rating.review : truncate(rating.review, 200)}
        </p>
        {rating.review && rating.review.length > 200 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={styles.readMore}
          >
            {isExpanded ? "Read Less" : "Read More"}
          </button>
        )}
      </div>

      <div className={styles.footer}>
        <span className={styles.helpfulText}>Was this review helpful?</span>
        <div className={styles.helpfulButtons}>
          <button
            onClick={() => handleHelpful(true)}
            className={styles.helpfulBtn}
          >
            <FiThumbsUp size={16} />
            <span>{rating.helpfulCount || 0}</span>
          </button>
          <button
            onClick={() => handleHelpful(false)}
            className={styles.helpfulBtn}
          >
            <FiThumbsDown size={16} />
            <span>{rating.unhelpfulCount || 0}</span>
          </button>
        </div>
      </div>
    </Card>
  );
};

export default RatingItem;
