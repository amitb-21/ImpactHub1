import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import { fetchEvents } from "../store/slices/eventSlice";
import { fetchCommunities } from "../store/slices/communitySlice";
import { fetchUserMetrics } from "../store/slices/impactSlice";
import Layout from "../components/common/Layout";
import ProfileCard from "../components/user/ProfileCard";
import UserStats from "../components/user/UserStats";
import UserActivity from "../components/user/UserActivity";
import ProfileForm from "../components/user/ProfileForm";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Modal } from "../components/common/Modal";
import {
  FiEdit,
  FiArrowRight,
  FiCalendar,
  FiUsers,
  FiTrendingUp,
  FiBook,
} from "react-icons/fi";
import styles from "./styles/Dashboard.module.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [showEditForm, setShowEditForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Redux selectors
  const events = useSelector((state) => state.event.events.data);
  const communities = useSelector((state) => state.community.communities.data);
  const metrics = useSelector((state) => state.impact.metrics);
  const eventsLoading = useSelector((state) => state.event.isLoading);
  const communitiesLoading = useSelector((state) => state.community.isLoading);

  // Fetch data on mount
  useEffect(() => {
    if (user?._id) {
      dispatch(fetchUserMetrics(user._id));
      dispatch(fetchEvents({ limit: 4 }));
      dispatch(fetchCommunities({ limit: 4 }));
    }
  }, [user?._id, dispatch]);

  // Handle profile update success
  const handleProfileUpdateSuccess = () => {
    setShowEditForm(false);
    setRefreshKey((prev) => prev + 1);
  };

  if (!user) {
    return (
      <Layout>
        <div className={styles.container}>
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className={styles.container}>
        {/* Edit Profile Modal */}
        <Modal
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          title="Edit Profile"
          size="md"
        >
          <ProfileForm
            user={user}
            onClose={() => setShowEditForm(false)}
            onSuccess={handleProfileUpdateSuccess}
          />
        </Modal>

        {/* Main Content Grid */}
        <div className={styles.gridContainer}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            {/* Profile Card */}
            <div className={styles.section}>
              <ProfileCard
                key={refreshKey}
                user={user}
                isOwnProfile={true}
                onEdit={() => setShowEditForm(true)}
              />
            </div>

            {/* User Stats */}
            <div className={styles.section}>
              <UserStats userId={user._id} />
            </div>

            {/* Quick Actions */}
            <div className={styles.section}>
              <Card padding="lg" shadow="md">
                <h3 className={styles.sectionTitle}>Quick Actions</h3>
                <div className={styles.quickActionsGrid}>
                  <QuickActionButton
                    icon={FiCalendar}
                    label="Find Events"
                    description="Browse volunteer opportunities"
                    onClick={() => navigate("/events")}
                  />
                  <QuickActionButton
                    icon={FiUsers}
                    label="Join Community"
                    description="Connect with others"
                    onClick={() => navigate("/communities")}
                  />
                  <QuickActionButton
                    icon={FiTrendingUp}
                    label="View Impact"
                    description="See your progress"
                    onClick={() => navigate("/impact")}
                  />
                  <QuickActionButton
                    icon={FiBook}
                    label="Learn"
                    description="Browse resources"
                    onClick={() => navigate("/resources")}
                  />

                  {user?.role === "moderator" && (
                    <QuickActionButton
                      icon={FiCalendar}
                      label="My Events"
                      description="Manage created events"
                      onClick={() => navigate("/my-events")}
                    />
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>
            {/* Impact Summary Card */}
            <div className={styles.section}>
              <Card padding="lg" shadow="md">
                <h3 className={styles.sectionTitle}>Your Impact</h3>
                {metrics ? (
                  <>
                    <div className={styles.impactGrid}>
                      <ImpactItem
                        icon="🌱"
                        label="Events Attended"
                        value={metrics.eventsAttended || 0}
                      />
                      <ImpactItem
                        icon="👥"
                        label="Communities"
                        value={metrics.communitiesJoined || 0}
                      />
                      <ImpactItem
                        icon="⭐"
                        label="Total Points"
                        value={metrics.totalPoints || 0}
                      />
                      <ImpactItem
                        icon="⏱️"
                        label="Hours Volunteered"
                        value={metrics.hoursVolunteered || 0}
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => navigate("/impact")}
                      icon={FiArrowRight}
                      iconPosition="right"
                      style={{ marginTop: "16px" }}
                    >
                      View Detailed Dashboard
                    </Button>
                  </>
                ) : (
                  <p className={styles.noData}>
                    Start participating to see your impact!
                  </p>
                )}
              </Card>
            </div>

            {/* Recent Activity */}
            <div className={styles.section}>
              <UserActivity userId={user._id} limit={5} />
            </div>

            {/* Leaderboard Hint */}
            <div className={styles.section}>
              <Card padding="lg" shadow="md" className={styles.hintCard}>
                <div className={styles.hintContent}>
                  <div className={styles.hintIcon}>🏆</div>
                  <h4 className={styles.hintTitle}>Climb the Leaderboard</h4>
                  <p className={styles.hintText}>
                    Complete more events and challenges to earn points and climb
                    ranks!
                  </p>
                  <Button
                    size="sm"
                    variant="primary"
                    fullWidth
                    onClick={() => navigate("/leaderboard")}
                  >
                    View Leaderboard
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Upcoming Events Section */}
        {events && events.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Upcoming Events</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/events")}
                icon={FiArrowRight}
                iconPosition="right"
              >
                View All
              </Button>
            </div>
            <div className={styles.eventsGrid}>
              {events.slice(0, 4).map((event) => (
                <EventQuickCard
                  key={event._id}
                  event={event}
                  onClick={() => navigate(`/events/${event._id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

// Quick Action Button Component
const QuickActionButton = ({ icon: Icon, label, description, onClick }) => (
  <div className="quick-action-button" onClick={onClick}>
    <Icon size={24} style={{ color: "#00796B" }} />
    <h4 className="quick-action-label">{label}</h4>
    <p className="quick-action-description">{description}</p>
  </div>
);

// Impact Item Component
const ImpactItem = ({ icon, label, value }) => (
  <div className="impact-item">
    <div className="impact-icon">{icon}</div>
    <span className="impact-value">{value}</span>
    <span className="impact-label">{label}</span>
  </div>
);

// Event Quick Card Component
const EventQuickCard = ({ event, onClick }) => (
  <Card onClick={onClick} hover shadow="sm" padding="md" className="event-card">
    <div className="event-card-image">
      <img
        src={event.image || "https://via.placeholder.com/200x120?text=Event"}
        alt={event.title}
        className="event-image"
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/200x120?text=Event";
        }}
      />
    </div>
    <h4 className="event-card-title">{event.title.substring(0, 40)}</h4>
    <p className="event-card-meta">
      {new Date(event.startDate).toLocaleDateString()}
    </p>
  </Card>
);

export default Dashboard;
