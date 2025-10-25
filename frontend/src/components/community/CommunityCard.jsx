import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { FiUsers, FiMapPin, FiCheckCircle } from "react-icons/fi";
import { truncate } from "../../config/helpers";
import { calculateTier } from "../../config/helpers";
import styles from "./styles/CommunityCard.module.css";

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
        <div className={styles.emptyState}>
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
        <div className={styles.compactContainer}>
          <div className={styles.compactImage}>
            {community.image ? (
              <img
                src={community.image}
                alt={community.name}
                className={styles.compactImageTag}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/60?text=Community";
                }}
              />
            ) : (
              <div className={styles.compactImagePlaceholder}>👥</div>
            )}
          </div>
          <div className={styles.compactContent}>
            <div className={styles.compactHeader}>
              <h4 className={styles.compactName}>
                {truncate(community.name, 25)}
              </h4>
              {isVerified && (
                <FiCheckCircle size={14} style={{ color: "#10b981" }} />
              )}
            </div>
            <p className={styles.compactMembers}>
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
      <div className={styles.imageContainer}>
        {community.image ? (
          <img
            src={community.image}
            alt={community.name}
            className={styles.image}
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/300x180?text=Community";
            }}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <span className={styles.placeholderIcon}>👥</span>
          </div>
        )}

        {/* Badges Overlay */}
        <div className={styles.badgesOverlay}>
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
      <div className={styles.content}>
        {/* Title */}
        <h3 className={styles.title}>{truncate(community.name, 50)}</h3>

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
        <p className={styles.description}>
          {truncate(community.description, 100)}
        </p>

        {/* Meta Info */}
        <div className={styles.metaContainer}>
          {/* Members */}
          <div className={styles.metaItem}>
            <FiUsers size={16} style={{ color: "#00796B" }} />
            <span className={styles.metaText}>{memberCount} members</span>
          </div>

          {/* Location */}
          {community.location?.city && (
            <div className={styles.metaItem}>
              <FiMapPin size={16} style={{ color: "#00796B" }} />
              <span className={styles.metaText}>{community.location.city}</span>
            </div>
          )}
        </div>

        {/* Organization Info */}
        {community.organizationDetails && (
          <div className={styles.orgInfo}>
            <p className={styles.orgLabel}>
              Est. {community.organizationDetails.foundedYear}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className={styles.actionContainer}>
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

export default CommunityCard;
