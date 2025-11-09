import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import { usePagination } from "../hooks/usePagination";
import { fetchCommunities, setFilters } from "../store/slices/communitySlice";
import Layout from "../components/common/Layout";
import CommunityCard from "../components/community/CommunityCard";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Badge } from "../components/common/Badge";
import { Loader } from "../components/common/Loader";
import { Modal } from "../components/common/Modal";
import CommunityForm from "../components/community/CommunityForm";
import { FiSearch, FiFilter, FiPlus, FiCheckCircle } from "react-icons/fi";
import { COMMUNITY_CATEGORIES } from "../config/constants";
import styles from "./styles/Communities.module.css";

const Communities = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth();

  // Redux selectors
  const { communities, isLoading, error } = useSelector(
    (state) => state.community
  );

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedVerification, setSelectedVerification] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Pagination hook
  const {
    page,
    limit,
    totalPages,
    goToPage,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev,
  } = usePagination(communities.pagination?.total || 0, 1, 10);

  // Fetch communities on mount and when filters change
  useEffect(() => {
    const filters = {
      page,
      limit,
      search: searchQuery || undefined,
      category: selectedCategory || undefined,
      verificationStatus: selectedVerification || undefined,
    };
    dispatch(fetchCommunities(filters));
    dispatch(setFilters(filters));
  }, [page, searchQuery, selectedCategory, selectedVerification, dispatch]);

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    goToPage(1);
  };

  // Handle category filter
  const handleCategoryFilter = (category) => {
    setSelectedCategory(selectedCategory === category ? "" : category);
    goToPage(1);
  };

  // Handle verification filter
  const handleVerificationFilter = (status) => {
    setSelectedVerification(selectedVerification === status ? "" : status);
    goToPage(1);
  };

  // Handle community creation success
  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    goToPage(1);
  };

  // Handle community selection
  const handleCommunitySelect = (community) => {
    navigate(`/communities/${community._id}`);
  };

  return (
    <Layout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Communities</h1>
            <p className={styles.subtitle}>
              Join communities and collaborate with like-minded volunteers
            </p>
          </div>

          {/* Conditional Rendering for Community Manager */}
          {isAuthenticated && user?.role === "community_manager" && (
            <Button
              size="md"
              variant="primary"
              icon={FiPlus}
              onClick={() => setShowCreateForm(true)}
            >
              Create Community
            </Button>
          )}

          {/* Application Link for Regular Users */}
          {isAuthenticated && user?.role === "user" && (
            <Button
              size="md"
              variant="outline"
              // ✅ FIX: Corrected navigation link
              onClick={() => navigate("/apply-community-manager")}
            >
              Apply to Become a Community Manager
            </Button>
          )}
        </div>

        {/* Create Community Modal */}
        <Modal
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          title="Create Community"
          size="lg"
        >
          <CommunityForm
            onClose={() => setShowCreateForm(false)}
            onSuccess={handleCreateSuccess}
          />
        </Modal>

        {/* Search & Filters Section */}
        <Card padding="lg" shadow="md" className={styles.searchCard}>
          {/* Search Box */}
          <div className={styles.searchWrapper}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search communities by name..."
              value={searchQuery}
              onChange={handleSearch}
              className={styles.searchInput}
            />
          </div>

          {/* Filter Toggle Button */}
          <Button
            size="sm"
            variant="outline"
            icon={FiFilter}
            onClick={() => setShowFilters(!showFilters)}
            style={{ marginTop: "12px" }}
          >
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>

          {/* Filters Panel */}
          {showFilters && (
            <div className={styles.filtersPanel}>
              {/* Category Filter */}
              <div className={styles.filterGroup}>
                <h4 className={styles.filterTitle}>Category</h4>
                <div className={styles.filterChips}>
                  {COMMUNITY_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      onClick={() => handleCategoryFilter(category)}
                      className={`${styles.chip} ${
                        selectedCategory === category ? styles.chipActive : ""
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              {/* Verification Status Filter */}
              <div className={styles.filterGroup}>
                <h4 className={styles.filterTitle}>Verification Status</h4>
                <div className={styles.filterChips}>
                  {["verified", "pending", "unverified"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleVerificationFilter(status)}
                      className={`${styles.chip} ${
                        selectedVerification === status ? styles.chipActive : ""
                      }`}
                    >
                      {status === "verified" && (
                        <FiCheckCircle
                          size={14}
                          style={{ marginRight: "4px" }}
                        />
                      )}
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters Button */}
              {(searchQuery || selectedCategory || selectedVerification) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("");
                    setSelectedVerification("");
                    goToPage(1);
                  }}
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </Card>

        {/* Results Info */}
        {communities.data.length > 0 && (
          <div className={styles.resultsInfo}>
            <p className={styles.resultsText}>
              Found {communities.pagination?.total || 0} communities
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Loader size="md" text="Loading communities..." />
          </div>
        ) : error ? (
          // Error State
          <Card padding="lg" shadow="md" className={styles.errorCard}>
            <div className={styles.errorContent}>
              <div className={styles.errorIcon}>⚠️</div>
              <p className={styles.errorText}>{error}</p>
              <Button
                size="sm"
                variant="primary"
                onClick={() => dispatch(fetchCommunities())}
              >
                Try Again
              </Button>
            </div>
          </Card>
        ) : communities.data.length > 0 ? (
          // Communities Grid
          <>
            <div className={styles.communitiesGrid}>
              {communities.data.map((community) => (
                <CommunityCard
                  key={community._id}
                  community={community}
                  onView={handleCommunitySelect}
                  onJoin={handleCommunitySelect}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={prevPage}
                  disabled={!canGoPrev}
                >
                  Previous
                </Button>

                <div className={styles.pageInfo}>
                  Page {page} of {totalPages}
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={nextPage}
                  disabled={!canGoNext}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          // Empty State
          <Card padding="lg" shadow="md" className={styles.emptyState}>
            <div className={styles.emptyContent}>
              <div className={styles.emptyIcon}>🏘️</div>
              <h3 className={styles.emptyTitle}>No Communities Found</h3>
              <p className={styles.emptyText}>
                {searchQuery || selectedCategory || selectedVerification
                  ? "Try adjusting your filters"
                  : "Be the first to create a community!"}
              </p>
              {isAuthenticated && !searchQuery && (
                <Button
                  size="md"
                  variant="primary"
                  onClick={() => setShowCreateForm(true)}
                  icon={FiPlus}
                >
                  Create Community
                </Button>
              )}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Communities;
