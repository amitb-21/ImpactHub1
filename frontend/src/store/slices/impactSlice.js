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

// Initial state
const initialState = {
  metrics: null,
  progress: null,
  leaderboard: {
    data: [],
    pagination: null
  },
  volunteerLeaderboard: {
    data: [],
    pagination: null
  },
  userRank: null,
  isLoading: false,
  error: null
};

// Slice
const impactSlice = createSlice({
  name: 'impact',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    pointsEarned: (state, action) => {
      // Real-time points update from Socket.io
      if (state.metrics) {
        state.metrics.totalPoints += action.payload.points;
      }
    },
    levelUp: (state, action) => {
      // Real-time level up from Socket.io
      if (state.progress) {
        state.progress.currentLevel = action.payload.level;
      }
    },
    leaderboardUpdated: (state, action) => {
      // Real-time leaderboard update
      const { userId, totalPoints, rank } = action.payload;
      const index = state.leaderboard.data.findIndex(u => u.userId === userId);
      if (index !== -1) {
        state.leaderboard.data[index] = { ...state.leaderboard.data[index], totalPoints, rank };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch metrics
      .addCase(fetchUserMetrics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.metrics = action.payload.metrics;
      })
      .addCase(fetchUserMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch progress
      .addCase(fetchUserProgress.fulfilled, (state, action) => {
        state.progress = action.payload;
      })
      // Fetch leaderboard
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.leaderboard.data = action.payload.data;
        state.leaderboard.pagination = action.payload.pagination;
      })
      // Fetch user rank
      .addCase(fetchUserRank.fulfilled, (state, action) => {
        state.userRank = action.payload;
      })
      // Fetch volunteer leaderboard
      .addCase(fetchVolunteerLeaderboard.fulfilled, (state, action) => {
        state.volunteerLeaderboard.data = action.payload.data;
        state.volunteerLeaderboard.pagination = action.payload.pagination;
      });
  }
});

export const { clearError, pointsEarned, levelUp, leaderboardUpdated } = impactSlice.actions;
export default impactSlice.reducer;