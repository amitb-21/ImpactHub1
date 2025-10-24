import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import {
  fetchUserProfile,
  fetchUserStats,
  fetchUserActivity,
} from "../store/slices/userSlice";
import Layout from "../components/common/Layout";
import ProfileCard from "../components/user/ProfileCard";
import UserStats from "../components/user/UserStats";
import UserActivity from "../components/user/UserActivity";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Loader } from "../components/common/Loader";
import { FiArrowLeft, FiMessageSquare, FiShare2 } from "react-icons/fi";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: currentUser } = useAuth();
  const { profile, stats, isLoading, error } = useSelector(
    (state) => state.user
  );
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Fetch user data on mount or when userId changes
  useEffect(() => {
    if (userId) {
      dispatch(fetchUserProfile(userId));
      dispatch(fetchUserStats(userId));
      dispatch(fetchUserActivity({ userId, page: 1 }));

      // Check if it's own profile
      setIsOwnProfile(userId === currentUser?._id);
    }
  }, [userId, currentUser?._id, dispatch]);

  if (error) {
    return (
      <Layout>
        <div style={styles.container}>
          <div style={styles.errorContainer}>
            <div style={styles.errorIcon}>❌</div>
            <h2 style={styles.errorTitle}>User Not Found</h2>
            <p style={styles.errorText}>
              The user you're looking for doesn't exist or has been removed.
            </p>
            <Button
              variant="primary"
              onClick={() => navigate("/communities")}
              icon={FiArrowLeft}
            >
              Go Back
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading || !profile) {
    return (
      <Layout>
        <div style={styles.container}>
          <Loader size="lg" text="Loading profile..." fullScreen={false} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.container}>
        {/* Header with Back Button */}
        <div style={styles.header}>
          <Button
            variant="ghost"
            size="sm"
            icon={FiArrowLeft}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          {!isOwnProfile && (
            <div style={styles.actionButtons}>
              <Button variant="outline" size="sm" icon={FiMessageSquare}>
                Message
              </Button>
              <Button variant="primary" size="sm" icon={FiShare2}>
                Share Profile
              </Button>
            </div>
          )}
        </div>

        {/* Main Grid */}
        <div style={styles.gridContainer}>
          {/* Left Column */}
          <div style={styles.leftColumn}>
            {/* Profile Card */}
            <div style={styles.section}>
              <ProfileCard
                user={profile}
                isOwnProfile={isOwnProfile}
                onEdit={() => navigate("/dashboard")}
              />
            </div>

            {/* User Stats */}
            <div style={styles.section}>
              <UserStats userId={userId} />
            </div>
          </div>

          {/* Right Column */}
          <div style={styles.rightColumn}>
            {/* About Section */}
            {profile?.bio && (
              <div style={styles.section}>
                <Card padding="lg" shadow="md">
                  <h3 style={styles.sectionTitle}>About</h3>
                  <p style={styles.aboutText}>{profile.bio}</p>
                </Card>
              </div>
            )}

            {/* Information Card */}
            <div style={styles.section}>
              <Card padding="lg" shadow="md">
                <h3 style={styles.sectionTitle}>Information</h3>
                <div style={styles.infoGrid}>
                  {profile?.email && (
                    <InfoItem label="Email" value={profile.email} />
                  )}
                  {profile?.location && (
                    <InfoItem label="Location" value={profile.location} />
                  )}
                  {profile?.role && profile.role !== "user" && (
                    <InfoItem
                      label="Role"
                      value={
                        profile.role.charAt(0).toUpperCase() +
                        profile.role.slice(1)
                      }
                    />
                  )}
                  {profile?.createdAt && (
                    <InfoItem
                      label="Member Since"
                      value={new Date(profile.createdAt).toLocaleDateString()}
                    />
                  )}
                </div>
              </Card>
            </div>

            {/* Badges Section (if any) */}
            {profile?.badges && profile.badges.length > 0 && (
              <div style={styles.section}>
                <Card padding="lg" shadow="md">
                  <h3 style={styles.sectionTitle}>Badges</h3>
                  <div style={styles.badgesGrid}>
                    {profile.badges.map((badge) => (
                      <div key={badge._id} style={styles.badgeItem}>
                        <span style={styles.badgeIcon}>{badge.icon}</span>
                        <span style={styles.badgeName}>{badge.name}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Achievements */}
            {stats && (
              <div style={styles.section}>
                <Card padding="lg" shadow="md">
                  <h3 style={styles.sectionTitle}>Achievements</h3>
                  <div style={styles.achievementsGrid}>
                    <AchievementItem
                      icon="🎯"
                      title="Event Master"
                      description={`Participated in ${
                        stats?.eventsAttended || 0
                      } events`}
                    />
                    <AchievementItem
                      icon="👥"
                      title="Community Builder"
                      description={`Joined ${
                        stats?.communitiesJoined || 0
                      } communities`}
                    />
                    <AchievementItem
                      icon="⭐"
                      title="Points Collector"
                      description={`Earned ${stats?.totalPoints || 0} points`}
                    />
                    <AchievementItem
                      icon="⏱️"
                      title="Volunteer"
                      description={`${
                        stats?.hoursVolunteered || 0
                      } hours volunteered`}
                    />
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div style={styles.section}>
          <UserActivity userId={userId} limit={10} />
        </div>
      </div>
    </Layout>
  );
};

// Info Item Component
const InfoItem = ({ label, value }) => (
  <div style={styles.infoItem}>
    <span style={styles.infoLabel}>{label}</span>
    <span style={styles.infoValue}>{value}</span>
  </div>
);

// Achievement Item Component
const AchievementItem = ({ icon, title, description }) => (
  <div style={styles.achievementItem}>
    <div style={styles.achievementIcon}>{icon}</div>
    <h4 style={styles.achievementTitle}>{title}</h4>
    <p style={styles.achievementDescription}>{description}</p>
  </div>
);

const styles = {
  container: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "32px",
    paddingBottom: "20px",
    borderBottom: "2px solid #e0e0e0",
  },
  actionButtons: {
    display: "flex",
    gap: "12px",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "32px",
    marginBottom: "40px",
  },
  leftColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  rightColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  section: {
    display: "flex",
    flexDirection: "column",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#212121",
    margin: "0 0 16px 0",
  },
  aboutText: {
    fontSize: "14px",
    color: "#666",
    lineHeight: "1.6",
    margin: 0,
  },
  infoGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    padding: "12px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
  },
  infoLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#999",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  infoValue: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#00796B",
  },
  badgesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
    gap: "12px",
  },
  badgeItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    padding: "12px",
    backgroundColor: "#f0f8f7",
    borderRadius: "8px",
    textAlign: "center",
  },
  badgeIcon: {
    fontSize: "28px",
  },
  badgeName: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#212121",
  },
  achievementsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "16px",
  },
  achievementItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "16px",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    border: "1px solid #e0e0e0",
    textAlign: "center",
  },
  achievementIcon: {
    fontSize: "32px",
  },
  achievementTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#212121",
    margin: 0,
  },
  achievementDescription: {
    fontSize: "11px",
    color: "#999",
    margin: 0,
    lineHeight: "1.4",
  },
  errorContainer: {
    padding: "80px 40px",
    textAlign: "center",
  },
  errorIcon: {
    fontSize: "64px",
    marginBottom: "16px",
    display: "block",
  },
  errorTitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#212121",
    margin: "0 0 12px 0",
  },
  errorText: {
    fontSize: "15px",
    color: "#666",
    margin: "0 0 24px 0",
    maxWidth: "400px",
    marginLeft: "auto",
    marginRight: "auto",
  },

  "@media (max-width: 768px)": {
    gridContainer: {
      gridTemplateColumns: "1fr",
      gap: "24px",
    },
    header: {
      flexDirection: "column",
      alignItems: "flex-start",
      gap: "16px",
    },
    actionButtons: {
      width: "100%",
    },
    infoGrid: {
      gridTemplateColumns: "1fr",
    },
    achievementsGrid: {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
  },
};

export default UserProfile;
