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
import styles from "./styles/UserProfile.module.css";

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
        <div className={styles.container}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>❌</div>
            <h2 className={styles.errorTitle}>User Not Found</h2>
            <p className={styles.errorText}>
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
        <div className={styles.container}>
          <Loader size="lg" text="Loading profile..." fullScreen={false} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        {/* Header with Back Button */}
        <div className={styles.header}>
          <Button
            variant="ghost"
            size="sm"
            icon={FiArrowLeft}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          {!isOwnProfile && (
            <div className={styles.actionButtons}>
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
        <div className={styles.gridContainer}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            {/* Profile Card */}
            <div className={styles.section}>
              <ProfileCard
                user={profile}
                isOwnProfile={isOwnProfile}
                onEdit={() => navigate("/dashboard")}
              />
            </div>

            {/* User Stats */}
            <div className={styles.section}>
              <UserStats userId={userId} />
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>
            {/* About Section */}
            {profile?.bio && (
              <div className={styles.section}>
                <Card padding="lg" shadow="md">
                  <h3 className={styles.sectionTitle}>About</h3>
                  <p className={styles.aboutText}>{profile.bio}</p>
                </Card>
              </div>
            )}

            {/* Information Card */}
            <div className={styles.section}>
              <Card padding="lg" shadow="md">
                <h3 className={styles.sectionTitle}>Information</h3>
                <div className={styles.infoGrid}>
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
              <div className={styles.section}>
                <Card padding="lg" shadow="md">
                  <h3 className={styles.sectionTitle}>Badges</h3>
                  <div className={styles.badgesGrid}>
                    {profile.badges.map((badge) => (
                      <div key={badge._id} className={styles.badgeItem}>
                        <span className={styles.badgeIcon}>{badge.icon}</span>
                        <span className={styles.badgeName}>{badge.name}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Achievements */}
            {stats && (
              <div className={styles.section}>
                <Card padding="lg" shadow="md">
                  <h3 className={styles.sectionTitle}>Achievements</h3>
                  <div className={styles.achievementsGrid}>
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
        <div className={styles.section}>
          <UserActivity userId={userId} limit={10} />
        </div>
      </div>
    </Layout>
  );
};

// Info Item Component
const InfoItem = ({ label, value }) => (
  <div className={styles.infoItem}>
    <span className={styles.infoLabel}>{label}</span>
    <span className={styles.infoValue}>{value}</span>
  </div>
);

// Achievement Item Component
const AchievementItem = ({ icon, title, description }) => (
  <div className={styles.achievementItem}>
    <div className={styles.achievementIcon}>{icon}</div>
    <h4 className={styles.achievementTitle}>{title}</h4>
    <p className={styles.achievementDescription}>{description}</p>
  </div>
);

export default UserProfile;
