import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { Loader } from "../common/Loader";
import { FiUser, FiTrendingUp, FiCalendar, FiArrowRight } from "react-icons/fi";
import { formatDate, calculateRank, truncate } from "../../config/helpers";
import { formatPoints } from "../../config/formatters";
import styles from "./styles/MembersList.module.css";

const MembersList = ({
  communityId,
  members = [],
  isLoading = false,
  error = null,
  maxMembers = null,
  showViewAll = false,
  compact = false,
}) => {
  const navigate = useNavigate();

  // Loading State
  if (isLoading) {
    return (
      <Card padding="lg" shadow="md">
        <div className={styles.loadingContainer}>
          <Loader size="sm" text="Loading members..." />
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
        </div>
      </Card>
    );
  }

  // Empty State
  if (!members || members.length === 0) {
    return (
      <Card padding="lg" shadow="md">
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>👥</div>
          <p className={styles.emptyStateTitle}>No Members Yet</p>
          <p className={styles.emptyStateText}>
            Members will appear here as they join the community
          </p>
        </div>
      </Card>
    );
  }

  const displayedMembers = maxMembers ? members.slice(0, maxMembers) : members;

  // Compact View
  if (compact) {
    return (
      <Card padding="lg" shadow="md">
        <div className={styles.header}>
          <h3 className={styles.title}>Members ({members.length})</h3>
        </div>
        <div className={styles.compactGrid}>
          {displayedMembers.map((member) => (
            <MemberCompactCard key={member._id} member={member} />
          ))}
        </div>
      </Card>
    );
  }

  // Full View
  return (
    <Card padding="lg" shadow="md">
      <div className={styles.header}>
        <h3 className={styles.title}>Community Members</h3>
        <span className={styles.memberCount}>{members.length} members</span>
      </div>

      {/* Members List */}
      <div className={styles.membersList}>
        {displayedMembers.map((member, index) => (
          <MemberListItem
            key={member._id}
            member={member}
            isLast={index === displayedMembers.length - 1}
          />
        ))}
      </div>

      {/* View All Button */}
      {showViewAll && members.length > displayedMembers.length && (
        <div className={styles.viewAllContainer}>
          <Button
            variant="outline"
            size="sm"
            icon={FiArrowRight}
            iconPosition="right"
          >
            View All Members ({members.length})
          </Button>
        </div>
      )}
    </Card>
  );
};

/**
 * Member List Item Component
 * Displays full member card with avatar, info, and stats
 */
const MemberListItem = ({ member, isLast }) => {
  const navigate = useNavigate();
  const rank = calculateRank(member.totalPoints || 0);

  return (
    <div
      className={styles.memberItem}
      style={{
        borderBottom: isLast ? "none" : "1px solid #e0e0e0",
      }}
    >
      {/* Member Info Section */}
      <div className={styles.memberInfo}>
        {/* Avatar */}
        <div className={styles.avatarWrapper}>
          {member.profileImage ? (
            <img
              src={member.profileImage}
              alt={member.name}
              className={styles.avatar}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/50?text=User";
              }}
            />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {member.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}

          {/* Rank Badge */}
          {rank && (
            <div
              className={styles.rankBadge}
              style={{ backgroundColor: rank.color }}
            >
              {rank.icon || "🏆"}
            </div>
          )}
        </div>

        {/* Name Section */}
        <div className={styles.nameSection}>
          <button
            onClick={() => navigate(`/profile/${member._id}`)}
            className={styles.memberName}
          >
            {member.name}
          </button>

          {/* Role Badge */}
          {member.role && member.role !== "user" && (
            <Badge
              label={member.role.charAt(0).toUpperCase() + member.role.slice(1)}
              variant={member.role === "admin" ? "error" : "warning"}
              size="sm"
              style={{ marginTop: "4px", display: "inline-block" }}
            />
          )}

          {/* Email */}
          <p className={styles.memberEmail}>{truncate(member.email, 30)}</p>
        </div>
      </div>

      {/* Stats Section */}
      <div className={styles.memberStats}>
        {/* Points */}
        <div className={styles.stat}>
          <FiTrendingUp size={16} style={{ color: "#FFB300" }} />
          <span className={styles.statValue}>
            {formatPoints(member.totalPoints || 0)}
          </span>
          <span className={styles.statLabel}>Points</span>
        </div>

        {/* Rank */}
        {rank && (
          <div className={styles.stat}>
            <span className={styles.statValue} style={{ color: rank.color }}>
              {rank.name}
            </span>
            <span className={styles.statLabel}>Rank</span>
          </div>
        )}

        {/* Events Attended */}
        <div className={styles.stat}>
          <FiCalendar size={16} style={{ color: "#00796B" }} />
          <span className={styles.statValue}>{member.eventsAttended || 0}</span>
          <span className={styles.statLabel}>Events</span>
        </div>

        {/* Joined Date */}
        <div className={styles.stat}>
          <span className={styles.statValue}>
            {formatDate(member.createdAt)}
          </span>
          <span className={styles.statLabel}>Joined</span>
        </div>
      </div>

      {/* Action Button */}
      <div className={styles.action}>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => (window.location.href = `/profile/${member._id}`)}
          icon={FiArrowRight}
        >
          View
        </Button>
      </div>
    </div>
  );
};

/**
 * Member Compact Card Component
 * Lightweight version for grid displays
 */
const MemberCompactCard = ({ member }) => {
  const navigate = useNavigate();
  const rank = calculateRank(member.totalPoints || 0);

  return (
    <div
      className={styles.compactCard}
      onClick={() => navigate(`/profile/${member._id}`)}
    >
      {/* Avatar */}
      <div className={styles.compactAvatarWrapper}>
        {member.profileImage ? (
          <img
            src={member.profileImage}
            alt={member.name}
            className={styles.compactAvatar}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/60?text=User";
            }}
          />
        ) : (
          <div className={styles.compactAvatarPlaceholder}>
            {member.name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}

        {/* Rank Badge */}
        {rank && (
          <div
            className={styles.compactRankBadge}
            style={{ backgroundColor: rank.color }}
          >
            {rank.icon || "🏆"}
          </div>
        )}
      </div>

      {/* Info */}
      <div className={styles.compactInfo}>
        <p className={styles.compactName}>{truncate(member.name, 20)}</p>
        <p className={styles.compactPoints}>
          <FiTrendingUp
            size={12}
            style={{ display: "inline", marginRight: "2px" }}
          />
          {formatPoints(member.totalPoints || 0)}
        </p>
        {rank && (
          <p className={styles.compactRank} style={{ color: rank.color }}>
            {rank.name}
          </p>
        )}
      </div>
    </div>
  );
};

export default MembersList;
