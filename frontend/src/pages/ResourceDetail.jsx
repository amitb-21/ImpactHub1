import React, { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchResourceById,
  likeResource,
  unlikeResource,
} from "../store/slices/resourceSlice";
import { useAuth } from "../hooks/useAuth";
import Layout from "../components/common/Layout";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Loader } from "../components/common/Loader";
import { Badge } from "../components/common/Badge";
import { getInitials, formatDate, truncate } from "../config/helpers";
import {
  FiArrowLeft,
  FiHeart,
  FiClock,
  FiEye,
  FiTag,
  FiBookOpen,
  FiZap,
  FiDownload,
  FiVideo,
} from "react-icons/fi";
import styles from "./styles/ResourceDetail.module.css";

// Corrected SimpleMarkdown component.
// It relies on the CSS 'white-space: pre-wrap' to handle newlines correctly.
const SimpleMarkdown = ({ content }) => {
  if (!content) return null;
  return <div className={styles.markdownContent}>{content}</div>;
};

const ResourceDetail = () => {
  const { resourceId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { currentResource, status } = useSelector((state) => state.resources);
  const isLoading = status === "loading";

  useEffect(() => {
    if (resourceId) {
      dispatch(fetchResourceById(resourceId));
    }
  }, [resourceId, dispatch]);

  const isLiked = user && currentResource?.likedBy?.includes(user._id);

  const handleLikeToggle = () => {
    if (!user) return navigate("/login");
    if (isLiked) {
      dispatch(unlikeResource(resourceId));
    } else {
      dispatch(likeResource(resourceId));
    }
  };

  if (isLoading || !currentResource) {
    return (
      <Layout>
        <div className={styles.loadingContainer}>
          <Loader size="lg" text="Loading resource..." />
        </div>
      </Layout>
    );
  }

  const {
    title,
    content,
    author,
    category,
    type,
    difficulty,
    tags,
    estimatedReadTime,
    likes,
    views,
    createdAt,
    relatedResources,
    videoUrl,
    downloadUrl,
  } = currentResource;

  return (
    <Layout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <Button
            variant="ghost"
            size="sm"
            icon={FiArrowLeft}
            onClick={() => navigate("/resources")}
          >
            Back to Resources
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate("/create-resource")}
          >
            Create Resource
          </Button>
        </div>

        <div className={styles.gridContainer}>
          {/* Main Content */}
          <main className={styles.mainContent}>
            <Card padding="lg" shadow="md">
              {/* Title */}
              <h1 className={styles.title}>{title}</h1>

              {/* Meta */}
              <div className={styles.metaContainer}>
                <Badge label={category} variant="primary" size="sm" />
                <Badge label={type} variant="info" size="sm" />
                <Badge label={difficulty} variant="warning" size="sm" />
              </div>

              {/* Author & Date */}
              <div className={styles.authorContainer}>
                {author && (
                  <div
                    className={styles.authorInfo}
                    onClick={() => navigate(`/profile/${author._id}`)}
                  >
                    {author.profileImage ? (
                      <img
                        src={author.profileImage}
                        alt={author.name}
                        className={styles.authorAvatar}
                      />
                    ) : (
                      <div className={styles.authorInitials}>
                        {getInitials(author.name)}
                      </div>
                    )}
                    <div>
                      <span className={styles.authorName}>{author.name}</span>
                      <span className={styles.date}>
                        Posted on {formatDate(createdAt)}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Video/Download Links */}
              {videoUrl && type === "video" && (
                <div className={styles.mediaEmbed}>
                  <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mediaLink}
                  >
                    <FiVideo /> Watch Video
                  </a>
                </div>
              )}
              {downloadUrl && (type === "pdf" || type === "template") && (
                <div className={styles.mediaEmbed}>
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.mediaLink}
                  >
                    <FiDownload /> Download {type}
                  </a>
                </div>
              )}

              {/* Content */}
              <div className={styles.contentBody}>
                <SimpleMarkdown content={content} />
              </div>
            </Card>
          </main>

          {/* Sidebar */}
          <aside className={styles.sidebar}>
            {/* Like Button Card */}
            <Card padding="lg" shadow="md" className={styles.likeCard}>
              <Button
                variant={isLiked ? "primary" : "outline"}
                size="lg"
                icon={FiHeart}
                onClick={handleLikeToggle}
                fullWidth
                style={
                  isLiked
                    ? { backgroundColor: "#ef4444", borderColor: "#ef4444" }
                    : {}
                }
              >
                {isLiked ? "Liked" : "Like"} ({likes || 0})
              </Button>
            </Card>

            {/* Details Card */}
            <Card padding="lg" shadow="md">
              <h3 className={styles.sidebarTitle}>Details</h3>
              <div className={styles.detailsList}>
                <div className={styles.detailItem}>
                  <FiClock size={16} />
                  <strong>Read Time:</strong>
                  <span>{estimatedReadTime || 5} min</span>
                </div>
                <div className={styles.detailItem}>
                  <FiEye size={16} />
                  <strong>Views:</strong>
                  <span>{views || 0}</span>
                </div>
                <div className={styles.detailItem}>
                  <FiBookOpen size={16} />
                  <strong>Type:</strong>
                  <span>{type}</span>
                </div>
                <div className={styles.detailItem}>
                  <FiZap size={16} />
                  <strong>Difficulty:</strong>
                  <span>{difficulty}</span>
                </div>
              </div>

              {tags && tags.length > 0 && (
                <>
                  <h4 className={styles.tagsTitle}>
                    <FiTag size={14} /> Tags
                  </h4>
                  <div className={styles.tagsContainer}>
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        label={tag}
                        variant="default"
                        size="sm"
                      />
                    ))}
                  </div>
                </>
              )}
            </Card>

            {/* Related Resources */}
            {relatedResources && relatedResources.length > 0 && (
              <Card padding="lg" shadow="md">
                <h3 className={styles.sidebarTitle}>Related Resources</h3>
                <div className={styles.relatedList}>
                  {relatedResources.map((res) => (
                    <Link
                      to={`/resources/${res._id}`}
                      key={res._id}
                      className={styles.relatedItem}
                    >
                      <span className={styles.relatedCategory}>
                        {res.category}
                      </span>
                      <h5 className={styles.relatedTitle}>
                        {truncate(res.title, 50)}
                      </h5>
                    </Link>
                  ))}
                </div>
              </Card>
            )}
          </aside>
        </div>
      </div>
    </Layout>
  );
};

export default ResourceDetail;
