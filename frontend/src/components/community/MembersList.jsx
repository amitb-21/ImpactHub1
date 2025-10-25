import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { Loader } from "../common/Loader";
import { FiUser, FiTrendingUp, FiCalendar, FiArrowRight } from "react-icons/fi";
import { formatDate, calculateRank, truncate } from "../../config/helpers";
import { formatPoints } from "../../config/formatters";

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

  if (isLoading) {
    return (
      <Card padding="lg" shadow="md">
        <div style={styles.loadingContainer}>
          <Loader size="sm" text="Loading members..." />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card padding="lg" shadow="md">
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>⚠️</div>
          <p style={styles.errorText}>{error}</p>
        </div>
      </Card>
    );
  }

  if (!members || members.length === 0) {
    return (
      <Card padding="lg" shadow="md">
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>👥</div>
          <p style={styles.emptyStateTitle}>No Members Yet</p>
          <p style={styles.emptyStateText}>
            Members will appear here as they join the community
          </p>
        </div>
      </Card>
    );
  }

  const displayedMembers = maxMembers ? members.slice(0, maxMembers) : members;

  if (compact) {
    return (
      <Card padding="lg" shadow="md">
        <div style={styles.header}>
          <h3 style={styles.title}>Members ({members.length})</h3>
        </div>
        <div style={styles.compactGrid}>
          {displayedMembers.map((member) => (
            <MemberCompactCard key={member._id} member={member} />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg" shadow="md">
      <div style={styles.header}>
        <h3 style={styles.title}>Community Members</h3>
        <span style={styles.memberCount}>{members.length} members</span>
      </div>

      {/* Members List */}
      <div style={styles.membersList}>
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
        <div style={styles.viewAllContainer}>
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

// Member List Item Component
const MemberListItem = ({ member, isLast }) => {
  const navigate = useNavigate();
  const rank = calculateRank(member.totalPoints || 0);

  return (
    <div
      style={{
        ...styles.memberItem,
        borderBottom: isLast ? "none" : "1px solid #e0e0e0",
      }}
    >
      {/* Avatar & Name */}
      <div style={styles.memberInfo}>
        <div style={styles.avatarWrapper}>
          {member.profileImage ? (
            <img
              src={member.profileImage}
              alt={member.name}
              style={styles.avatar}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/50?text=User";
              }}
            />
          ) : (
            <div style={styles.avatarPlaceholder}>
              {member.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}

          {/* Rank Badge */}
          {rank && (
            <div
              style={{
                ...styles.rankBadge,
                backgroundColor: rank.color,
              }}
            >
              {rank.icon || "🏆"}
            </div>
          )}
        </div>

        <div style={styles.nameSection}>
          <button
            onClick={() => navigate(`/profile/${member._id}`)}
            style={styles.memberName}
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

          {/* Email (optional) */}
          <p style={styles.memberEmail}>{truncate(member.email, 30)}</p>
        </div>
      </div>

      {/* Stats */}
      <div style={styles.memberStats}>
        {/* Points */}
        <div style={styles.stat}>
          <FiTrendingUp size={16} style={{ color: "#FFB300" }} />
          <span style={styles.statValue}>
            {formatPoints(member.totalPoints || 0)}
          </span>
          <span style={styles.statLabel}>Points</span>
        </div>

        {/* Rank */}
        {rank && (
          <div style={styles.stat}>
            <span style={{ ...styles.statValue, color: rank.color }}>
              {rank.name}
            </span>
            <span style={styles.statLabel}>Rank</span>
          </div>
        )}

        {/* Events Attended */}
        <div style={styles.stat}>
          <FiCalendar size={16} style={{ color: "#00796B" }} />
          <span style={styles.statValue}>{member.eventsAttended || 0}</span>
          <span style={styles.statLabel}>Events</span>
        </div>

        {/* Joined Date */}
        <div style={styles.stat}>
          <span style={styles.statValue}>{formatDate(member.createdAt)}</span>
          <span style={styles.statLabel}>Joined</span>
        </div>
      </div>

      {/* Action Button */}
      <div style={styles.action}>
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

// Member Compact Card Component
const MemberCompactCard = ({ member }) => {
  const navigate = useNavigate();
  const rank = calculateRank(member.totalPoints || 0);

  return (
    <div
      style={styles.compactCard}
      onClick={() => navigate(`/profile/${member._id}`)}
    >
      {/* Avatar */}
      <div style={styles.compactAvatarWrapper}>
        {member.profileImage ? (
          <img
            src={member.profileImage}
            alt={member.name}
            style={styles.compactAvatar}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/60?text=User";
            }}
          />
        ) : (
          <div style={styles.compactAvatarPlaceholder}>
            {member.name?.charAt(0).toUpperCase() || "U"}
          </div>
        )}

        {/* Rank Badge */}
        {rank && (
          <div
            style={{
              ...styles.compactRankBadge,
              backgroundColor: rank.color,
            }}
          >
            {rank.icon || "🏆"}
          </div>
        )}
      </div>

      {/* Info */}
      <div style={styles.compactInfo}>
        <p style={styles.compactName}>{truncate(member.name, 20)}</p>
        <p style={styles.compactPoints}>
          <FiTrendingUp
            size={12}
            style={{ display: "inline", marginRight: "2px" }}
          />
          {formatPoints(member.totalPoints || 0)}
        </p>
        {rank && (
          <p style={{ ...styles.compactRank, color: rank.color }}>
            {rank.name}
          </p>
        )}
      </div>
    </div>
  );
};

const styles = {
  loadingContainer: {
    padding: "60px 20px",
    textAlign: "center",
  },

  errorContainer: {
    padding: "40px 20px",
    textAlign: "center",
    backgroundColor: "#fee2e2",
    borderRadius: "10px",
  },

  errorIcon: {
    fontSize: "32px",
    marginBottom: "12px",
    display: "block",
  },

  errorText: {
    color: "#991b1b",
    fontSize: "14px",
    margin: 0,
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

  memberCount: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#666",
    backgroundColor: "#f0f8f7",
    padding: "6px 12px",
    borderRadius: "20px",
  },

  membersList: {
    display: "flex",
    flexDirection: "column",
  },

  memberItem: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "16px 0",
    justifyContent: "space-between",
  },

  memberInfo: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    flex: 1,
  },

  avatarWrapper: {
    position: "relative",
    width: "50px",
    height: "50px",
    flexShrink: 0,
  },

  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #00796B",
  },

  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    backgroundColor: "#00796B",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "700",
    color: "#FAFAFA",
    border: "3px solid #00796B",
  },

  rankBadge: {
    position: "absolute",
    bottom: "0",
    right: "0",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #FAFAFA",
    fontSize: "12px",
  },

  nameSection: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  memberName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#00796B",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    textDecoration: "none",
    transition: "color 0.2s ease",
  },

  memberEmail: {
    fontSize: "12px",
    color: "#999",
    margin: 0,
  },

  memberStats: {
    display: "flex",
    gap: "24px",
    alignItems: "center",
    flex: 1,
  },

  stat: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    minWidth: "70px",
  },

  statValue: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#212121",
  },

  statLabel: {
    fontSize: "11px",
    color: "#999",
    fontWeight: "500",
  },

  action: {
    flexShrink: 0,
  },

  viewAllContainer: {
    display: "flex",
    justifyContent: "center",
    paddingTop: "16px",
    borderTop: "1px solid #e0e0e0",
  },

  // Compact styles
  compactGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))",
    gap: "12px",
  },

  compactCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "12px",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    border: "1px solid #e0e0e0",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  compactAvatarWrapper: {
    position: "relative",
    width: "60px",
    height: "60px",
  },

  compactAvatar: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #00796B",
  },

  compactAvatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    backgroundColor: "#00796B",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "700",
    color: "#FAFAFA",
    border: "3px solid #00796B",
  },

  compactRankBadge: {
    position: "absolute",
    bottom: "-2px",
    right: "-2px",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #FAFAFA",
    fontSize: "14px",
  },

  compactInfo: {
    textAlign: "center",
  },

  compactName: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#212121",
    margin: 0,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%",
  },

  compactPoints: {
    fontSize: "12px",
    color: "#FFB300",
    fontWeight: "600",
    margin: "2px 0",
  },

  compactRank: {
    fontSize: "11px",
    fontWeight: "600",
    margin: 0,
  },

  "@media (max-width: 768px)": {
    memberItem: {
      flexDirection: "column",
      alignItems: "flex-start",
    },
    memberStats: {
      width: "100%",
      gap: "12px",
    },
    compactGrid: {
      gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
    },
  },
};

export default MembersList;
