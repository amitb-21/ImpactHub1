import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userAPI } from '../../api/services';
import { toast } from 'react-toastify';

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userAPI.getProfile(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'user/fetchStats',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userAPI.getStats(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchUserActivity = createAsyncThunk(
  'user/fetchActivity',
  async ({ userId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await userAPI.getActivity(userId, page);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async ({ userId, data }, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateProfile(userId, data);
      toast.success('Profile updated successfully!');
      return response.data.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const searchUsers = createAsyncThunk(
  'user/search',
  async ({ query, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await userAPI.search(query, page);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Initial state
const initialState = {
  profile: null,
  stats: null,
  activity: {
    data: [],
    pagination: null
  },
  searchResults: {
    data: [],
    pagination: null
  },
  isLoading: false,
  isUpdating: false,
  error: null
};

// Slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.stats = null;
      state.activity = { data: [], pagination: null };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.user;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch stats
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.stats = action.payload.stats;
      })
      // Fetch activity
      .addCase(fetchUserActivity.fulfilled, (state, action) => {
        state.activity.data = action.payload.data;
        state.activity.pagination = action.payload.pagination;
      })
      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.profile = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      // Search users
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.searchResults.data = action.payload.data;
        state.searchResults.pagination = action.payload.pagination;
      });
  }
});

export const { clearError, clearProfile } = userSlice.actions;
export default userSlice.reducer;