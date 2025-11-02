/* frontend/src/pages/CommunityDetail.jsx */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";
import {
  fetchCommunityById,
  joinCommunity,
  leaveCommunity,
} from "../store/slices/communitySlice";
import { fetchCommunityActivities } from "../store/slices/activitySlice";
// --- (1) IMPORTS ADDED ---
import { fetchEntityRatings } from "../store/slices/ratingSlice";
import RatingStats from "../components/rating/RatingStats";
import RatingList from "../components/rating/RatingList";
import RatingForm from "../components/rating/RatingForm";
// --- (End 1) ---
import Layout from "../components/common/Layout";
import CommunityStats from "../components/community/CommunityStats";
import CommunityGallery from "../components/community/CommunityGallery";
import CommunityActivityFeed from "../components/community/CommunityActivityFeed";
import MembersList from "../components/community/MembersList";
import CommunityTierBadge from "../components/community/CommunityTierBadge";
import { Card } from "../components/common/Card";
import { Badge } from "../components/common/Badge";
import { Button } from "../components/common/Button";
import { Loader } from "../components/common/Loader";
import { Modal } from "../components/common/Modal";
import CommunityForm from "../components/community/CommunityForm";
import {
  FiArrowLeft,
  FiEdit,
  FiCheckCircle,
  FiMapPin,
  FiCalendar,
  FiShare2,
} from "react-icons/fi";
import styles from "./styles/CommunityDetail.module.css";

