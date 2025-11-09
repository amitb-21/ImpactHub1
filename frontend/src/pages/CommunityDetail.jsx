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
import { fetchEntityRatings } from "../store/slices/ratingSlice";
import { getParticipationDetails } from "../store/slices/participationSlice";
import RatingStats from "../components/rating/RatingStats";
import RatingList from "../components/rating/RatingList";
import RatingForm from "../components/rating/RatingForm";
import Layout from "../components/common/Layout";
import CommunityStats from "../components/community/CommunityStats";
import CommunityGallery from "../components/community/CommunityGallery";
import ActivityFeed from "../components/activity/ActivityFeed";
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
  FiArrowRight,
} from "react-icons/fi";
import styles from "./styles/CommunityDetail.module.css";
import { usePagination } from "../hooks/usePagination";
import { toast } from "react-toastify";

const CommunityDetail = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { joinCommunity: joinCommunitySocket } = useSocket();

  // Redux selectors
  const { currentCommunity, isLoading, error, isJoining } = useSelector(
    (state) => state.community
  );
  const { entityRatings, myRating } = useSelector((state) => state.rating);
  const { participationDetail } = useSelector((state) => state.participation);
  const { activities: communityActivities, status: activityStatus } =
    useSelector((state) => state.activities);

  // Local state for membership tracking
  const [showEditForm, setShowEditForm] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [participationId, setParticipationId] = useState(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Pagination for activities
  const activityPaginationData = communityActivities?.pagination || {
    total: 0,
    limit: 10,
  };
  const {
    page: activityPage,
    totalPages: activityTotalPages,
    goToPage: goToActivityPage,
    startIndex: activityStartIndex,
    endIndex: activityEndIndex,
  } = usePagination(activityPaginationData.total, 1, 10);

  // ✅ EFFECT 1: Fetch community data on mount and refetch trigger
  useEffect(() => {
    if (communityId) {
      console.log("📍 Fetching community:", communityId);
      dispatch(fetchCommunityById(communityId));
      dispatch(
        fetchCommunityActivities({
          communityId,
          page: activityPage,
          limit: 10,
        })
      );
      dispatch(
        fetchEntityRatings({ entityType: "Community", entityId: communityId })
      );
    }
  }, [communityId, dispatch, activityPage, refetchTrigger]);

  // ✅ EFFECT 2: Determine membership status - IMPROVED
  useEffect(() => {
    if (currentCommunity && currentUser) {
      console.log("👤 Checking membership...", {
        communityId: currentCommunity._id,
        userId: currentUser._id,
        memberCount: currentCommunity.members?.length,
      });

      // Safely extract member IDs
      const memberIds = (currentCommunity.members || []).map((m) => {
        if (typeof m === "string") return m;
        if (m._id) return m._id.toString();
        return m.toString();
      });

      const userIdStr = currentUser._id.toString();
      const isMemberNow = memberIds.includes(userIdStr);

      console.log("✅ Member check:", {
        userIdStr,
        memberIds,
        isMemberNow,
      });

      setIsMember(isMemberNow);

      // Check if owner
      const creatorId =
        currentCommunity.createdBy?._id?.toString?.() ||
        currentCommunity.createdBy?.toString?.() ||
        currentCommunity.createdBy;
      const isOwnerNow = creatorId === userIdStr;

      console.log("✅ Owner check:", { creatorId, userIdStr, isOwnerNow });
      setIsOwner(isOwnerNow);
    }
  }, [currentCommunity, currentUser]);

  // Join Socket room when member
  useEffect(() => {
    if (communityId && isMember) {
      console.log("🔌 Joining socket room:", communityId);
      joinCommunitySocket(communityId);
    }
  }, [communityId, isMember, joinCommunitySocket]);

  // ✅ HANDLE JOIN - FIXED WITH BETTER ERROR HANDLING
  const handleJoinCommunity = async () => {
    console.log("🔄 Starting join process...");

    try {
      const result = await dispatch(joinCommunity(communityId));

      console.log("📦 Join result:", result);

      // ✅ FIX: Handle both success and "already member" cases
      if (result.payload?.community) {
        console.log(
          "✅ Join successful! Community data:",
          result.payload.community
        );
        setIsMember(true);
        setRefetchTrigger((prev) => prev + 1);
        joinCommunitySocket(communityId);
        toast.success("Successfully joined community!");
      } else if (
        result.payload?.success === false &&
        result.payload?.message?.includes("Already a member")
      ) {
        // ✅ FIX: User is already a member - just update state
        console.log("✅ User is already a member!");
        setIsMember(true);
        setRefetchTrigger((prev) => prev + 1);
        joinCommunitySocket(communityId);
        toast.info("You are already a member of this community");
      } else if (result.error?.message) {
        console.error("❌ Join failed:", result.error.message);
        toast.error(result.error.message);
      } else {
        console.error("❌ Join failed - unexpected response");
        toast.error("Failed to join community");
      }
    } catch (err) {
      console.error("❌ Error during join:", err);
      toast.error("Error joining community");
    }
  };

  // ✅ HANDLE LEAVE - IMPROVED
  const handleLeaveCommunity = async () => {
    if (!window.confirm("Are you sure you want to leave this community?")) {
      return;
    }

    console.log("🔄 Starting leave process...");

    try {
      const result = await dispatch(leaveCommunity(communityId));

      console.log("📦 Leave result:", result);

      if (
        result.payload === communityId ||
        result.payload?.communityId === communityId
      ) {
        console.log("✅ Leave successful!");
        setIsMember(false);
        setRefetchTrigger((prev) => prev + 1);
        toast.success("Successfully left community!");
      } else {
        console.error("❌ Leave failed");
        toast.error("Failed to leave community");
      }
    } catch (err) {
      console.error("❌ Error during leave:", err);
      toast.error("Error leaving community");
    }
  };

  const handleEditSuccess = () => {
    setShowEditForm(false);
    setRefetchTrigger((prev) => prev + 1);
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
  const showRatingForm = isAuthenticated && isMember && !myRating;
  const showUpdateForm = isAuthenticated && isMember && myRating;
  const showJoinMessage = isAuthenticated && !isMember;
  const showLoginMessage = !isAuthenticated;
  const isCommunityManager = currentUser?.role === "community_manager";

  return (
    <Layout>
      <div className={styles.container}>
        <Button
          size="sm"
          variant="ghost"
          icon={FiArrowLeft}
          onClick={() => navigate("/communities")}
          style={{ marginBottom: "20px" }}
        >
          Back to Communities
        </Button>

        {/* Hero Section */}
        <div className={styles.heroSection}>
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

            {isVerified && (
              <div className={styles.verificationBadge}>
                <FiCheckCircle size={20} />
                <span>Verified Community</span>
              </div>
            )}
          </div>

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
                    toast.success("Link copied!");
                  }}
                >
                  Share
                </Button>
              </div>
            </div>

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

            {/* ✅ JOIN/LEAVE BUTTON - FIXED */}
            <div className={styles.buttonGroup}>
              {!isMember ? (
                <Button
                  size="md"
                  variant="primary"
                  onClick={handleJoinCommunity}
                  loading={isJoining}
                  disabled={isJoining || !isAuthenticated}
                  fullWidth
                >
                  {isJoining
                    ? "Joining..."
                    : isAuthenticated
                    ? "Join Community"
                    : "Login to Join"}
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

        {/* Edit Modal */}
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
            <div className={styles.section}>
              <CommunityStats community={currentCommunity} />
            </div>

            <div className={styles.section}>
              <CommunityTierBadge
                communityPoints={currentCommunity.communityPoints || 0}
                showProgress={true}
              />
            </div>

            <div className={styles.section}>
              <h3 className={styles.cardTitle}>Ratings & Reviews</h3>
              <Card padding="lg" shadow="md">
                <RatingStats
                  avgRating={currentCommunity.avgRating || 0}
                  totalRatings={currentCommunity.totalRatings || 0}
                  distribution={entityRatings.distribution || []}
                />
              </Card>
            </div>

            <div className={styles.section}>
              {showUpdateForm && (
                <RatingForm
                  entityType="Community"
                  entityId={communityId}
                  myRating={myRating}
                />
              )}

              {showRatingForm && (
                <RatingForm entityType="Community" entityId={communityId} />
              )}

              {showJoinMessage && (
                <Card padding="lg" shadow="md">
                  <p className={styles.participantNote}>
                    You must join this community to leave a review.
                  </p>
                </Card>
              )}

              {showLoginMessage && (
                <Card padding="lg" shadow="md">
                  <p className={styles.participantNote}>
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
          </div>

          {/* Right Column */}
          <div className={styles.rightColumn}>

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

            <div className={styles.section}>
              <h3 className={styles.cardTitle}>Community Gallery</h3>
              <CommunityGallery
                communityId={currentCommunity._id}
                maxPhotos={9}
              />
            </div>
          </div>
        </div>

        {/* Activity Feed - Only for members */}
        {isMember && (
          <div className={styles.section} style={{ marginTop: "24px" }}>
            <ActivityFeed
              title="Recent Community Activity"
              activities={communityActivities.data || []}
              pagination={{
                ...activityPaginationData,
                page: activityPage,
                totalPages: activityTotalPages,
                startIndex: activityStartIndex,
                endIndex: activityEndIndex,
                limit: 10,
              }}
              onPageChange={goToActivityPage}
              isLoading={activityStatus === "loading"}
              emptyMessage="No activity in this community yet."
            />
            {activityPaginationData.total > 10 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/communities/${communityId}/activity`)}
                icon={FiArrowRight}
                iconPosition="right"
                style={{
                  marginTop: "16px",
                  display: "block",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                View All Activity ({activityPaginationData.total})
              </Button>
            )}
          </div>
        )}

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

const InfoItem = ({ icon, label, value }) => (
  <div className={styles.infoItemContainer}>
    <span className={styles.infoItemIcon}>{icon}</span>
    <div className={styles.infoItemContent}>
      <span className={styles.infoItemLabel}>{label}</span>
      <span className={styles.infoItemValue}>{value}</span>
    </div>
  </div>
);

const DetailItem = ({ label, value }) => (
  <div className={styles.detailItem}>
    <span className={styles.detailLabel}>{label}</span>
    <span className={styles.detailValue}>{value}</span>
  </div>
);

export default CommunityDetail;
