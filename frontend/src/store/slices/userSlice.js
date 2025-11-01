import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userAPI } from '../../api/services';
import { toast } from 'react-toastify';

// Async Thunks
export const fetchUserProfile = createAsyncThunk(
  'user/fetchProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userAPI.getProfile(userId);
      return response.data.user; // payload is the user object
    } catch (error) {
      console.error('Profile fetch error:', error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchUserStats = createAsyncThunk(
  'user/fetchStats',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await userAPI.getStats(userId);
      return response.data.stats;
    } catch (error) {
      console.error('Stats fetch error:', error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchUserActivity = createAsyncThunk(
  'user/fetchActivity',
  async ({ userId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await userAPI.getActivity(userId, page);
      return response.data; // { data, pagination }
    } catch (error) {
      console.error('Activity fetch error:', error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async ({ userId, data }, { rejectWithValue }) => {
    try {
      const response = await userAPI.updateProfile(userId, data);
      toast.success('Profile updated successfully!');
      return response.data.user; // ✅ FIXED: Extract user from response
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
      return response.data; // ✅ Already has { data, pagination }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
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
    pagination: null,
    query: ''
  },
  isLoading: false,
  isUpdating: false,
  isSearching: false,
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
    },
    clearSearchResults: (state) => {
      state.searchResults = {
        data: [],
        pagination: null,
        query: ''
      };
    },
    setSearchQuery: (state, action) => {
      state.searchResults.query = action.payload;
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
        state.profile = action.payload; // ✅ FIXED: payload is the user object
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch stats
      .addCase(fetchUserStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload; // ✅ FIXED: payload is the stats object
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch activity
      .addCase(fetchUserActivity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchUserActivity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activity.data = action.payload.data;
        state.activity.pagination = action.payload.pagination;
      })
      .addCase(fetchUserActivity.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.profile = action.payload; // ✅ FIXED: payload is the user object
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      
      // Search users
      .addCase(searchUsers.pending, (state) => {
        state.isSearching = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.isSearching = false;
        state.searchResults.data = action.payload.data;
        state.searchResults.pagination = action.payload.pagination;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isSearching = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearProfile, clearSearchResults, setSearchQuery } = userSlice.actions;
export default userSlice.reducer;