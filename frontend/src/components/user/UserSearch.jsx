import React, { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { searchUsers, clearSearchResults } from "../../store/slices/userSlice";
import { Card } from "../common/Card";
import { Badge } from "../common/Badge";
import { Loader } from "../common/Loader";
import { FiSearch, FiX, FiMapPin, FiCalendar } from "react-icons/fi";
import { debounce } from "../../config/helpers";
import { formatDate } from "../../config/helpers";
import { calculateRank } from "../../config/helpers";

const UserSearch = ({ onUserSelect, excludeUserId = null }) => {
  const dispatch = useDispatch();
  const { searchResults = {}, isSearching = false } =
    useSelector((state) => state.user) || {};
  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedSearchRef = React.useRef(null);

  if (!debouncedSearchRef.current) {
    debouncedSearchRef.current = debounce((searchQuery) => {
      if (searchQuery.trim().length > 0) {
        dispatch(searchUsers({ query: searchQuery, page: 1 }));
        setHasSearched(true);
      } else {
        dispatch(clearSearchResults());
        setHasSearched(false);
      }
    }, 500);
  }

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearchRef.current(value);
  };

  // Handle clear
  const handleClear = () => {
    setQuery("");
    dispatch(clearSearchResults());
    setHasSearched(false);
  };

  return (
    <div style={styles.container}>
      {/* Search Box */}
      <Card padding="md" shadow="sm" style={styles.searchCard}>
        <div style={styles.searchInputWrapper}>
          <FiSearch size={20} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={query}
            onChange={handleInputChange}
            style={styles.searchInput}
          />
          {query && (
            <button
              onClick={handleClear}
              style={styles.clearButton}
              aria-label="Clear search"
            >
              <FiX size={20} />
            </button>
          )}
        </div>
      </Card>

      {/* Results */}
      {isSearching && (
        <div style={styles.loadingContainer}>
          <Loader size="sm" text="Searching..." />
        </div>
      )}

      {hasSearched &&
        !isSearching &&
        (searchResults?.data?.length || 0) === 0 && (
          <Card padding="lg" style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔍</div>
            <p style={styles.emptyStateTitle}>No users found</p>
            <p style={styles.emptyStateText}>
              Try searching with different keywords
            </p>
          </Card>
        )}

      {(searchResults?.data?.length || 0) > 0 &&
        (() => {
          // ✅ FIX: Prepare displayed results (exclude current user if requested)
          const allResults = searchResults?.data || [];
          const displayedResults = excludeUserId
            ? allResults.filter(
                (user) => String(user._id) !== String(excludeUserId)
              )
            : allResults;

          // ✅ FIX: Handle case where all results were filtered out
          if (displayedResults.length === 0) {
            return (
              <Card padding="lg" style={styles.emptyState}>
                <div style={styles.emptyIcon}>🔍</div>
                <p style={styles.emptyStateTitle}>No other users available</p>
                <p style={styles.emptyStateText}>
                  You're viewing your own profile
                </p>
              </Card>
            );
          }

          return (
            <div style={styles.resultsContainer}>
              <p style={styles.resultsCount}>
                Found {displayedResults.length} user
                {displayedResults.length !== 1 ? "s" : ""}
              </p>

              <div style={styles.resultsList}>
                {displayedResults.map((user) => (
                  <UserSearchResult
                    key={user._id}
                    user={user}
                    onSelect={onUserSelect}
                  />
                ))}
              </div>
            </div>
          );
        })()}
    </div>
  );
};

