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
import { formatDate, truncate } from "../config/helpers";
import { calculateRank } from "../config/helpers";
import { formatPoints } from "../config/formatters";
import styles from "./styles/Home.module.css";

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

  // Fetch initial data on mount
  useEffect(() => {
    dispatch(fetchEvents({ limit: 6, status: "Upcoming" }));
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
      <div className={styles.container}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Make a Real Impact,
              <br />
              <span className={styles.accentText}>One Action at a Time</span>
            </h1>

            <p className={styles.heroSubtitle}>
              Join thousands of volunteers making positive change through
              organized events and engaged communities. Start your impact
              journey today.
            </p>

            <div className={styles.heroButtons}>
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
            <div className={styles.trustIndicators}>
              <div className={styles.trustItem}>
                <span className={styles.trustNumber}>5000+</span>
                <span className={styles.trustLabel}>Active Volunteers</span>
              </div>
              <span className={styles.trustDivider}>•</span>
              <div className={styles.trustItem}>
                <span className={styles.trustNumber}>500+</span>
                <span className={styles.trustLabel}>Communities</span>
              </div>
              <span className={styles.trustDivider}>•</span>
              <div className={styles.trustItem}>
                <span className={styles.trustNumber}>2000+</span>
                <span className={styles.trustLabel}>Events</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className={styles.heroVisual}>
            <div className={styles.heroImagePlaceholder}>
              <div className={styles.heroIcon}>🌍</div>
              <p className={styles.heroIconText}>Making Global Impact</p>
            </div>
          </div>
        </section>

        {/* Stats Section (if authenticated) */}
        {isAuthenticated && (
          <section className={styles.statsSection}>
            <h2 className={styles.sectionTitle}>Your Impact So Far</h2>
            {userMetrics ? (
              <>
                <div className={styles.statsGrid}>
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
        <section className={styles.featuredSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Featured Events</h2>
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
            <div className={styles.loadingContainer}>
              <Loader size="sm" />
            </div>
          ) : events && events.length > 0 ? (
            <div className={styles.cardsGrid}>
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
        <section className={styles.featuredSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Active Communities</h2>
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
            <div className={styles.loadingContainer}>
              <Loader size="sm" />
            </div>
          ) : communities && communities.length > 0 ? (
            <div className={styles.cardsGrid}>
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
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to Make a Difference?</h2>
            <p className={styles.ctaSubtitle}>
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
              <div className={styles.ctaButtonGroup}>
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
        <section className={styles.featuresSection}>
          <h2 className={styles.sectionTitle}>Why ImpactHub?</h2>
          <div className={styles.featuresGrid}>
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
          <section className={styles.footerCTA}>
            <h3 className={styles.footerCTATitle}>
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

// Event Card Preview Component
const EventCardPreview = ({ event, onClick }) => (
  <Card
    onClick={onClick}
    hover
    shadow="md"
    padding="md"
    className={styles.eventCard}
  >
    <div className={styles.eventImage}>
      <img
        src={event.image || "https://via.placeholder.com/300x200?text=Event"}
        alt={event.title}
        className={styles.eventImageTag}
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/300x200?text=Event";
        }}
      />
      <Badge
        label={event.category || "Event"}
        variant="primary"
        size="sm"
        className={styles.badgeOverlay}
      />
    </div>

    <div className={styles.eventInfo}>
      <h3 className={styles.eventTitle}>{truncate(event.title, 40)}</h3>

      <div className={styles.eventMeta}>
        <div className={styles.metaItem}>
          <FiCalendar size={14} style={{ color: "#00796B" }} />
          <span>{formatDate(event.startDate)}</span>
        </div>
        <div className={styles.metaItem}>
          <FiUsers size={14} style={{ color: "#00796B" }} />
          <span>{event.participants?.length || 0} joined</span>
        </div>
      </div>

      <p className={styles.eventDescription}>
        {truncate(event.description, 60)}
      </p>

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

// Community Card Preview Component
const CommunityCardPreview = ({ community, onClick }) => (
  <Card
    onClick={onClick}
    hover
    shadow="md"
    padding="md"
    className={styles.communityCard}
  >
    <div className={styles.communityImage}>
      <img
        src={
          community.image ||
          "https://via.placeholder.com/300x200?text=Community"
        }
        alt={community.name}
        className={styles.communityImageTag}
        onError={(e) => {
          e.target.src = "https://via.placeholder.com/300x200?text=Community";
        }}
      />
      <Badge
        label={community.category || "Community"}
        variant="primary"
        size="sm"
        className={styles.badgeOverlay}
      />
    </div>

    <div className={styles.communityInfo}>
      <div className={styles.communityHeader}>
        <h3 className={styles.communityTitle}>
          {truncate(community.name, 30)}
        </h3>
        {community.verificationStatus === "verified" && (
          <FiCheckCircle size={18} style={{ color: "#10b981" }} />
        )}
      </div>

      <div className={styles.communityMeta}>
        <div className={styles.metaItem}>
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

      <p className={styles.communityDescription}>
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

// Stats Card Component
const StatsCard = ({ icon: Icon, label, value }) => (
  <Card shadow="sm" padding="md" className={styles.statsCard}>
    <div className={styles.statsCardContent}>
      <Icon className={styles.statsIcon} size={28} />
      <div className={styles.statsCardText}>
        <p className={styles.statsValue}>{value}</p>
        <p className={styles.statsLabel}>{label}</p>
      </div>
    </div>
  </Card>
);

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => (
  <div className={styles.featureCard}>
    <div className={styles.featureIcon}>{icon}</div>
    <h3 className={styles.featureTitle}>{title}</h3>
    <p className={styles.featureDescription}>{description}</p>
  </div>
);

// Empty State Component
const EmptyState = ({
  title,
  description,
  isAuthenticated,
  actionLabel,
  onAction,
}) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>📭</div>
    <p className={styles.emptyStateTitle}>{title}</p>
    <p className={styles.emptyStateText}>{description}</p>
    {isAuthenticated && (
      <Button size="sm" variant="primary" onClick={onAction}>
        {actionLabel}
      </Button>
    )}
  </div>
);

export default Home;
