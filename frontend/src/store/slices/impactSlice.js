import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { impactAPI, pointsAPI } from '../../api/services';

// Async thunks
export const fetchUserMetrics = createAsyncThunk(
  'impact/fetchMetrics',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await impactAPI.getMetrics(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchUserProgress = createAsyncThunk(
  'impact/fetchProgress',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await impactAPI.getProgress(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchLeaderboard = createAsyncThunk(
  'impact/fetchLeaderboard',
  async ({ page = 1, metric = 'points' } = {}, { rejectWithValue }) => {
    try {
      const response = await impactAPI.getLeaderboard(page, metric);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchUserRank = createAsyncThunk(
  'impact/fetchRank',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await impactAPI.getRank(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchSummary = createAsyncThunk(
  'impact/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await impactAPI.getSummary();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchUserStreak = createAsyncThunk(
  'impact/fetchStreak',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await impactAPI.getStreak(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchLevelDefinitions = createAsyncThunk(
  'impact/fetchLevels',
  async (_, { rejectWithValue }) => {
    try {
      const response = await impactAPI.getLevelDefinitions();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchUserAchievements = createAsyncThunk(
  'impact/fetchAchievements',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await impactAPI.getAchievements(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchUserBadges = createAsyncThunk(
  'impact/fetchBadges',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await impactAPI.getBadges(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchVolunteerLeaderboard = createAsyncThunk(
  'impact/fetchVolunteerLeaderboard',
  async ({ page = 1 } = {}, { rejectWithValue }) => {
    try {
      const response = await pointsAPI.getVolunteerLeaderboard(page);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Initial state
const initialState = {
  metrics: null,
  progress: null,
  leaderboard: {
    data: [],
    pagination: null,
  },
  userRank: null,
  summary: null,
  streak: null,
  levels: [],
  achievements: [],
  badges: [],
  volunteerLeaderboard: {
    data: [],
    pagination: null,
  },
  isLoading: false,
  error: null,
};

const impactSlice = createSlice({
  name: 'impact',
  initialState,
  reducers: {
    // ✅ HANDLE POINTS EARNED - Real-time update
    pointsEarned: (state, action) => {
      const { userId, points, reason, type } = action.payload;

      console.log('💎 Points earned action:', action.payload);

      // Update metrics if available
      if (state.metrics) {
        state.metrics.totalPoints = (state.metrics.totalPoints || 0) + points;
      }

      // Update progress
      if (state.progress) {
        state.progress.currentPoints = (state.progress.currentPoints || 0) + points;
      }

      // Recalculate level if needed
      if (state.levels && state.progress) {
        const currentLevel = state.levels.find(
          (level) =>
            state.progress.currentPoints >= level.minPoints &&
            state.progress.currentPoints < level.maxPoints
        );
        if (currentLevel) {
          state.progress.currentLevel = currentLevel.level;
        }
      }
    },

    // ✅ HANDLE LEVEL UP - Real-time update
    levelUp: (state, action) => {
      const { userId, newLevel, points } = action.payload;

      console.log('🎉 Level up action:', action.payload);

      if (state.progress) {
        state.progress.currentLevel = newLevel;
        state.progress.currentPoints = points;
      }

      if (state.metrics) {
        state.metrics.level = newLevel;
      }
    },

    // ✅ HANDLE STREAK UPDATED
    streakUpdated: (state, action) => {
      const { userId, streak, lastActivityDate } = action.payload;

      console.log('🔥 Streak updated:', action.payload);

      if (state.streak) {
        state.streak.currentStreak = streak;
        state.streak.lastActivityDate = lastActivityDate;
      }
    },

    // ✅ HANDLE ACHIEVEMENT UNLOCKED
    achievementUnlocked: (state, action) => {
      const { userId, achievement } = action.payload;

      console.log('🏆 Achievement unlocked:', action.payload);

      if (!state.achievements) {
        state.achievements = [];
      }

      // Add achievement if not already present
      const exists = state.achievements.find((a) => a._id === achievement._id);
      if (!exists) {
        state.achievements.push(achievement);
      }
    },

    // ✅ HANDLE BADGE EARNED
    badgeEarned: (state, action) => {
      const { userId, badge } = action.payload;

      console.log('🎖️ Badge earned:', action.payload);

      if (!state.badges) {
        state.badges = [];
      }

      // Add badge if not already present
      const exists = state.badges.find((b) => b._id === badge._id);
      if (!exists) {
        state.badges.push(badge);
      }
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch metrics
      .addCase(fetchUserMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchUserMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch progress
      .addCase(fetchUserProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.progress = action.payload;
      })
      .addCase(fetchUserProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch leaderboard
      .addCase(fetchLeaderboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leaderboard = {
          data: action.payload.data || [],
          pagination: action.payload.pagination || null,
        };
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch rank
      .addCase(fetchUserRank.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserRank.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userRank = action.payload;
      })
      .addCase(fetchUserRank.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch summary
      .addCase(fetchSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summary = action.payload;
      })
      .addCase(fetchSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch streak
      .addCase(fetchUserStreak.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserStreak.fulfilled, (state, action) => {
        state.isLoading = false;
        state.streak = action.payload;
      })
      .addCase(fetchUserStreak.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch levels
      .addCase(fetchLevelDefinitions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLevelDefinitions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.levels = action.payload.levels || [];
      })
      .addCase(fetchLevelDefinitions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch achievements
      .addCase(fetchUserAchievements.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserAchievements.fulfilled, (state, action) => {
        state.isLoading = false;
        state.achievements = action.payload.achievements || [];
      })
      .addCase(fetchUserAchievements.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch badges
      .addCase(fetchUserBadges.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserBadges.fulfilled, (state, action) => {
        state.isLoading = false;
        state.badges = action.payload.badges || [];
      })
      .addCase(fetchUserBadges.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch volunteer leaderboard
      .addCase(fetchVolunteerLeaderboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVolunteerLeaderboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.volunteerLeaderboard = {
          data: action.payload.data || [],
          pagination: action.payload.pagination || null,
        };
      })
      .addCase(fetchVolunteerLeaderboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  pointsEarned,
  levelUp,
  streakUpdated,
  achievementUnlocked,
  badgeEarned,
  clearError,
} = impactSlice.actions;

export default impactSlice.reducer;