// User Search Result Card
const UserSearchResult = ({ user, onSelect }) => {
  // ✅ FIX: Add safety checks for user object
  if (!user || !user._id) {
    return null;
  }

  const rank = calculateRank(user.totalPoints || 0);
  const rankColor = rank?.color || "#10b981";

  return (
    <Card
      onClick={() => onSelect?.(user)}
      hover
      shadow="sm"
      padding="md"
      style={styles.resultCard}
    >
      <div style={styles.resultContent}>
        {/* Avatar */}
        <div style={styles.avatarWrapper}>
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name || "User"}
              style={styles.avatar}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/60?text=User";
              }}
            />
          ) : (
            <div style={styles.avatarPlaceholder}>
              <span>{user.name?.charAt(0).toUpperCase() || "U"}</span>
            </div>
          )}

          {/* Rank Badge */}
          {rank && (
            <div style={{ ...styles.rankBadge, backgroundColor: rankColor }}>
              {rank.icon || "🏆"}
            </div>
          )}
        </div>

        {/* User Info */}
        <div style={styles.userInfo}>
          <h3 style={styles.userName}>{user.name || "Unknown User"}</h3>

          {/* Role Badge */}
          {user.role && user.role !== "user" && (
            <Badge
              label={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              variant={user.role === "admin" ? "error" : "warning"}
              size="sm"
              style={{ marginBottom: "8px" }}
            />
          )}

          {/* Email */}
          {user.email && <p style={styles.userEmail}>{user.email}</p>}

          {/* Bio */}
          {user.bio && <p style={styles.userBio}>{user.bio}</p>}

          {/* Meta Info */}
          <div style={styles.userMeta}>
            {user.location && (
              <div style={styles.metaItem}>
                <FiMapPin size={14} style={{ color: "#00796B" }} />
                <span>{user.location}</span>
              </div>
            )}
            {user.createdAt && (
              <div style={styles.metaItem}>
                <FiCalendar size={14} style={{ color: "#00796B" }} />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div style={styles.statsRow}>
            <div style={styles.stat}>
              <span style={styles.statValue}>{user.totalPoints || 0}</span>
              <span style={styles.statLabel}>Points</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statValue}>{rank?.name || "—"}</span>
              <span style={styles.statLabel}>Rank</span>
            </div>
            <div style={styles.stat}>
              <span style={styles.statValue}>{user.eventsJoined || 0}</span>
              <span style={styles.statLabel}>Events</span>
            </div>
          </div>
        </div>

        {/* Action Arrow */}
        <div style={styles.actionArrow}>→</div>
      </div>
    </Card>
  );
};

const styles = {
  container: {
    width: "100%",
  },
  searchCard: {
    marginBottom: "24px",
  },
  searchInputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    color: "#00796B",
    pointerEvents: "none",
  },
  searchInput: {
    width: "100%",
    padding: "12px 40px 12px 40px",
    fontSize: "14px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    backgroundColor: "#FAFAFA",
    color: "#212121",
    transition: "all 0.2s ease",
    fontFamily: "inherit",
    outline: "none",
  },
  clearButton: {
    position: "absolute",
    right: "12px",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#999",
    display: "flex",
    alignItems: "center",
    padding: "4px 8px",
    transition: "color 0.2s ease",
  },
  loadingContainer: {
    padding: "40px 20px",
    textAlign: "center",
  },
  emptyState: {
    padding: "60px 20px",
    textAlign: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: "12px",
  },
  emptyIcon: {
    fontSize: "48px",
    marginBottom: "16px",
    display: "block",
  },
  emptyStateTitle: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#212121",
    margin: "0 0 8px 0",
  },
  emptyStateText: {
    fontSize: "14px",
    color: "#999",
    margin: 0,
  },
  initialState: {
    padding: "80px 40px",
    textAlign: "center",
    color: "#999",
  },
  initialIcon: {
    fontSize: "64px",
    marginBottom: "16px",
    display: "block",
  },
  initialStateText: {
    fontSize: "15px",
    color: "#999",
    margin: 0,
  },
  resultsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  resultsCount: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#666",
    margin: "0 0 8px 0",
  },
  resultsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  resultCard: {
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  resultContent: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  avatarWrapper: {
    position: "relative",
    width: "60px",
    height: "60px",
    flexShrink: 0,
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #00796B",
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: "50%",
    backgroundColor: "#00796B",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "700",
    color: "#FAFAFA",
    border: "3px solid #00796B",
  },
  rankBadge: {
    position: "absolute",
    bottom: "0",
    right: "0",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #FAFAFA",
    fontSize: "14px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: "15px",
    fontWeight: "700",
    color: "#212121",
    margin: "0 0 4px 0",
  },
  userEmail: {
    fontSize: "13px",
    color: "#666",
    margin: "0 0 6px 0",
  },
  userBio: {
    fontSize: "13px",
    color: "#999",
    margin: "0 0 8px 0",
    lineHeight: "1.4",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  userMeta: {
    display: "flex",
    gap: "12px",
    marginBottom: "8px",
    flexWrap: "wrap",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "12px",
    color: "#666",
  },
  statsRow: {
    display: "flex",
    gap: "16px",
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  statValue: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#00796B",
  },
  statLabel: {
    fontSize: "11px",
    color: "#999",
    fontWeight: "500",
  },
  actionArrow: {
    fontSize: "20px",
    color: "#00796B",
    fontWeight: "700",
    opacity: 0.5,
  },
};

export default UserSearch;
