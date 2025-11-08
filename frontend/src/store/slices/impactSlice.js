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
  async ({ page = 1, metric = 'points' }, { rejectWithValue }) => {
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

export const fetchVolunteerLeaderboard = createAsyncThunk(
  'impact/fetchVolunteerLeaderboard',
  async (page = 1, { rejectWithValue }) => {
    try {
      const response = await pointsAPI.getVolunteerLeaderboard(page);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchImpactSummary = createAsyncThunk(
  'impact/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await impactAPI.getSummary();
      return response.data.summary;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ============================================================
// SECTION 3: Initial state (ensure all fields have defaults)
// ============================================================

const initialState = {
  metrics: null,
  progress: null,
  leaderboard: {
    data: [],
    pagination: null,
  },
  volunteerLeaderboard: {
    data: [],
    pagination: null,
  },
  userRank: null,
  summary: null,
  streak: null,
  achievements: [],
  badges: [],
  isLoading: false,
  error: null,
};

// Slice
const impactSlice = createSlice({
  name: 'impact',
  initialState,

  // ============================================================
  // SECTION 2: Add defensive reducers for socket events
  // ============================================================

  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    pointsEarned: (state, action) => {
      // Real-time points update from Socket.io
      if (state.metrics) {
        state.metrics.totalPoints =
          (state.metrics.totalPoints || 0) + (action.payload.points || 0);
      }
    },
    levelUp: (state, action) => {
      // Real-time level up from Socket.io
      if (state.progress) {
        state.progress.currentLevel =
          action.payload.level || state.progress.currentLevel;
      }
    },
    leaderboardUpdated: (state, action) => {
      // Real-time leaderboard update
      const { userId, totalPoints, rank } = action.payload || {};
      if (userId && Array.isArray(state.leaderboard.data)) {
        const index = state.leaderboard.data.findIndex(
          (u) => u._id === userId
        );
        if (index !== -1) {
          state.leaderboard.data[index] = {
            ...state.leaderboard.data[index],
            totalPoints,
            rank,
          };
        }
      }
    },
    streakUpdated: (state, action) => {
      if (state.metrics) {
        state.metrics.impactStreak = action.payload || 0;
      }
    },
    achievementUnlocked: (state, action) => {
      if (!state.achievements) state.achievements = [];
      if (action.payload) {
        state.achievements.push(action.payload);
      }
    },
    badgeEarned: (state, action) => {
      if (!state.badges) state.badges = [];
      if (action.payload) {
        state.badges.push(action.payload);
      }
    },
  },

  // ============================================================
  // SECTION 1: Update the extraReducers
  // ============================================================

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
        state.error = null;
      })
      .addCase(fetchUserMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // FIXED: Don't crash - just set error state
        state.metrics = null;
      })

      // Fetch progress
      .addCase(fetchUserProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.progress = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // FIXED: Don't crash - just set error state
        state.progress = null;
      })

      // Fetch leaderboard
      .addCase(fetchLeaderboard.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leaderboard.data = action.payload.data || [];
        state.leaderboard.pagination = action.payload.pagination;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.leaderboard.data = [];
      })

      // Fetch user rank
      .addCase(fetchUserRank.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserRank.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userRank = action.payload;
      })
      .addCase(fetchUserRank.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.userRank = null;
      })

      // Fetch volunteer leaderboard
      .addCase(fetchVolunteerLeaderboard.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchVolunteerLeaderboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.volunteerLeaderboard.data = action.payload.data || [];
        state.volunteerLeaderboard.pagination = action.payload.pagination;
      })
      .addCase(fetchVolunteerLeaderboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.volunteerLeaderboard.data = [];
      })

      // Fetch impact summary
      .addCase(fetchImpactSummary.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchImpactSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summary = action.payload;
      })
      .addCase(fetchImpactSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.summary = null;
      });
  },
});

export const {
  clearError,
  pointsEarned,
  levelUp,
  leaderboardUpdated,
  streakUpdated,
  achievementUnlocked,
  badgeEarned,
} = impactSlice.actions;

export default impactSlice.reducer;