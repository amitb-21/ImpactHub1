import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCommunityGallery,
  likePhoto,
} from "../../store/slices/photoSlice"; // <-- IMPORT likePhoto
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Loader } from "../common/Loader";
import { Modal } from "../common/Modal";
import { FiArrowRight, FiHeart, FiX } from "react-icons/fi";
import styles from "./styles/CommunityGallery.module.css";

const CommunityGallery = ({ communityId, maxPhotos = 6 }) => {
  const dispatch = useDispatch();
  const { communityGallery, isLoading } = useSelector((state) => state.photo);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (communityId) {
      dispatch(fetchCommunityGallery({ communityId, page }));
    }
  }, [communityId, page, dispatch]);

  if (isLoading && communityGallery.data.length === 0) {
    return (
      <Card padding="lg" shadow="md">
        <div className={styles.loadingContainer}>
          <Loader size="sm" text="Loading gallery..." />
        </div>
      </Card>
    );
  }

  const photos = communityGallery.data.slice(0, maxPhotos);

  if (photos.length === 0) {
    return (
      <Card padding="lg" shadow="md">
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📸</div>
          <p className={styles.emptyStateTitle}>No Photos Yet</p>
          <p className={styles.emptyStateText}>
            Community photos will appear here once events are organized
          </p>
        </div>
      </Card>
    );
  }

  const selectedPhoto =
    selectedPhotoIndex !== null ? photos[selectedPhotoIndex] : null;

  return (
    <>
      <Card padding="lg" shadow="md">
        <div className={styles.header}>
          <h3 className={styles.title}>Community Gallery</h3>
          <span className={styles.photoCount}>
            {communityGallery.pagination?.total || 0} photos
          </span>
        </div>

        {/* Photo Grid */}
        <div className={styles.grid}>
          {photos.map((photo, index) => (
            <PhotoThumbnail
              key={photo._id}
              photo={photo}
              index={index}
              onClick={() => setSelectedPhotoIndex(index)}
            />
          ))}
        </div>

        {/* View All Button */}
        {communityGallery.pagination?.total > maxPhotos && (
          <div className={styles.viewAllContainer}>
            <Button
              variant="outline"
              size="sm"
              icon={FiArrowRight}
              iconPosition="right"
            >
              View All Photos ({communityGallery.pagination.total})
            </Button>
          </div>
        )}
      </Card>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <PhotoLightbox
          photo={selectedPhoto}
          photos={photos}
          currentIndex={selectedPhotoIndex}
          onClose={() => setSelectedPhotoIndex(null)}
          onNext={() => {
            if (selectedPhotoIndex < photos.length - 1) {
              setSelectedPhotoIndex(selectedPhotoIndex + 1);
            }
          }}
          onPrev={() => {
            if (selectedPhotoIndex > 0) {
              setSelectedPhotoIndex(selectedPhotoIndex - 1);
            }
          }}
        />
      )}
    </>
  );
};

/**
 * Photo Thumbnail Component
 * Displays individual photo with hover overlay and badges
 */
const PhotoThumbnail = ({ photo, index, onClick }) => {
  const dispatch = useDispatch(); // <-- ADDED

  // <-- ADDED HANDLER -->
  const handleLike = (e) => {
    e.stopPropagation(); // Prevent modal from opening
    dispatch(likePhoto(photo._id));
  };

  return (
    <div className={styles.photoThumbnail} onClick={onClick}>
      <img
        src={photo.photoUrl}
        alt={`Gallery ${index + 1}`}
        className={styles.thumbnailImage}
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/200x200?text=Photo";
        }}
      />

      {/* Overlay on Hover */}
      <div className={styles.thumbnailOverlay}>
        <div className={styles.overlayContent}>
          <span className={styles.viewIcon}>👁️</span>
          <p className={styles.viewText}>View</p>
        </div>

        {/* Likes Badge --> ADDED onClick */}
        <div className={styles.likesBadge} onClick={handleLike}>
          <FiHeart size={14} />
          <span>{photo.likes?.length || 0}</span>
        </div>
      </div>

      {/* Photo Type Badge */}
      {photo.photoType && (
        <div className={styles.typeBadge}>
          {getPhotoTypeLabel(photo.photoType)}
        </div>
      )}
    </div>
  );
};

/**
 * Photo Lightbox Modal Component
 * Full-screen photo viewer with navigation and metadata
 */
const PhotoLightbox = ({
  photo,
  photos,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}) => {
  const dispatch = useDispatch(); // <-- ADDED

  // <-- ADDED HANDLER -->
  const handleLike = () => {
    dispatch(likePhoto(photo._id));
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title=""
      size="xl"
      showCloseBtn={true}
    >
      <div className={styles.lightboxContainer}>
        {/* Main Image */}
        <div className={styles.lightboxImageContainer}>
          <img
            src={photo.photoUrl}
            alt="Photo"
            className={styles.lightboxImage}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/800x600?text=Photo";
            }}
          />

          {/* Navigation Arrows */}
          {currentIndex > 0 && (
            <button
              className={styles.navButton}
              onClick={onPrev}
              title="Previous photo"
            >
              ◀
            </button>
          )}

          {currentIndex < photos.length - 1 && (
            <button
              style={{ right: "16px", left: "auto" }}
              className={styles.navButton}
              onClick={onNext}
              title="Next photo"
            >
              ▶
            </button>
          )}

          {/* Photo Counter */}
          <div className={styles.photoCounter}>
            {currentIndex + 1} / {photos.length}
          </div>
        </div>

        {/* Photo Info */}
        <div className={styles.lightboxInfo}>
          {/* Description */}
          {photo.description && (
            <div className={styles.infoSection}>
              <h4 className={styles.infoTitle}>Description</h4>
              <p className={styles.infoText}>{photo.description}</p>
            </div>
          )}

          {/* Photo Details */}
          <div className={styles.detailsGrid}>
            {/* Type */}
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Type</span>
              <span className={styles.detailValue}>
                {getPhotoTypeLabel(photo.photoType)}
              </span>
            </div>

            {/* Uploaded By */}
            {photo.uploadedBy && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Uploaded By</span>
                <span className={styles.detailValue}>
                  {photo.uploadedBy.name}
                </span>
              </div>
            )}

            {/* Date */}
            {photo.createdAt && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Date</span>
                <span className={styles.detailValue}>
                  {new Date(photo.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}

            {/* Likes --> MODIFIED TO BE A BUTTON */}
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Likes</span>
              <button
                className={styles.detailValue}
                onClick={handleLike}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  color: "#00796B",
                  fontWeight: 600,
                }}
              >
                <FiHeart size={14} style={{ display: "inline" }} />
                {photo.likes?.length || 0}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

/**
 * Helper function to get photo type label
 */
const getPhotoTypeLabel = (type) => {
  const typeMap = {
    event_preview: "Event Preview",
    during_event: "During Event",
    after_event: "After Event",
  };
  return typeMap[type] || type;
};

export default CommunityGallery;
