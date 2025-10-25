import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { FiUsers, FiMapPin, FiCheckCircle, FiArrowRight } from "react-icons/fi";
import { truncate } from "../../config/helpers";
import { calculateTier } from "../../config/helpers";

const CommunityCard = ({
  community,
  onJoin,
  onView,
  style = {},
  compact = false,
}) => {
  const navigate = useNavigate();

  if (!community) {
    return (
      <Card padding="md" shadow="sm">
        <div style={styles.emptyState}>
          <p>No community data</p>
        </div>
      </Card>
    );
  }

  const tier = calculateTier(community.communityPoints || 0);
  const isVerified = community.verificationStatus === "verified";
  const memberCount = community.members?.length || 0;

  if (compact) {
    return (
      <Card
        onClick={() =>
          onView ? onView(community) : navigate(`/communities/${community._id}`)
        }
        hover
        shadow="sm"
        padding="sm"
        style={{ cursor: "pointer", ...style }}
      >
        <div style={styles.compactContainer}>
          <div style={styles.compactImage}>
            {community.image ? (
              <img
                src={community.image}
                alt={community.name}
                style={styles.compactImageTag}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/60?text=Community";
                }}
              />
            ) : (
              <div style={styles.compactImagePlaceholder}>👥</div>
            )}
          </div>
          <div style={styles.compactContent}>
            <div style={styles.compactHeader}>
              <h4 style={styles.compactName}>{truncate(community.name, 25)}</h4>
              {isVerified && (
                <FiCheckCircle size={14} style={{ color: "#10b981" }} />
              )}
            </div>
            <p style={styles.compactMembers}>
              <FiUsers
                size={12}
                style={{ display: "inline", marginRight: "4px" }}
              />
              {memberCount} members
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      onClick={() =>
        onView ? onView(community) : navigate(`/communities/${community._id}`)
      }
      hover
      shadow="md"
      padding="md"
      style={{ cursor: "pointer", ...style }}
    >
      {/* Header Image */}
      <div style={styles.imageContainer}>
        {community.image ? (
          <img
            src={community.image}
            alt={community.name}
            style={styles.image}
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/300x180?text=Community";
            }}
          />
        ) : (
          <div style={styles.imagePlaceholder}>
            <span style={styles.placeholderIcon}>👥</span>
          </div>
        )}

        {/* Badges Overlay */}
        <div style={styles.badgesOverlay}>
          {isVerified && (
            <Badge
              label="Verified"
              variant="success"
              size="sm"
              icon={FiCheckCircle}
              style={{ marginRight: "8px" }}
            />
          )}
          {tier && (
            <Badge
              label={tier.name}
              variant="primary"
              size="sm"
              style={{ backgroundColor: tier.color, color: "#FAFAFA" }}
            />
          )}
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Title */}
        <h3 style={styles.title}>{truncate(community.name, 50)}</h3>

        {/* Category Badge */}
        {community.category && (
          <Badge
            label={community.category}
            variant="primary"
            size="sm"
            style={{ marginBottom: "12px" }}
          />
        )}

        {/* Description */}
        <p style={styles.description}>{truncate(community.description, 100)}</p>

        {/* Meta Info */}
        <div style={styles.metaContainer}>
          {/* Members */}
          <div style={styles.metaItem}>
            <FiUsers size={16} style={{ color: "#00796B" }} />
            <span style={styles.metaText}>{memberCount} members</span>
          </div>

          {/* Location */}
          {community.location?.city && (
            <div style={styles.metaItem}>
              <FiMapPin size={16} style={{ color: "#00796B" }} />
              <span style={styles.metaText}>{community.location.city}</span>
            </div>
          )}
        </div>

        {/* Organization Info */}
        {community.organizationDetails && (
          <div style={styles.orgInfo}>
            <p style={styles.orgLabel}>
              Est. {community.organizationDetails.foundedYear}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div style={styles.actionContainer}>
          <Button
            size="sm"
            variant="primary"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              onJoin
                ? onJoin(community)
                : navigate(`/communities/${community._id}`);
            }}
          >
            View Community
          </Button>
        </div>
      </div>
    </Card>
  );
};

const styles = {
  emptyState: {
    padding: "40px 20px",
    textAlign: "center",
    color: "#999",
  },

  // Regular Card Styles
  imageContainer: {
    position: "relative",
    width: "100%",
    height: "180px",
    marginBottom: "16px",
    borderRadius: "8px",
    overflow: "hidden",
  },

  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e0f2f1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  placeholderIcon: {
    fontSize: "48px",
  },

  badgesOverlay: {
    position: "absolute",
    top: "12px",
    right: "12px",
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  content: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  title: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#212121",
    margin: 0,
    lineHeight: "1.3",
  },

  description: {
    fontSize: "13px",
    color: "#666",
    margin: 0,
    lineHeight: "1.4",
  },

  metaContainer: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },

  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    fontSize: "13px",
    color: "#666",
  },

  metaText: {
    fontWeight: "500",
  },

  orgInfo: {
    padding: "8px 12px",
    backgroundColor: "#f9f9f9",
    borderRadius: "6px",
  },

  orgLabel: {
    fontSize: "12px",
    color: "#999",
    margin: 0,
  },

  actionContainer: {
    display: "flex",
    gap: "8px",
    marginTop: "8px",
  },

  // Compact Card Styles
  compactContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  compactImage: {
    width: "60px",
    height: "60px",
    borderRadius: "8px",
    overflow: "hidden",
    flexShrink: 0,
  },

  compactImageTag: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  compactImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#e0f2f1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
  },

  compactContent: {
    flex: 1,
    minWidth: 0,
  },

  compactHeader: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginBottom: "4px",
  },

  compactName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#212121",
    margin: 0,
  },

  compactMembers: {
    fontSize: "12px",
    color: "#999",
    margin: 0,
  },
};

export default CommunityCard;
