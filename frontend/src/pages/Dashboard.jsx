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
        <div style={styles.container}>
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Welcome back, {user.name}! 👋</h1>
            <p style={styles.subtitle}>Track your impact and stay connected</p>
          </div>
          <Button
            size="md"
            variant="primary"
            icon={FiEdit}
            onClick={() => setShowEditForm(true)}
          >
            Edit Profile
          </Button>
        </div>

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
        <div style={styles.gridContainer}>
          {/* Left Column */}
          <div style={styles.leftColumn}>
            {/* Profile Card */}
            <div style={styles.section}>
              <ProfileCard key={refreshKey} user={user} isOwnProfile={true} />
            </div>

            {/* User Stats */}
            <div style={styles.section}>
              <UserStats userId={user._id} />
            </div>

            {/* Quick Actions */}
            <div style={styles.section}>
              <Card padding="lg" shadow="md">
                <h3 style={styles.sectionTitle}>Quick Actions</h3>
                <div style={styles.quickActionsGrid}>
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
                </div>
              </Card>
            </div>
          </div>

          {/* Right Column */}
          <div style={styles.rightColumn}>
            {/* Impact Summary Card */}
            <div style={styles.section}>
              <Card padding="lg" shadow="md">
                <h3 style={styles.sectionTitle}>Your Impact</h3>
                {metrics ? (
                  <>
                    <div style={styles.impactGrid}>
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
                  <p style={styles.noData}>
                    Start participating to see your impact!
                  </p>
                )}
              </Card>
            </div>

            {/* Recent Activity */}
            <div style={styles.section}>
              <UserActivity userId={user._id} limit={5} />
            </div>

            {/* Leaderboard Hint */}
            <div style={styles.section}>
              <Card padding="lg" shadow="md" style={styles.hintCard}>
                <div style={styles.hintContent}>
                  <div style={styles.hintIcon}>🏆</div>
                  <h4 style={styles.hintTitle}>Climb the Leaderboard</h4>
                  <p style={styles.hintText}>
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
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>Upcoming Events</h3>
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
            <div style={styles.eventsGrid}>
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
  <div style={styles.quickActionButton} onClick={onClick}>
    <Icon size={24} style={{ color: "#00796B" }} />
    <h4 style={styles.quickActionLabel}>{label}</h4>
    <p style={styles.quickActionDescription}>{description}</p>
  </div>
);

// Impact Item Component
const ImpactItem = ({ icon, label, value }) => (
  <div style={styles.impactItem}>
    <div style={styles.impactIcon}>{icon}</div>
    <span style={styles.impactValue}>{value}</span>
    <span style={styles.impactLabel}>{label}</span>
  </div>
);

// Event Quick Card Component
const EventQuickCard = ({ event, onClick }) => (
  <Card
    onClick={onClick}
    hover
    shadow="sm"
    padding="md"
    style={styles.eventCard}
  >
    <div style={styles.eventCardImage}>
      <img
        src={event.image || "https://via.placeholder.com/200x120?text=Event"}
        alt={event.title}
        style={styles.eventImage}
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/200x120?text=Event";
        }}
      />
    </div>
    <h4 style={styles.eventCardTitle}>{event.title.substring(0, 40)}</h4>
    <p style={styles.eventCardMeta}>
      {new Date(event.startDate).toLocaleDateString()}
    </p>
  </Card>
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
    marginBottom: "40px",
    paddingBottom: "24px",
    borderBottom: "2px solid #e0e0e0",
  },
  title: {
    fontSize: "32px",
    fontWeight: "800",
    color: "#212121",
    margin: "0 0 8px 0",
  },
  subtitle: {
    fontSize: "15px",
    color: "#666",
    margin: 0,
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "32px",
    marginBottom: "60px",
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
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  quickActionsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  quickActionButton: {
    padding: "16px",
    backgroundColor: "#f9f9f9",
    borderRadius: "10px",
    border: "1px solid #e0e0e0",
    cursor: "pointer",
    transition: "all 0.3s ease",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    textAlign: "center",
  },
  quickActionLabel: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#212121",
    margin: 0,
  },
  quickActionDescription: {
    fontSize: "11px",
    color: "#999",
    margin: 0,
  },
  impactGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
  },
  impactItem: {
    padding: "16px",
    backgroundColor: "#f0f8f7",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
    textAlign: "center",
  },
  impactIcon: {
    fontSize: "28px",
  },
  impactValue: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#00796B",
  },
  impactLabel: {
    fontSize: "12px",
    color: "#666",
    fontWeight: "500",
  },
  noData: {
    fontSize: "14px",
    color: "#999",
    textAlign: "center",
    padding: "20px",
    margin: 0,
  },
  hintCard: {
    background: "linear-gradient(135deg, #fff3cd 0%, #fef9e7 100%)",
    borderLeft: "4px solid #FFB300",
  },
  hintContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "12px",
  },
  hintIcon: {
    fontSize: "40px",
  },
  hintTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#212121",
    margin: 0,
  },
  hintText: {
    fontSize: "13px",
    color: "#666",
    margin: 0,
    lineHeight: "1.5",
  },
  eventsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "16px",
  },
  eventCard: {
    cursor: "pointer",
    overflow: "hidden",
  },
  eventCardImage: {
    width: "100%",
    height: "120px",
    marginBottom: "12px",
    borderRadius: "8px",
    overflow: "hidden",
  },
  eventImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  eventCardTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#212121",
    margin: "0 0 6px 0",
  },
  eventCardMeta: {
    fontSize: "12px",
    color: "#999",
    margin: 0,
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
    title: {
      fontSize: "24px",
    },
    quickActionsGrid: {
      gridTemplateColumns: "1fr 1fr",
    },
    impactGrid: {
      gridTemplateColumns: "1fr 1fr",
    },
    eventsGrid: {
      gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    },
  },
};

export default Dashboard;