const CommunityDetail = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: currentUser, isAuthenticated } = useAuth(); // <-- Get isAuthenticated
  const { joinCommunity: joinCommunitySocket } = useSocket();

  // Redux selectors
  const { currentCommunity, isLoading, error } = useSelector(
    (state) => state.community
  );
  // --- (2) RATING STATE ---
  const { entityRatings, myRating } = useSelector((state) => state.rating);
  // --- (End 2) ---

  // Local state
  const [showEditForm, setShowEditForm] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  // Fetch community data on mount
  useEffect(() => {
    if (communityId) {
      dispatch(fetchCommunityById(communityId));
      dispatch(fetchCommunityActivities(communityId));
      // --- (3) FETCH RATINGS ---
      dispatch(
        fetchEntityRatings({ entityType: "Community", entityId: communityId })
      );
      // --- (End 3) ---
    }
  }, [communityId, dispatch]);

  // Check if current user is member or owner
  useEffect(() => {
    if (currentCommunity && currentUser) {
      const memberIds = currentCommunity.members?.map((m) => m._id) || [];
      setIsMember(memberIds.includes(currentUser._id));
      setIsOwner(currentCommunity.createdBy?._id === currentUser._id);
    }
  }, [currentCommunity, currentUser]);

  // Join Socket.io community room
  useEffect(() => {
    if (communityId && isMember) {
      joinCommunitySocket(communityId);
    }
  }, [communityId, isMember, joinCommunitySocket]);

  // Handle join community
  const handleJoinCommunity = async () => {
    setIsJoining(true);
    const result = await dispatch(joinCommunity(communityId));
    setIsJoining(false);
    if (result.payload) {
      setIsMember(true);
      joinCommunitySocket(communityId);
      // Refetch community data to get updated member list
      dispatch(fetchCommunityById(communityId));
    }
  };

  // Handle leave community
  const handleLeaveCommunity = async () => {
    if (window.confirm("Are you sure you want to leave this community?")) {
      const result = await dispatch(leaveCommunity(communityId));
      if (result.payload === communityId) {
        setIsMember(false);
        // Refetch community data to get updated member list
        dispatch(fetchCommunityById(communityId));
      }
    }
  };

  // Handle edit success
  const handleEditSuccess = () => {
    setShowEditForm(false);
    dispatch(fetchCommunityById(communityId));
  };

  if (error && !currentCommunity) {
    return (
      <Layout>
        <div className={styles.container}>
          <Button
            size="sm"
            variant="ghost"
            icon={FiArrowLeft}
            onClick={() => navigate("/communities")}
          >
            Back
          </Button>
          <Card padding="lg" shadow="md" className={styles.errorCard}>
            <div className={styles.errorContent}>
              <div className={styles.errorIcon}>❌</div>
              <h2 className={styles.errorTitle}>Community Not Found</h2>
              <p className={styles.errorText}>
                The community you're looking for doesn't exist or has been
                removed.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate("/communities")}
              >
                Back to Communities
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isLoading || !currentCommunity) {
    return (
      <Layout>
        <div className={styles.container}>
          <Loader size="lg" text="Loading community..." fullScreen={false} />
        </div>
      </Layout>
    );
  }

  const isVerified = currentCommunity.verificationStatus === "verified";

  // --- (4) RATING FORM VISIBILITY LOGIC ---
  // Backend `createRating` for Community checks if user is member OR has attended an event.
  // We can just check `isMember` on the frontend as a simple proxy.
  const showRatingForm = isAuthenticated && isMember && !myRating;
  const showUpdateForm = isAuthenticated && isMember && myRating;
  const showJoinMessage = isAuthenticated && !isMember;
  const showLoginMessage = !isAuthenticated;
  // --- (End 4) ---

  return (
    <Layout>
      <div className={styles.container}>
        {/* Back Button */}
        <Button
          size="sm"
          variant="ghost"
          icon={FiArrowLeft}
          onClick={() => navigate("/communities")}
          style={{ marginBottom: "20px" }}
        >
          Back to Communities
        </Button>

        {/* Community Hero Section */}
        <div className={styles.heroSection}>
          {/* Hero Image */}
          <div className={styles.heroImage}>
            {currentCommunity.image ? (
              <img
                src={currentCommunity.image}
                alt={currentCommunity.name}
                className={styles.heroImageTag}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/1200x300?text=Community";
                }}
              />
            ) : (
              <div className={styles.heroImagePlaceholder}>
                <span className={styles.placeholderIcon}>👥</span>
              </div>
            )}

            {/* Verification Badge */}
            {isVerified && (
              <div className={styles.verificationBadge}>
                <FiCheckCircle size={20} />
                <span>Verified Community</span>
              </div>
            )}
          </div>

          {/* Hero Content */}
          <div className={styles.heroContent}>
            <div className={styles.heroHeader}>
              <div>
                <h1 className={styles.title}>{currentCommunity.name}</h1>
                <p className={styles.subtitle}>
                  {currentCommunity.description}
                </p>
              </div>
              <div className={styles.actions}>
                {isOwner && (
                  <Button
                    size="sm"
                    variant="outline"
                    icon={FiEdit}
                    onClick={() => setShowEditForm(true)}
                  >
                    Edit
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  icon={FiShare2}
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Community link copied!");
                  }}
                >
                  Share
                </Button>
              </div>
            </div>

            {/* Meta Information */}
            <div className={styles.metaContainer}>
              {currentCommunity.category && (
                <Badge
                  label={currentCommunity.category}
                  variant="primary"
                  size="sm"
                />
              )}
              {currentCommunity.location?.city && (
                <div className={styles.metaItem}>
                  <FiMapPin size={14} style={{ color: "#00796B" }} />
                  <span>{currentCommunity.location.city}</span>
                </div>
              )}
              {currentCommunity.organizationDetails?.foundedYear && (
                <div className={styles.metaItem}>
                  <FiCalendar size={14} style={{ color: "#00796B" }} />
                  <span>
                    Est. {currentCommunity.organizationDetails.foundedYear}
                  </span>
                </div>
              )}
            </div>

            {/* Join Button */}
            <div className={styles.buttonGroup}>
              {!isMember ? (
                <Button
                  size="md"
                  variant="primary"
                  onClick={handleJoinCommunity}
                  loading={isJoining}
                  disabled={isJoining}
                  fullWidth
                >
                  {isJoining ? "Joining..." : "Join Community"}
                </Button>
              ) : (
                <Button
                  size="md"
                  variant="outline"
                  onClick={handleLeaveCommunity}
                  fullWidth
                >
                  Leave Community
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Edit Community Modal */}
        <Modal
          isOpen={showEditForm}
          onClose={() => setShowEditForm(false)}
          title="Edit Community"
          size="lg"
        >
          <CommunityForm
            community={currentCommunity}
            onClose={() => setShowEditForm(false)}
            onSuccess={handleEditSuccess}
          />
        </Modal>

        {/* Main Grid */}
        <div className={styles.gridContainer}>
          {/* Left Column */}
          <div className={styles.leftColumn}>
            {/* Community Stats */}
            <div className={styles.section}>
              <CommunityStats community={currentCommunity} />
            </div>

            {/* Tier Badge */}
            <div className={styles.section}>
              <CommunityTierBadge
                communityPoints={currentCommunity.communityPoints || 0}
                showProgress={true}
              />
            </div>

            {/* --- (5) RATING SECTION --- */}
            <div className={styles.section}>
              <h3 className={styles.cardTitle}>Ratings & Reviews</h3>
              <Card padding="lg" shadow="md">
                <RatingStats
                  avgRating={currentCommunity.avgRating}
                  totalRatings={currentCommunity.totalRatings}
                  distribution={entityRatings.distribution}
                />
              </Card>
            </div>

            <div className={styles.section}>
              {/* Show update form if user has already rated */}
              {showUpdateForm && (
                <RatingForm
                  entityType="Community"
                  entityId={communityId}
                  myRating={myRating}
                />
              )}

              {/* Show create form if user is member but hasn't rated */}
              {showRatingForm && (
                <RatingForm entityType="Community" entityId={communityId} />
              )}

              {/* Show message if not member */}
              {showJoinMessage && (
                <Card padding="lg" shadow="md">
                  <p className={styles.participantNote}>
                    {" "}
                    {/* Using shared style */}
                    You must join this community to leave a review.
                  </p>
                </Card>
              )}

              {/* Show login message if not authenticated */}
              {showLoginMessage && (
                <Card padding="lg" shadow="md">
                  <p className={styles.participantNote}>
                    {" "}
                    {/* Using shared style */}
                    Please{" "}
                    <a
                      href="/login"
                      style={{
                        fontWeight: "bold",
                        textDecoration: "underline",
                      }}
                    >
                      login
                    </a>{" "}
                    to rate this community.
                  </p>
                </Card>
              )}
            </div>

            <div className={styles.section}>
              <RatingList entityType="Community" entityId={communityId} />
            </div>
            {/* --- (End 5) --- */}

            {/* Community Gallery */}
            {isMember && (
              <div className={styles.section}>
                <CommunityGallery communityId={communityId} maxPhotos={6} />
              </div>
            )}

            {/* Activity Feed */}
            {isMember && (
              <div className={styles.section}>
                <CommunityActivityFeed
                  communityId={communityId}
                  showViewAll={true}
                />
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>
            {/* Quick Info Card */}
            <Card padding="lg" shadow="md" className={styles.infoCard}>
              <h3 className={styles.cardTitle}>About</h3>
              <div className={styles.infoGrid}>
                <InfoItem
                  icon="👥"
                  label="Members"
                  value={currentCommunity.totalMembers || 0}
                />
                <InfoItem
                  icon="📅"
                  label="Events"
                  value={currentCommunity.totalEvents || 0}
                />
                <InfoItem
                  icon="⭐"
                  label="Rating"
                  value={(currentCommunity.avgRating || 0).toFixed(1) + " / 5"}
                />
                <InfoItem
                  icon="🏆"
                  label="Status"
                  value={
                    isVerified
                      ? "Verified"
                      : currentCommunity.verificationStatus || "Unverified"
                  }
                />
              </div>
            </Card>

            {/* Organization Details */}
            {currentCommunity.organizationDetails && (
              <Card padding="lg" shadow="md" className={styles.infoCard}>
                <h3 className={styles.cardTitle}>Organization</h3>
                <div className={styles.detailsList}>
                  {currentCommunity.organizationDetails.registrationNumber && (
                    <DetailItem
                      label="Registration #"
                      value={
                        currentCommunity.organizationDetails.registrationNumber
                      }
                    />
                  )}
                  {currentCommunity.organizationDetails.memberCount && (
                    <DetailItem
                      label="Total Members"
                      value={currentCommunity.organizationDetails.memberCount}
                    />
                  )}
                  {currentCommunity.organizationDetails.pastEventsCount !==
                    undefined && (
                    <DetailItem
                      label="Past Events"
                      value={
                        currentCommunity.organizationDetails.pastEventsCount
                      }
                    />
                  )}
                </div>
              </Card>
            )}

            {/* Creator Info */}
            {currentCommunity.createdBy && (
              <Card padding="lg" shadow="md" className={styles.infoCard}>
                <h3 className={styles.cardTitle}>Created By</h3>
                <div
                  className={styles.creatorCard}
                  onClick={() =>
                    navigate(`/profile/${currentCommunity.createdBy._id}`)
                  }
                >
                  {currentCommunity.createdBy.profileImage ? (
                    <img
                      src={currentCommunity.createdBy.profileImage}
                      alt={currentCommunity.createdBy.name}
                      className={styles.creatorImage}
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/60?text=User";
                      }}
                    />
                  ) : (
                    <div className={styles.creatorImagePlaceholder}>
                      {currentCommunity.createdBy.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className={styles.creatorInfo}>
                    <p className={styles.creatorName}>
                      {currentCommunity.createdBy.name}
                    </p>
                    <p className={styles.creatorRole}>Community Founder</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  fullWidth
                  onClick={() =>
                    navigate(`/profile/${currentCommunity.createdBy._id}`)
                  }
                  style={{ marginTop: "12px" }}
                >
                  View Profile
                </Button>
              </Card>
            )}
          </div>
        </div>

        {/* Members Section */}
        {isMember && (
          <div className={styles.section}>
            <MembersList
              communityId={communityId}
              members={currentCommunity.members || []}
              maxMembers={8}
              showViewAll={currentCommunity.members?.length > 8}
              compact={false}
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

// Info Item Component
const InfoItem = ({ icon, label, value }) => (
  <div className={styles.infoItemContainer}>
    <span className={styles.infoItemIcon}>{icon}</span>
    <div className={styles.infoItemContent}>
      <span className={styles.infoItemLabel}>{label}</span>
      <span className={styles.infoItemValue}>{value}</span>
    </div>
  </div>
);

// Detail Item Component
const DetailItem = ({ label, value }) => (
  <div className={styles.detailItem}>
    <span className={styles.detailLabel}>{label}</span>
    <span className={styles.detailValue}>{value}</span>
  </div>
);

export default CommunityDetail;
