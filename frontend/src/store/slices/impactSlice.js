// frontend/src/store/slices/impactSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { impactAPI, pointsAPI } from '../../api/services';

// ============================================================
// ASYNC THUNKS
// ============================================================

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
// INITIAL STATE
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
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
  },
  userRank: null,
  summary: null,
  streak: null,
  achievements: [],
  badges: [],
  isLoading: false,
  error: null,
};

// ============================================================
// SLICE
// ============================================================

const impactSlice = createSlice({
  name: 'impact',
  initialState,

  reducers: {
    // Clear error message
    clearError: (state) => {
      state.error = null;
    },

    // Real-time points update from Socket.io
    pointsEarned: (state, action) => {
      if (state.metrics) {
        state.metrics.totalPoints =
          (state.metrics.totalPoints || 0) + (action.payload?.points || 0);
      }
    },

    // Real-time level up from Socket.io
    levelUp: (state, action) => {
      if (state.progress) {
        state.progress.currentLevel =
          action.payload?.level || state.progress.currentLevel;
        if (action.payload?.currentPoints !== undefined) {
          state.progress.currentPoints = action.payload.currentPoints;
        }
        if (action.payload?.progress) {
          state.progress.progress = action.payload.progress;
        }
      }
    },

    // Real-time leaderboard update
    leaderboardUpdated: (state, action) => {
      const { userId, totalPoints, rank } = action.payload || {};
      if (userId && Array.isArray(state.leaderboard.data)) {
        const index = state.leaderboard.data.findIndex((u) => u._id === userId);
        if (index !== -1) {
          state.leaderboard.data[index] = {
            ...state.leaderboard.data[index],
            totalPoints,
            rank,
          };
        }
      }

      // Also update volunteer leaderboard if applicable
      if (userId && Array.isArray(state.volunteerLeaderboard.data)) {
        const volunteerIndex = state.volunteerLeaderboard.data.findIndex(
          (u) => u._id === userId
        );
        if (volunteerIndex !== -1) {
          state.volunteerLeaderboard.data[volunteerIndex] = {
            ...state.volunteerLeaderboard.data[volunteerIndex],
            totalPoints,
            rank,
          };
        }
      }
    },

    // Real-time streak update
    streakUpdated: (state, action) => {
      if (state.metrics) {
        state.metrics.impactStreak = action.payload?.streak || 0;
        if (action.payload?.bestStreak !== undefined) {
          state.metrics.bestStreak = action.payload.bestStreak;
        }
      }
    },

    // Achievement unlocked
    achievementUnlocked: (state, action) => {
      if (!Array.isArray(state.achievements)) {
        state.achievements = [];
      }
      if (action.payload) {
        state.achievements.push(action.payload);
      }
    },

    // Badge earned
    badgeEarned: (state, action) => {
      if (!Array.isArray(state.badges)) {
        state.badges = [];
      }
      if (action.payload) {
        state.badges.push(action.payload);
      }
    },
  },

  extraReducers: (builder) => {
    builder
      // ===== FETCH USER METRICS =====
      .addCase(fetchUserMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.metrics = action.payload || {
          totalPoints: 0,
          eventsAttended: 0,
          communitiesJoined: 0,
          hoursVolunteered: 0,
          badgesEarned: 0,
          impactStreak: 0,
          bestStreak: 0,
          pointsBreakdown: {},
        };
        state.error = null;
      })
      .addCase(fetchUserMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.metrics = null;
      })

      // ===== FETCH USER PROGRESS =====
      .addCase(fetchUserProgress.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProgress.fulfilled, (state, action) => {
        state.isLoading = false;
        state.progress = action.payload || {
          currentLevel: 1,
          currentPoints: 0,
          progress: {
            pointsInLevel: 0,
            required: 500,
            percentage: 0,
          },
        };
        state.error = null;
      })
      .addCase(fetchUserProgress.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.progress = null;
      })

      // ===== FETCH LEADERBOARD =====
      .addCase(fetchLeaderboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.leaderboard = {
          data: Array.isArray(action.payload?.data) ? action.payload.data : [],
          pagination: action.payload?.pagination || null,
        };
        state.error = null;
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.leaderboard.data = [];
      })

      // ===== FETCH USER RANK =====
      .addCase(fetchUserRank.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserRank.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userRank = action.payload || null;
        state.error = null;
      })
      .addCase(fetchUserRank.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.userRank = null;
      })

      // ===== FETCH VOLUNTEER LEADERBOARD =====
      .addCase(fetchVolunteerLeaderboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVolunteerLeaderboard.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = Array.isArray(action.payload?.data)
          ? action.payload.data
          : [];
        const pagination = action.payload?.pagination || {};

        state.volunteerLeaderboard = {
          data,
          pagination: {
            page: pagination?.page || 1,
            limit: pagination?.limit || 20,
            total: pagination?.total || 0,
            totalPages: pagination?.totalPages || 0,
          },
        };
        state.error = null;
      })
      .addCase(fetchVolunteerLeaderboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.volunteerLeaderboard = {
          data: [],
          pagination: {
            page: 1,
            limit: 20,
            total: 0,
            totalPages: 0,
          },
        };
      })

      // ===== FETCH IMPACT SUMMARY =====
      .addCase(fetchImpactSummary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchImpactSummary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.summary = action.payload || null;
        state.error = null;
      })
      .addCase(fetchImpactSummary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.summary = null;
      });
  },
});

// ============================================================
// EXPORTS
// ============================================================

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