import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ratingAPI } from '../../api/services';
import { toast } from 'react-toastify';

// Async thunks
export const createRating = createAsyncThunk(
  'rating/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await ratingAPI.create(data);
      toast.success('Rating submitted successfully!');
      return response.data.rating;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create rating';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchRatings = createAsyncThunk(
  'rating/fetchRatings',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await ratingAPI.getAll(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchEntityRatings = createAsyncThunk(
  'rating/fetchEntityRatings',
  async ({ entityType, entityId, page = 1, sortBy = 'recent' }, { rejectWithValue }) => {
    try {
      const response = await ratingAPI.getAll({
        entityType,
        entityId,
        page,
        sortBy
      });
      return {
        entityType,
        entityId,
        ...response.data
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateRating = createAsyncThunk(
  'rating/update',
  async ({ ratingId, data }, { rejectWithValue }) => {
    try {
      const response = await ratingAPI.update(ratingId, data);
      toast.success('Rating updated successfully!');
      return response.data.rating;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update rating';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteRating = createAsyncThunk(
  'rating/delete',
  async (ratingId, { rejectWithValue }) => {
    try {
      await ratingAPI.delete(ratingId);
      toast.success('Rating deleted successfully!');
      return ratingId;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete rating';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const markHelpful = createAsyncThunk(
  'rating/markHelpful',
  async ({ ratingId, helpful }, { rejectWithValue }) => {
    try {
      const response = await ratingAPI.markHelpful(ratingId, helpful);
      return response.data.rating;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Initial state - UPDATED with avgRating and totalRatings
const initialState = {
  allRatings: {
    data: [],
    pagination: null,
    filters: {}
  },
  entityRatings: {
    data: [],
    pagination: null,
    distribution: [], // Rating distribution (1-star, 2-star, etc.)
    currentEntity: null, // { entityType, entityId }
    avgRating: 0,        // NEW - Store average rating
    totalRatings: 0      // NEW - Store total ratings count
  },
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null,
  myRating: null // Current user's rating for an entity
};

// Slice
const ratingSlice = createSlice({
  name: 'rating',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearEntityRatings: (state) => {
      state.entityRatings = {
        data: [],
        pagination: null,
        distribution: [],
        currentEntity: null,
        avgRating: 0,
        totalRatings: 0
      };
    },
    setFilters: (state, action) => {
      state.allRatings.filters = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create rating
      .addCase(createRating.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createRating.fulfilled, (state, action) => {
        state.isCreating = false;
        state.myRating = action.payload;
        // Add to entity ratings if applicable
        if (state.entityRatings.data.length > 0) {
          state.entityRatings.data.unshift(action.payload);
        }
      })
      .addCase(createRating.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })

      // Fetch all ratings
      .addCase(fetchRatings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRatings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allRatings.data = action.payload.data;
        state.allRatings.pagination = action.payload.pagination;
      })
      .addCase(fetchRatings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch entity ratings - UPDATED to capture avgRating and totalRatings
      .addCase(fetchEntityRatings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEntityRatings.fulfilled, (state, action) => {
        state.isLoading = false;
        const { 
          entityType, 
          entityId, 
          data, 
          distribution, 
          pagination,
          avgRating,      // NEW - Extract from payload
          totalRatings    // NEW - Extract from payload
        } = action.payload;
        
        state.entityRatings.data = data || [];
        state.entityRatings.distribution = distribution || [];
        state.entityRatings.pagination = pagination;
        state.entityRatings.currentEntity = { entityType, entityId };
        state.entityRatings.avgRating = avgRating || 0;        // NEW - Store average
        state.entityRatings.totalRatings = totalRatings || 0; // NEW - Store count
        
        // Find user's rating if exists
        state.myRating = data?.find(r => r.isVerifiedParticipant) || null;
      })
      .addCase(fetchEntityRatings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update rating
      .addCase(updateRating.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateRating.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.myRating = action.payload;
        
        // Update in entity ratings
        const index = state.entityRatings.data.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.entityRatings.data[index] = action.payload;
        }
        
        // Update in all ratings
        const allIndex = state.allRatings.data.findIndex(r => r._id === action.payload._id);
        if (allIndex !== -1) {
          state.allRatings.data[allIndex] = action.payload;
        }
      })
      .addCase(updateRating.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      // Delete rating
      .addCase(deleteRating.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(deleteRating.fulfilled, (state, action) => {
        state.isUpdating = false;
        
        // Remove from entity ratings
        state.entityRatings.data = state.entityRatings.data.filter(r => r._id !== action.payload);
        
        // Remove from all ratings
        state.allRatings.data = state.allRatings.data.filter(r => r._id !== action.payload);
        
        // Clear my rating if deleted
        if (state.myRating?._id === action.payload) {
          state.myRating = null;
        }
      })
      .addCase(deleteRating.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      // Mark helpful
      .addCase(markHelpful.fulfilled, (state, action) => {
        const updatedRating = action.payload;
        
        // Update in entity ratings
        const index = state.entityRatings.data.findIndex(r => r._id === updatedRating._id);
        if (index !== -1) {
          state.entityRatings.data[index] = updatedRating;
        }
        
        // Update in all ratings
        const allIndex = state.allRatings.data.findIndex(r => r._id === updatedRating._id);
        if (allIndex !== -1) {
          state.allRatings.data[allIndex] = updatedRating;
        }
      });
  }
});

export const { clearError, clearEntityRatings, setFilters } = ratingSlice.actions;
export default ratingSlice.reducer;