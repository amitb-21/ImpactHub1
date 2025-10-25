import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCommunityGallery } from "../../store/slices/photoSlice";
import { Card } from "../common/Card";
import { Button } from "../common/Button";
import { Loader } from "../common/Loader";
import { Modal } from "../common/Modal";
import { FiArrowRight, FiHeart, FiX } from "react-icons/fi";

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
        <div style={styles.loadingContainer}>
          <Loader size="sm" text="Loading gallery..." />
        </div>
      </Card>
    );
  }

  const photos = communityGallery.data.slice(0, maxPhotos);

  if (photos.length === 0) {
    return (
      <Card padding="lg" shadow="md">
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📸</div>
          <p style={styles.emptyStateTitle}>No Photos Yet</p>
          <p style={styles.emptyStateText}>
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
        <div style={styles.header}>
          <h3 style={styles.title}>Community Gallery</h3>
          <span style={styles.photoCount}>
            {communityGallery.pagination?.total || 0} photos
          </span>
        </div>

        {/* Photo Grid */}
        <div style={styles.grid}>
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
          <div style={styles.viewAllContainer}>
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

// Photo Thumbnail Component
const PhotoThumbnail = ({ photo, index, onClick }) => (
  <div style={styles.photoThumbnail} onClick={onClick}>
    <img
      src={photo.photoUrl}
      alt={`Gallery ${index + 1}`}
      style={styles.thumbnailImage}
      onError={(e) => {
        e.target.src = "https://via.placeholder.com/200x200?text=Photo";
      }}
    />

    {/* Overlay on Hover */}
    <div style={styles.thumbnailOverlay}>
      <div style={styles.overlayContent}>
        <span style={styles.viewIcon}>👁️</span>
        <p style={styles.viewText}>View</p>
      </div>

      {/* Likes Badge */}
      <div style={styles.likesBadge}>
        <FiHeart size={14} />
        <span>{photo.likes?.length || 0}</span>
      </div>
    </div>

    {/* Photo Type Badge */}
    {photo.photoType && (
      <div style={styles.typeBadge}>{getPhotoTypeLabel(photo.photoType)}</div>
    )}
  </div>
);

// Photo Lightbox Modal Component
const PhotoLightbox = ({
  photo,
  photos,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}) => (
  <Modal isOpen={true} onClose={onClose} title="" size="xl" showCloseBtn={true}>
    <div style={styles.lightboxContainer}>
      {/* Main Image */}
      <div style={styles.lightboxImageContainer}>
        <img
          src={photo.photoUrl}
          alt="Photo"
          style={styles.lightboxImage}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/800x600?text=Photo";
          }}
        />

        {/* Navigation Arrows */}
        {currentIndex > 0 && (
          <button
            style={styles.navButton}
            onClick={onPrev}
            title="Previous photo"
          >
            ◀
          </button>
        )}

        {currentIndex < photos.length - 1 && (
          <button
            style={{ ...styles.navButton, right: "16px", left: "auto" }}
            onClick={onNext}
            title="Next photo"
          >
            ▶
          </button>
        )}

        {/* Photo Counter */}
        <div style={styles.photoCounter}>
          {currentIndex + 1} / {photos.length}
        </div>
      </div>

      {/* Photo Info */}
      <div style={styles.lightboxInfo}>
        {/* Description */}
        {photo.description && (
          <div style={styles.infoSection}>
            <h4 style={styles.infoTitle}>Description</h4>
            <p style={styles.infoText}>{photo.description}</p>
          </div>
        )}

        {/* Photo Details */}
        <div style={styles.detailsGrid}>
          {/* Type */}
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Type</span>
            <span style={styles.detailValue}>
              {getPhotoTypeLabel(photo.photoType)}
            </span>
          </div>

          {/* Uploaded By */}
          {photo.uploadedBy && (
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Uploaded By</span>
              <span style={styles.detailValue}>{photo.uploadedBy.name}</span>
            </div>
          )}

          {/* Date */}
          {photo.createdAt && (
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Date</span>
              <span style={styles.detailValue}>
                {new Date(photo.createdAt).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Likes */}
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Likes</span>
            <span style={styles.detailValue}>
              <FiHeart
                size={14}
                style={{ display: "inline", marginRight: "4px" }}
              />
              {photo.likes?.length || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  </Modal>
);

// Helper function
const getPhotoTypeLabel = (type) => {
  const typeMap = {
    event_preview: "Event Preview",
    during_event: "During Event",
    after_event: "After Event",
  };
  return typeMap[type] || type;
};

const styles = {
  loadingContainer: {
    padding: "60px 20px",
    textAlign: "center",
  },

  emptyState: {
    padding: "80px 40px",
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: "56px",
    marginBottom: "16px",
    display: "block",
  },

  emptyStateTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#212121",
    margin: "0 0 8px 0",
  },

  emptyStateText: {
    fontSize: "14px",
    color: "#999",
    margin: 0,
  },

  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
    paddingBottom: "16px",
    borderBottom: "2px solid #e0e0e0",
  },

  title: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#212121",
    margin: 0,
  },

  photoCount: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#666",
    backgroundColor: "#f0f8f7",
    padding: "6px 12px",
    borderRadius: "20px",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },

  photoThumbnail: {
    position: "relative",
    width: "100%",
    aspectRatio: "1",
    borderRadius: "10px",
    overflow: "hidden",
    cursor: "pointer",
    backgroundColor: "#e0e0e0",
  },

  thumbnailImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "transform 0.3s ease",
  },

  thumbnailOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0,
    transition: "opacity 0.3s ease",
  },

  overlayContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    color: "#FAFAFA",
  },

  viewIcon: {
    fontSize: "28px",
  },

  viewText: {
    fontSize: "13px",
    fontWeight: "600",
    margin: 0,
  },

  likesBadge: {
    position: "absolute",
    bottom: "8px",
    right: "8px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    padding: "6px 10px",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "#FAFAFA",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
  },

  typeBadge: {
    position: "absolute",
    top: "8px",
    left: "8px",
    padding: "4px 8px",
    backgroundColor: "#00796B",
    color: "#FAFAFA",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "600",
  },

  viewAllContainer: {
    display: "flex",
    justifyContent: "center",
    paddingTop: "16px",
    borderTop: "1px solid #e0e0e0",
  },

  // Lightbox styles
  lightboxContainer: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "24px",
    minHeight: "500px",
  },

  lightboxImageContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: "10px",
    overflow: "hidden",
  },

  lightboxImage: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
  },

  navButton: {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    left: "16px",
    width: "40px",
    height: "40px",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    color: "#FAFAFA",
    border: "none",
    borderRadius: "4px",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background 0.3s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  photoCounter: {
    position: "absolute",
    bottom: "16px",
    right: "16px",
    padding: "6px 12px",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    color: "#FAFAFA",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
  },

  lightboxInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    paddingRight: "16px",
    overflowY: "auto",
  },

  infoSection: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },

  infoTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#212121",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  infoText: {
    fontSize: "13px",
    color: "#666",
    margin: 0,
    lineHeight: "1.5",
  },

  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
  },

  detailItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "12px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
  },

  detailLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  detailValue: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#212121",
  },

  "@media (max-width: 768px)": {
    lightboxContainer: {
      gridTemplateColumns: "1fr",
      minHeight: "auto",
    },
    grid: {
      gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    },
  },
};

export default CommunityGallery;
