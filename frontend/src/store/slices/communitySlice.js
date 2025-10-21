import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { communityAPI } from '../../api/services';
import { toast } from 'react-toastify';

// Async thunks
export const fetchCommunities = createAsyncThunk(
  'community/fetchAll',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await communityAPI.getAll(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchCommunityById = createAsyncThunk(
  'community/fetchById',
  async (communityId, { rejectWithValue }) => {
    try {
      const response = await communityAPI.getById(communityId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createCommunity = createAsyncThunk(
  'community/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await communityAPI.create(data);
      toast.success('Community created! Awaiting verification.');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create community';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateCommunity = createAsyncThunk(
  'community/update',
  async ({ communityId, data }, { rejectWithValue }) => {
    try {
      const response = await communityAPI.update(communityId, data);
      toast.success('Community updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update community';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const joinCommunity = createAsyncThunk(
  'community/join',
  async (communityId, { rejectWithValue }) => {
    try {
      const response = await communityAPI.join(communityId);
      toast.success('Joined community successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to join community';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const leaveCommunity = createAsyncThunk(
  'community/leave',
  async (communityId, { rejectWithValue }) => {
    try {
      await communityAPI.leave(communityId);
      toast.success('Left community successfully!');
      return communityId;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to leave community';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Initial state
const initialState = {
  communities: {
    data: [],
    pagination: null,
    filters: {}
  },
  currentCommunity: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null
};

// Slice
const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.communities.filters = action.payload;
    },
    clearCurrentCommunity: (state) => {
      state.currentCommunity = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch communities
      .addCase(fetchCommunities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCommunities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.communities.data = action.payload.data;
        state.communities.pagination = action.payload.pagination;
      })
      .addCase(fetchCommunities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch community by ID
      .addCase(fetchCommunityById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCommunityById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCommunity = action.payload.community;
      })
      .addCase(fetchCommunityById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create community
      .addCase(createCommunity.pending, (state) => {
        state.isCreating = true;
      })
      .addCase(createCommunity.fulfilled, (state, action) => {
        state.isCreating = false;
        state.communities.data.unshift(action.payload.community);
      })
      .addCase(createCommunity.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      // Update community
      .addCase(updateCommunity.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(updateCommunity.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.currentCommunity = action.payload.community;
      })
      .addCase(updateCommunity.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      // Join community
      .addCase(joinCommunity.fulfilled, (state, action) => {
        if (state.currentCommunity) {
          state.currentCommunity = action.payload.community;
        }
      })
      // Leave community
      .addCase(leaveCommunity.fulfilled, (state, action) => {
        if (state.currentCommunity?._id === action.payload) {
          state.currentCommunity = null;
        }
      });
  }
});

export const { clearError, setFilters, clearCurrentCommunity } = communitySlice.actions;
export default communitySlice.reducer;