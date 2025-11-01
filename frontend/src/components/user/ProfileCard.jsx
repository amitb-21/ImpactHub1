import React from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Button } from "../common/Button";
import { FiEdit, FiMapPin, FiMail, FiCalendar, FiAward } from "react-icons/fi";
import { calculateRank } from "../../config/helpers";
import { formatPoints } from "../../config/formatters";
import { formatDate } from "../../config/helpers";

const ProfileCard = ({ user, isOwnProfile = false, onEdit }) => {
  const navigate = useNavigate();

  if (!user) {
    return (
      <Card padding="lg" style={styles.card}>
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>No user data available</p>
        </div>
      </Card>
    );
  }

  const rank = calculateRank(user.totalPoints || 0);
  const rankColor = rank?.color || "#10b981";

  return (
    <Card padding="lg" shadow="md" style={styles.card}>
      {/* Header with Edit Button */}
      <div style={styles.header}>
        <h3 style={styles.cardTitle}>Profile</h3>
        {isOwnProfile && (
          <Button
            size="sm"
            variant="ghost"
            icon={FiEdit}
            onClick={onEdit}
            style={{ padding: "8px 12px" }}
          >
            Edit
          </Button>
        )}
      </div>

      {/* Profile Content */}
      <div style={styles.content}>
        {/* Avatar Section */}
        <div style={styles.avatarSection}>
          <div style={styles.avatarWrapper}>
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                style={styles.avatar}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/120?text=" +
                    (user.name?.charAt(0).toUpperCase() || "U");
                }}
              />
            ) : (
              <div style={styles.avatarPlaceholder}>
                <span style={styles.avatarInitial}>
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            )}

            {/* Rank Badge Overlay */}
            {rank && (
              <div style={{ ...styles.rankBadge, backgroundColor: rankColor }}>
                <span style={styles.rankEmoji}>{rank.icon || "🏆"}</span>
              </div>
            )}
          </div>

          {/* User Name & Role */}
          <div style={styles.nameSection}>
            <h2 style={styles.userName}>{user.name}</h2>

            {/* Role Badge */}
            {user.role && user.role !== "user" && (
              <Badge
                label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                variant={user.role === "admin" ? "error" : "warning"}
                size="sm"
                style={{ marginTop: "4px" }}
              />
            )}
          </div>
        </div>

        {/* Bio */}
        {user.bio && (
          <div style={styles.bioSection}>
            <p style={styles.bio}>{user.bio}</p>
          </div>
        )}

        {/* User Info Grid */}
        <div style={styles.infoGrid}>
          {/* Email */}
          {user.email && (
            <div style={styles.infoItem}>
              <FiMail size={16} style={{ color: "#00796B" }} />
              <span style={styles.infoText}>{user.email}</span>
            </div>
          )}

          {/* Location */}
          {user.location && (
            <div style={styles.infoItem}>
              <FiMapPin size={16} style={{ color: "#00796B" }} />
              <span style={styles.infoText}>{user.location}</span>
            </div>
          )}

          {/* Member Since (only show when available) */}
          {user?.createdAt && (
            <div style={styles.infoItem}>
              <FiCalendar size={16} style={{ color: "#00796B" }} />
              <span style={styles.infoText}>
                Member since {formatDate(user.createdAt)}
              </span>
            </div>
          )}
        </div>

        {/* Points & Level */}
        <div style={styles.statsSection}>
          {/* Total Points */}
          <div style={styles.statBox}>
            <div style={styles.statIcon}>⭐</div>
            <div style={styles.statContent}>
              <span style={styles.statValue}>
                {formatPoints(user.totalPoints || 0)}
              </span>
              <span style={styles.statLabel}>Total Points</span>
            </div>
          </div>

          {/* Rank */}
          {rank && (
            <div style={styles.statBox}>
              <div
                style={{
                  ...styles.statIcon,
                  backgroundColor: `${rankColor}20`,
                  color: rankColor,
                }}
              >
                {rank.icon || "🏆"}
              </div>
              <div style={styles.statContent}>
                <span style={{ ...styles.statValue, color: rankColor }}>
                  {rank.name}
                </span>
                <span style={styles.statLabel}>Current Rank</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isOwnProfile && (
          <div style={styles.actions}>
            <Button
              size="sm"
              variant="outline"
              fullWidth
              onClick={() => navigate(`/profile/${user._id}`)}
            >
              View Full Profile
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

const styles = {
  card: {
    width: "100%",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
    paddingBottom: "12px",
    borderBottom: "2px solid #e0e0e0",
  },
  cardTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#212121",
    margin: 0,
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  avatarSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  avatarWrapper: {
    position: "relative",
    width: "120px",
    height: "120px",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
    border: "4px solid #00796B",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    backgroundColor: "#00796B",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "4px solid #00796B",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  avatarInitial: {
    fontSize: "48px",
    fontWeight: "700",
    color: "#FAFAFA",
  },
  rankBadge: {
    position: "absolute",
    bottom: "0",
    right: "0",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "3px solid #FAFAFA",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
  },
  rankEmoji: {
    fontSize: "18px",
  },
  nameSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  },
  userName: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#212121",
    margin: 0,
    textAlign: "center",
  },
  bioSection: {
    padding: "12px 16px",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px",
    borderLeft: "3px solid #00796B",
  },
  bio: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#666",
    margin: 0,
    textAlign: "center",
  },
  infoGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  infoItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 12px",
    backgroundColor: "#f9f9f9",
    borderRadius: "6px",
  },
  infoText: {
    fontSize: "13px",
    color: "#666",
    fontWeight: "500",
  },
  statsSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "8px",
  },
  statBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    border: "1px solid #e0e0e0",
  },
  statIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    backgroundColor: "#fff3cd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    flexShrink: 0,
  },
  statContent: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    minWidth: 0,
  },
  statValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#212121",
  },
  statLabel: {
    fontSize: "11px",
    color: "#999",
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  actions: {
    marginTop: "8px",
  },
  emptyState: {
    padding: "40px 20px",
    textAlign: "center",
  },
  emptyText: {
    fontSize: "14px",
    color: "#999",
    margin: 0,
  },
};

export default ProfileCard;
