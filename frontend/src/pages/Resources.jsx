import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllResources } from "../store/slices/resourceSlice";
import { usePagination } from "../hooks/usePagination";
import { debounce } from "../config/helpers";
import {
  RESOURCE_CATEGORIES,
  RESOURCE_TYPES,
  RESOURCE_DIFFICULTY,
} from "../config/constants";
import Layout from "../components/common/Layout";
import { Card } from "../components/common/Card";
import { Button } from "../components/common/Button";
import { Loader } from "../components/common/Loader";
import ResourceList from "../components/resource/ResourceList";
import FeaturedResources from "../components/resource/FeaturedResources";
import { FiSearch, FiPlus, FiFilter } from "react-icons/fi";
import styles from "./styles/Resources.module.css";

const Resources = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { resources, pagination, status } = useSelector(
    (state) => state.resources
  );
  const isLoading = status === "loading";

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    type: "",
    difficulty: "",
  });

  // Initialize pagination, setting items per page to 12
  const { page, totalPages, goToPage } = usePagination(
    pagination?.total || 0,
    1,
    12
  );

  // Create a stable, debounced function to fetch resources
  const debouncedFetch = useCallback(
    debounce((dispatch, params) => {
      dispatch(fetchAllResources(params));
    }, 300),
    [] // Empty dependency array makes this function stable
  );

  useEffect(() => {
    // This effect runs when page, filters, or searchQuery change
    const params = {
      page,
      limit: 12,
      search: searchQuery || undefined,
      category: filters.category || undefined,
      type: filters.type || undefined,
      difficulty: filters.difficulty || undefined,
    };
    // Call the debounced function
    debouncedFetch(dispatch, params);
  }, [dispatch, page, searchQuery, filters, debouncedFetch]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    goToPage(1); // Reset page on new search
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const newValue = prev[key] === value ? "" : value; // Toggle filter
      return { ...prev, [key]: newValue };
    });
    goToPage(1); // Reset page on filter change
  };

  return (
    <Layout>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Resources</h1>
            <p className={styles.subtitle}>
              Browse articles, guides, and tools shared by the community.
            </p>
          </div>
          <Button
            size="md"
            variant="primary"
            icon={FiPlus}
            onClick={() => navigate("/create-resource")}
          >
            Create Resource
          </Button>
        </div>

        {/* Featured */}
        <FeaturedResources />

        {/* Search & Filters */}
        <Card padding="lg" shadow="md" className={styles.filterCard}>
          <div className={styles.searchWrapper}>
            <FiSearch className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search resources by keyword..."
              value={searchQuery}
              onChange={handleSearchChange}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <h4 className={styles.filterTitle}>
              <FiFilter size={14} /> Filter by Category
            </h4>
            <div className={styles.filterChips}>
              {RESOURCE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`${styles.chip} ${
                    filters.category === cat ? styles.chipActive : ""
                  }`}
                  onClick={() => handleFilterChange("category", cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <h4 className={styles.filterTitle}>Type</h4>
            <div className={styles.filterChips}>
              {RESOURCE_TYPES.map((type) => (
                <button
                  key={type}
                  className={`${styles.chip} ${
                    filters.type === type ? styles.chipActive : ""
                  }`}
                  onClick={() => handleFilterChange("type", type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGroup}>
            <h4 className={styles.filterTitle}>Difficulty</h4>
            <div className={styles.filterChips}>
              {RESOURCE_DIFFICULTY.map((level) => (
                <button
                  key={level}
                  className={`${styles.chip} ${
                    filters.difficulty === level ? styles.chipActive : ""
                  }`}
                  onClick={() => handleFilterChange("difficulty", level)}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Resource List */}
        <ResourceList
          resources={resources.data}
          pagination={{
            ...pagination,
            page: page,
            totalPages: totalPages,
            limit: 12,
          }}
          onPageChange={goToPage}
          isLoading={isLoading}
          emptyMessage={
            searchQuery
              ? `No results found for "${searchQuery}"`
              : "No resources match these filters."
          }
        />
      </div>
    </Layout>
  );
};

export default Resources;
