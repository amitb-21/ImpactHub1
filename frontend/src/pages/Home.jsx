import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchEvents } from "../store/slices/eventSlice";
import { fetchCommunities } from "../store/slices/communitySlice";
import { fetchUserMetrics } from "../store/slices/impactSlice";
import { useAuth } from "../hooks/useAuth";
import Layout from "../components/common/Layout";
import { Button } from "../components/common/Button";
import { Card } from "../components/common/Card";
import { Badge } from "../components/common/Badge";
import { Loader } from "../components/common/Loader";
import {
  FiArrowRight,
  FiUsers,
  FiCalendar,
  FiTrendingUp,
  FiStar,
  FiCheckCircle,
} from "react-icons/fi";
import { formatDate, truncate, timeAgo } from "../config/helpers";
import { calculateRank, calculateTier } from "../config/helpers";
import { formatPoints } from "../config/formatters";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Redux selectors
  const events = useSelector((state) => state.event.events.data);
  const communities = useSelector((state) => state.community.communities.data);
  const userMetrics = useSelector((state) => state.impact.metrics);
  const eventsLoading = useSelector((state) => state.event.isLoading);
  const communitiesLoading = useSelector((state) => state.community.isLoading);
  const metricsLoading = useSelector((state) => state.impact.isLoading);

  // Fetch initial data on mount
  useEffect(() => {
    // Fetch featured events (limit 6, sorted by newest)
    dispatch(fetchEvents({ limit: 6, status: "Upcoming" }));
    // Fetch featured communities (limit 6, sorted by newest)
    dispatch(fetchCommunities({ limit: 6 }));
  }, [dispatch]);

  // Fetch user impact metrics if authenticated
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      dispatch(fetchUserMetrics(user._id));
    }
  }, [isAuthenticated, user?._id, dispatch]);

  return (
    <Layout>
      <div style={styles.container}>
        {/* Hero Section */}
        <section style={styles.heroSection}>
          <div style={styles.heroContent}>
            <h1 style={styles.heroTitle}>
              Make a Real Impact,
              <br />
              <span style={styles.accentText}>One Action at a Time</span>
            </h1>

            <p style={styles.heroSubtitle}>
              Join thousands of volunteers making positive change through
              organized events and engaged communities. Start your impact
              journey today.
            </p>

            <div style={styles.heroButtons}>
              {!isAuthenticated ? (
                <>
                  <Button
                    size="lg"
                    variant="primary"
                    onClick={() => navigate("/register")}
                    icon={FiArrowRight}
                    iconPosition="right"
                  >
                    Get Started Free
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/login")}
                  >
                    Sign In
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    variant="primary"
                    onClick={() => navigate("/events")}
                    icon={FiArrowRight}
                    iconPosition="right"
                  >
                    Explore Events
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => navigate("/communities")}
                  >
                    Join Communities
                  </Button>
                </>
              )}
            </div>

            {/* Trust indicators */}
            <div style={styles.trustIndicators}>
              <div style={styles.trustItem}>
                <span style={styles.trustNumber}>5000+</span>
                <span style={styles.trustLabel}>Active Volunteers</span>
              </div>
              <span style={styles.trustDivider}>•</span>
              <div style={styles.trustItem}>
                <span style={styles.trustNumber}>500+</span>
                <span style={styles.trustLabel}>Communities</span>
              </div>
              <span style={styles.trustDivider}>•</span>
              <div style={styles.trustItem}>
                <span style={styles.trustNumber}>2000+</span>
                <span style={styles.trustLabel}>Events</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div style={styles.heroVisual}>
            <div style={styles.heroImagePlaceholder}>
              <div style={styles.heroIcon}>🌍</div>
              <p style={styles.heroIconText}>Making Global Impact</p>
            </div>
          </div>
        </section>

        {/* Stats Section (if authenticated) */}
        {isAuthenticated && (
          <section style={styles.statsSection}>
            <h2 style={styles.sectionTitle}>Your Impact So Far</h2>
            {metricsLoading ? (
              <Loader size="md" text="Loading your metrics..." />
            ) : userMetrics ? (
              <>
                <div style={styles.statsGrid}>
                  <StatsCard
                    icon={FiCalendar}
                    label="Events Attended"
                    value={userMetrics.eventsAttended || 0}
                  />
                  <StatsCard
                    icon={FiUsers}
                    label="Communities Joined"
                    value={userMetrics.communitiesJoined || 0}
                  />
                  <StatsCard
                    icon={FiTrendingUp}
                    label="Total Points"
                    value={formatPoints(userMetrics.totalPoints || 0)}
                  />
                  <StatsCard
                    icon={FiStar}
                    label="Current Level"
                    value={
                      calculateRank(userMetrics.totalPoints || 0)?.name ||
                      "Beginner"
                    }
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => navigate("/impact")}
                  icon={FiArrowRight}
                  iconPosition="right"
                  style={{ marginTop: "20px" }}
                >
                  View Full Impact Dashboard
                </Button>
              </>
            ) : null}
          </section>
        )}

        {/* Featured Events Section */}
        <section style={styles.featuredSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Featured Events</h2>
            <Button
              variant="ghost"
              onClick={() => navigate("/events")}
              icon={FiArrowRight}
              iconPosition="right"
              style={{ gap: "6px" }}
            >
              View All
            </Button>
          </div>

          {eventsLoading ? (
            <div style={styles.loadingContainer}>
              <Loader size="sm" />
            </div>
          ) : events && events.length > 0 ? (
            <div style={styles.cardsGrid}>
              {events.slice(0, 6).map((event) => (
                <EventCardPreview
                  key={event._id}
                  event={event}
                  onClick={() => navigate(`/events/${event._id}`)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No events available yet"
              description="Check back soon for new volunteer opportunities!"
              isAuthenticated={isAuthenticated}
              actionLabel="Browse All Events"
              onAction={() => navigate("/events")}
            />
          )}
        </section>

        {/* Featured Communities Section */}
        <section style={styles.featuredSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Active Communities</h2>
            <Button
              variant="ghost"
              onClick={() => navigate("/communities")}
              icon={FiArrowRight}
              iconPosition="right"
              style={{ gap: "6px" }}
            >
              View All
            </Button>
          </div>

          {communitiesLoading ? (
            <div style={styles.loadingContainer}>
              <Loader size="sm" />
            </div>
          ) : communities && communities.length > 0 ? (
            <div style={styles.cardsGrid}>
              {communities.slice(0, 6).map((community) => (
                <CommunityCardPreview
                  key={community._id}
                  community={community}
                  onClick={() => navigate(`/communities/${community._id}`)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No communities available yet"
              description="Be the first to create a community and lead the change!"
              isAuthenticated={isAuthenticated}
              actionLabel="Explore Communities"
              onAction={() => navigate("/communities")}
            />
          )}
        </section>

        {/* CTA Section */}
        <section style={styles.ctaSection}>
          <div style={styles.ctaContent}>
            <h2 style={styles.ctaTitle}>Ready to Make a Difference?</h2>
            <p style={styles.ctaSubtitle}>
              Join our community of volunteers and start creating positive
              impact today. Every action counts.
            </p>
            {!isAuthenticated ? (
              <Button
                size="lg"
                variant="primary"
                onClick={() => navigate("/register")}
              >
                Join ImpactHub Now
              </Button>
            ) : (
              <div style={styles.ctaButtonGroup}>
                <Button
                  size="lg"
                  variant="primary"
                  onClick={() => navigate("/events")}
                >
                  Find Events
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate("/communities")}
                >
                  Discover Communities
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section style={styles.featuresSection}>
          <h2 style={styles.sectionTitle}>Why ImpactHub?</h2>
          <div style={styles.featuresGrid}>
            <FeatureCard
              icon="🎯"
              title="Find Your Cause"
              description="Browse hundreds of events and communities aligned with your values and interests."
            />
            <FeatureCard
              icon="👥"
              title="Connect & Collaborate"
              description="Work with like-minded volunteers and make meaningful connections in your community."
            />
            <FeatureCard
              icon="⭐"
              title="Earn Recognition"
              description="Earn points, badges, and climb the leaderboard as you contribute to positive change."
            />
            <FeatureCard
              icon="📈"
              title="Track Your Impact"
              description="See the real-world difference you're making through detailed impact metrics."
            />
            <FeatureCard
              icon="🌍"
              title="Global Community"
              description="Be part of a worldwide movement to create sustainable social and environmental change."
            />
            <FeatureCard
              icon="🚀"
              title="Grow Together"
              description="Learn from resources, mentors, and fellow volunteers in our supportive ecosystem."
            />
          </div>
        </section>

        {/* Footer CTA */}
        {!isAuthenticated && (
          <section style={styles.footerCTA}>
            <h3 style={styles.footerCTATitle}>
              Don't miss out on making a difference
            </h3>
            <Button
              size="lg"
              variant="primary"
              onClick={() => navigate("/register")}
            >
              Sign Up Free
            </Button>
          </section>
        )}
      </div>
    </Layout>
  );
};

// =====================
// SUB-COMPONENTS
// =====================

const EventCardPreview = ({ event, onClick }) => (
  <Card
    onClick={onClick}
    hover
    shadow="md"
    padding="md"
    style={styles.eventCard}
  >
    {/* Event Image */}
    <div style={styles.eventImage}>
      <img
        src={event.image || "https://via.placeholder.com/300x200?text=Event"}
        alt={event.title}
        style={styles.eventImageTag}
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/300x200?text=Event";
        }}
      />
      <Badge
        label={event.category || "Event"}
        variant="primary"
        size="sm"
        style={styles.badgeOverlay}
      />
    </div>

    {/* Event Info */}
    <div style={styles.eventInfo}>
      <h3 style={styles.eventTitle}>{truncate(event.title, 40)}</h3>

      <div style={styles.eventMeta}>
        <div style={styles.metaItem}>
          <FiCalendar size={14} style={{ color: "#00796B" }} />
          <span>{formatDate(event.startDate)}</span>
        </div>
        <div style={styles.metaItem}>
          <FiUsers size={14} style={{ color: "#00796B" }} />
          <span>{event.participants?.length || 0} joined</span>
        </div>
      </div>

      <p style={styles.eventDescription}>{truncate(event.description, 60)}</p>

      <Button
        size="sm"
        variant="primary"
        fullWidth
        style={{ marginTop: "12px" }}
      >
        Learn More
      </Button>
    </div>
  </Card>
);

const CommunityCardPreview = ({ community, onClick }) => (
  <Card
    onClick={onClick}
    hover
    shadow="md"
    padding="md"
    style={styles.communityCard}
  >
    {/* Community Image */}
    <div style={styles.communityImage}>
      <img
        src={
          community.image ||
          "https://via.placeholder.com/300x200?text=Community"
        }
        alt={community.name}
        style={styles.communityImageTag}
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/300x200?text=Community";
        }}
      />
      <Badge
        label={community.category || "Community"}
        variant="primary"
        size="sm"
        style={styles.badgeOverlay}
      />
    </div>

    {/* Community Info */}
    <div style={styles.communityInfo}>
      <div style={styles.communityHeader}>
        <h3 style={styles.communityTitle}>{truncate(community.name, 30)}</h3>
        {community.verificationStatus === "verified" && (
          <FiCheckCircle size={18} style={{ color: "#10b981" }} />
        )}
      </div>

      <div style={styles.communityMeta}>
        <div style={styles.metaItem}>
          <FiUsers size={14} style={{ color: "#00796B" }} />
          <span>{community.members?.length || 0} members</span>
        </div>
      </div>

      {community.verificationStatus === "verified" && (
        <Badge
          label="Verified"
          variant="success"
          size="sm"
          style={{ marginBottom: "8px" }}
        />
      )}

      <p style={styles.communityDescription}>
        {truncate(community.description, 60)}
      </p>

      <Button
        size="sm"
        variant="primary"
        fullWidth
        style={{ marginTop: "12px" }}
      >
        Join Now
      </Button>
    </div>
  </Card>
);

const StatsCard = ({ icon: Icon, label, value }) => (
  <Card shadow="sm" padding="md" style={styles.statsCard}>
    <div style={styles.statsCardContent}>
      <Icon style={styles.statsIcon} size={28} />
      <div style={styles.statsCardText}>
        <p style={styles.statsValue}>{value}</p>
        <p style={styles.statsLabel}>{label}</p>
      </div>
    </div>
  </Card>
);

const FeatureCard = ({ icon, title, description }) => (
  <div style={styles.featureCard}>
    <div style={styles.featureIcon}>{icon}</div>
    <h3 style={styles.featureTitle}>{title}</h3>
    <p style={styles.featureDescription}>{description}</p>
  </div>
);

const EmptyState = ({
  title,
  description,
  isAuthenticated,
  actionLabel,
  onAction,
}) => (
  <div style={styles.emptyState}>
    <div style={styles.emptyIcon}>📭</div>
    <p style={styles.emptyStateTitle}>{title}</p>
    <p style={styles.emptyStateText}>{description}</p>
    {isAuthenticated && (
      <Button size="sm" variant="primary" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);

// =====================
// STYLES
// =====================

const styles = {
  container: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0",
  },

  // Hero Section
  heroSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "60px",
    alignItems: "center",
    padding: "80px 40px",
    background: "linear-gradient(135deg, #00796B 0%, #004D40 100%)",
    borderRadius: "16px",
    marginBottom: "80px",
    color: "#FAFAFA",
  },

  heroContent: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },

  heroTitle: {
    fontSize: "48px",
    fontWeight: "800",
    lineHeight: "1.2",
    margin: 0,
    color: "#FAFAFA",
    letterSpacing: "-0.5px",
  },

  accentText: {
    color: "#FFB300",
    display: "block",
  },

  heroSubtitle: {
    fontSize: "18px",
    lineHeight: "1.6",
    color: "rgba(250, 250, 250, 0.9)",
    margin: 0,
    maxWidth: "500px",
  },

  heroButtons: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    marginTop: "16px",
  },

  trustIndicators: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    marginTop: "24px",
    paddingTop: "24px",
    borderTop: "1px solid rgba(250, 250, 250, 0.2)",
  },

  trustItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },

  trustNumber: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#FFB300",
  },

  trustLabel: {
    fontSize: "13px",
    color: "rgba(250, 250, 250, 0.8)",
  },

  trustDivider: {
    color: "rgba(250, 250, 250, 0.3)",
  },

  heroVisual: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  heroImagePlaceholder: {
    width: "100%",
    aspectRatio: "1",
    backgroundColor: "rgba(255, 179, 0, 0.1)",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: "2px dashed rgba(255, 179, 0, 0.3)",
  },

  heroIcon: {
    fontSize: "80px",
    marginBottom: "16px",
  },

  heroIconText: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#FFB300",
    margin: 0,
  },

  // Stats Section
  statsSection: {
    padding: "60px 40px",
    backgroundColor: "#f0f8f7",
    borderRadius: "12px",
    marginBottom: "80px",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },

  statsCard: {
    padding: "24px !important",
  },

  statsCardContent: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  statsIcon: {
    color: "#00796B",
    flexShrink: 0,
  },

  statsCardText: {
    display: "flex",
    flexDirection: "column",
  },

  statsValue: {
    fontSize: "24px",
    fontWeight: "700",
    color: "#212121",
    margin: 0,
  },

  statsLabel: {
    fontSize: "13px",
    color: "#666",
    margin: 0,
  },

  // Featured Section
  featuredSection: {
    marginBottom: "80px",
  },

  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "32px",
  },

  sectionTitle: {
    fontSize: "32px",
    fontWeight: "700",
    color: "#212121",
    margin: 0,
  },

  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
  },

  eventCard: {
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    overflow: "hidden",
  },

  eventImage: {
    position: "relative",
    marginBottom: "16px",
    borderRadius: "8px",
    overflow: "hidden",
    height: "180px",
  },

  eventImageTag: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  badgeOverlay: {
    position: "absolute",
    top: "12px",
    right: "12px",
  },

  eventInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  eventTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#212121",
    margin: 0,
    lineHeight: "1.3",
  },

  eventMeta: {
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

  eventDescription: {
    fontSize: "13px",
    color: "#666",
    margin: 0,
    lineHeight: "1.4",
  },

  communityCard: {
    cursor: "pointer",
  },

  communityImage: {
    position: "relative",
    marginBottom: "16px",
    borderRadius: "8px",
    overflow: "hidden",
    height: "180px",
  },

  communityImageTag: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  communityInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  communityHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
  },

  communityTitle: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#212121",
    margin: 0,
  },

  communityMeta: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  communityDescription: {
    fontSize: "13px",
    color: "#666",
    margin: 0,
  },

  loadingContainer: {
    padding: "40px 20px",
    textAlign: "center",
  },

  emptyState: {
    padding: "60px 40px",
    textAlign: "center",
    backgroundColor: "#f5f5f5",
    borderRadius: "12px",
  },

  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
  },

  emptyStateTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#212121",
    margin: "0 0 8px 0",
  },

  emptyStateText: {
    fontSize: "14px",
    color: "#666",
    margin: "0 0 20px 0",
  },

  // CTA Section
  ctaSection: {
    background: "linear-gradient(135deg, #00796B 0%, #004D40 100%)",
    borderRadius: "12px",
    padding: "60px 40px",
    textAlign: "center",
    marginBottom: "80px",
    color: "#FAFAFA",
  },

  ctaContent: {
    maxWidth: "600px",
    margin: "0 auto",
  },

  ctaTitle: {
    fontSize: "36px",
    fontWeight: "700",
    color: "#FAFAFA",
    margin: "0 0 16px 0",
  },

  ctaSubtitle: {
    fontSize: "16px",
    color: "rgba(250, 250, 250, 0.9)",
    margin: "0 0 24px 0",
    lineHeight: "1.6",
  },

  ctaButtonGroup: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  // Features Section
  featuresSection: {
    marginBottom: "80px",
  },

  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "32px",
    marginTop: "40px",
  },

  featureCard: {
    padding: "32px",
    backgroundColor: "#f9f9f9",
    borderRadius: "12px",
    textAlign: "center",
    border: "1px solid #e0e0e0",
    transition: "all 0.3s ease",
  },

  featureIcon: {
    fontSize: "48px",
    marginBottom: "16px",
    display: "block",
  },

  featureTitle: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#212121",
    margin: "0 0 12px 0",
  },

  featureDescription: {
    fontSize: "14px",
    color: "#666",
    lineHeight: "1.6",
    margin: 0,
  },

  // Footer CTA
  footerCTA: {
    padding: "60px 40px",
    textAlign: "center",
    backgroundColor: "#00796B",
    borderRadius: "12px",
    marginBottom: "40px",
  },

  footerCTATitle: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#FAFAFA",
    margin: "0 0 20px 0",
  },

  "@media (max-width: 768px)": {
    heroSection: {
      gridTemplateColumns: "1fr",
      gap: "40px",
      padding: "40px 20px",
      marginBottom: "60px",
    },
    heroTitle: {
      fontSize: "36px",
    },
    heroSubtitle: {
      fontSize: "16px",
    },
    sectionTitle: {
      fontSize: "24px",
    },
    cardsGrid: {
      gridTemplateColumns: "1fr",
    },
    ctaSection: {
      padding: "40px 20px",
      marginBottom: "60px",
    },
    ctaTitle: {
      fontSize: "28px",
    },
    featuresGrid: {
      gridTemplateColumns: "1fr",
      gap: "20px",
    },
  },
};

export default Home;
