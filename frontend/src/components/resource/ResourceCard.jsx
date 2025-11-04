import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { likeResource, unlikeResource } from "../../store/slices/resourceSlice";
import { useAuth } from "../../hooks/useAuth";
import { getInitials, truncate } from "../../config/helpers";
import { FiHeart, FiClock, FiEye } from "react-icons/fi";
import styles from "./styles/ResourceCard.module.css";

const ResourceCard = ({ resource, onView, ...props }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!resource) {
    return null;
  }

  const {
    _id,
    title,
    description,
    category,
    author,
    thumbnailImage,
    estimatedReadTime,
    likes,
    likedBy,
    views,
  } = resource;

  const isLiked = user && likedBy?.includes(user._id);

  const handleLike = (e) => {
    e.stopPropagation();
    if (!user) return navigate("/login");

    if (isLiked) {
      dispatch(unlikeResource(_id));
    } else {
      dispatch(likeResource(_id));
    }
  };

  const handleView = () => {
    if (onView) {
      onView(resource);
    } else {
      navigate(`/resources/${_id}`);
    }
  };

  const handleAuthorClick = (e) => {
    e.stopPropagation();
    if (author?._id) {
      navigate(`/profile/${author._id}`);
    }
  };

  return (
    <Card
      shadow="md"
      hover
      padding="none"
      className={styles.card}
      onClick={handleView}
      {...props}
    >
      {/* Image */}
      <div className={styles.imageContainer}>
        {thumbnailImage ? (
          <img src={thumbnailImage} alt={title} className={styles.image} />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span>📖</span>
          </div>
        )}
        <Badge
          label={category}
          variant="primary"
          size="sm"
          className={styles.categoryBadge}
        />
      </div>

      {/* Content */}
      <div className={styles.content}>
        <h3 className={styles.title}>{truncate(title, 60)}</h3>
        <p className={styles.description}>{truncate(description, 100)}</p>

        {/* Author Info */}
        {author && (
          <div className={styles.authorInfo} onClick={handleAuthorClick}>
            {author.profileImage ? (
              <img
                src={author.profileImage}
                alt={author.name}
                className={styles.authorAvatar}
              />
            ) : (
              <div className={styles.authorInitials}>
                {getInitials(author.name)}
              </div>
            )}
            <span className={styles.authorName}>{author.name}</span>
          </div>
        )}

        {/* Stats */}
        <div className={styles.statsContainer}>
          <div className={styles.statItem}>
            <FiClock size={14} />
            <span>{estimatedReadTime || 5} min read</span>
          </div>
          <div className={styles.statItem}>
            <FiEye size={14} />
            <span>{views || 0}</span>
          </div>
          <button
            className={`${styles.likeButton} ${isLiked ? styles.liked : ""}`}
            onClick={handleLike}
            title={isLiked ? "Unlike" : "Like"}
          >
            <FiHeart size={14} />
            <span>{likes || 0}</span>
          </button>
        </div>
      </div>
    </Card>
  );
};

export default ResourceCard;
