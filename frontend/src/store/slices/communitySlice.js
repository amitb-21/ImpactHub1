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
      console.log('✅ Community fetched from API:', response.data);
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

// ✅ JOIN COMMUNITY - FIXED
export const joinCommunity = createAsyncThunk(
  'community/join',
  async (communityId, { rejectWithValue }) => {
    try {
      console.log('🔄 Calling join API for:', communityId);
      const response = await communityAPI.join(communityId);
      console.log('✅ Join API response:', response.data);
      
      toast.success('Joined community successfully!');
      
      // Return the full response with community data
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to join community';
      console.error('❌ Join error:', message);
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ✅ LEAVE COMMUNITY - FIXED
export const leaveCommunity = createAsyncThunk(
  'community/leave',
  async (communityId, { rejectWithValue }) => {
    try {
      console.log('🔄 Calling leave API for:', communityId);
      const response = await communityAPI.leave(communityId);
      console.log('✅ Leave API response:', response.data);
      
      toast.success('Left community successfully!');
      
      // Return communityId for identification
      return {
        communityId,
        success: true
      };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to leave community';
      console.error('❌ Leave error:', message);
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
  isJoining: false,
  isLeaving: false,
  error: null,
  lastAction: null // Track last action for debugging
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
    },
    // Force update member in current community
    updateCommunityMembers: (state, action) => {
      if (state.currentCommunity) {
        state.currentCommunity.members = action.payload;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch communities
      .addCase(fetchCommunities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.lastAction = 'fetchCommunities/pending';
      })
      .addCase(fetchCommunities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.communities.data = action.payload.data;
        state.communities.pagination = action.payload.pagination;
        state.lastAction = 'fetchCommunities/fulfilled';
      })
      .addCase(fetchCommunities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.lastAction = 'fetchCommunities/rejected';
      })

      // Fetch community by ID
      .addCase(fetchCommunityById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.lastAction = 'fetchCommunityById/pending';
      })
      .addCase(fetchCommunityById.fulfilled, (state, action) => {
        state.isLoading = false;
        console.log('✅ Setting currentCommunity:', action.payload.community);
        state.currentCommunity = action.payload.community;
        state.lastAction = 'fetchCommunityById/fulfilled';
      })
      .addCase(fetchCommunityById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.lastAction = 'fetchCommunityById/rejected';
      })

      // Create community
      .addCase(createCommunity.pending, (state) => {
        state.isCreating = true;
        state.error = null;
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
        state.error = null;
      })
      .addCase(updateCommunity.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.currentCommunity = action.payload.community;
      })
      .addCase(updateCommunity.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      // ✅ JOIN COMMUNITY - COMPLETELY REWRITTEN
      .addCase(joinCommunity.pending, (state) => {
        state.isJoining = true;
        state.error = null;
        state.lastAction = 'joinCommunity/pending';
        console.log('🔄 Join pending...');
      })
      .addCase(joinCommunity.fulfilled, (state, action) => {
        state.isJoining = false;
        console.log('✅ Join fulfilled! Payload:', action.payload);

        // ✅ CRITICAL: Update currentCommunity with response data
        if (action.payload.community) {
          console.log('📝 Updating currentCommunity with:', action.payload.community);
          state.currentCommunity = {
            ...state.currentCommunity,
            ...action.payload.community,
            // Ensure members array is properly set
            members: action.payload.community.members || state.currentCommunity?.members || []
          };
          console.log('✅ Current community updated');
        }

        state.lastAction = 'joinCommunity/fulfilled';
      })
      .addCase(joinCommunity.rejected, (state, action) => {
        state.isJoining = false;
        state.error = action.payload;
        state.lastAction = 'joinCommunity/rejected';
        console.error('❌ Join rejected:', action.payload);
      })

      // ✅ LEAVE COMMUNITY - REWRITTEN
      .addCase(leaveCommunity.pending, (state) => {
        state.isLeaving = true;
        state.error = null;
        state.lastAction = 'leaveCommunity/pending';
        console.log('🔄 Leave pending...');
      })
      .addCase(leaveCommunity.fulfilled, (state, action) => {
        state.isLeaving = false;
        console.log('✅ Leave fulfilled');
        // Don't update state here - let component refetch
        state.lastAction = 'leaveCommunity/fulfilled';
      })
      .addCase(leaveCommunity.rejected, (state, action) => {
        state.isLeaving = false;
        state.error = action.payload;
        state.lastAction = 'leaveCommunity/rejected';
        console.error('❌ Leave rejected:', action.payload);
      });
  }
});

export const { 
  clearError, 
  setFilters, 
  clearCurrentCommunity,
  updateCommunityMembers 
} = communitySlice.actions;

export default communitySlice.reducer;