import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { resourceAPI } from '../../api/services';
import { toast } from 'react-toastify';

// ===== ASYNC THUNKS =====

export const getPendingResources = createAsyncThunk(
  'resourceAdmin/getPending',
  async (page = 1, { rejectWithValue }) => {
    try {
      const response = await resourceAPI.getPending(page);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const viewResource = createAsyncThunk(
  'resourceAdmin/view',
  async (resourceId, { rejectWithValue }) => {
    try {
      const response = await resourceAPI.getById(resourceId);
      return response.data.resource;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const approveResource = createAsyncThunk(
  'resourceAdmin/approve',
  async ({ resourceId, notes }, { rejectWithValue }) => {
    try {
      const response = await resourceAPI.approve(resourceId, notes);
      toast.success('Resource approved and published!');
      return response.data.resource;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to approve resource';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const rejectResource = createAsyncThunk(
  'resourceAdmin/reject',
  async ({ resourceId, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await resourceAPI.reject(resourceId, rejectionReason);
      toast.info('Resource rejected. Author notified.');
      return response.data.resource;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reject resource';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const toggleFeaturedResource = createAsyncThunk(
  'resourceAdmin/toggleFeatured',
  async (resourceId, { rejectWithValue }) => {
    try {
      const response = await resourceAPI.toggleFeatured(resourceId);
      const action = response.data.isFeatured ? 'Featured' : 'Unfeatured';
      toast.success(`Resource ${action}!`);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to toggle featured status';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getResourceStats = createAsyncThunk(
  'resourceAdmin/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await resourceAPI.getStats();
      return response.data.stats;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ===== INITIAL STATE =====

const initialState = {
  // Pending resources awaiting approval
  pendingResources: {
    data: [],
    pagination: null
  },
  
  // Currently viewing resource
  currentResource: null,
  
  // Statistics
  stats: {
    totalResources: 0,
    pendingResources: 0,
    totalViews: 0,
    byCategory: [],
    byType: [],
    topResources: []
  },
  
  // State
  isLoading: false,
  isProcessing: false,
  error: null,
  
  // Success message
  successMessage: null
};

// ===== SLICE =====

const resourceAdminSlice = createSlice({
  name: 'resourceAdmin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearCurrentResource: (state) => {
      state.currentResource = null;
    },
    clearPendingResources: (state) => {
      state.pendingResources = {
        data: [],
        pagination: null
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // ===== GET PENDING RESOURCES =====
      .addCase(getPendingResources.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPendingResources.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingResources = {
          data: action.payload.data,
          pagination: action.payload.pagination
        };
      })
      .addCase(getPendingResources.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ===== VIEW RESOURCE =====
      .addCase(viewResource.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(viewResource.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentResource = action.payload;
      })
      .addCase(viewResource.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ===== APPROVE RESOURCE =====
      .addCase(approveResource.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(approveResource.fulfilled, (state, action) => {
        state.isProcessing = false;
        const resourceId = action.payload._id;
        
        // Remove from pending
        state.pendingResources.data = state.pendingResources.data.filter(
          r => r._id !== resourceId
        );
        
        // Update stats
        if (state.stats.pendingResources > 0) {
          state.stats.pendingResources -= 1;
        }
        state.stats.totalResources += 1;
        
        state.successMessage = `Resource "${action.payload.title}" approved and published!`;
      })
      .addCase(approveResource.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload;
      })

      // ===== REJECT RESOURCE =====
      .addCase(rejectResource.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(rejectResource.fulfilled, (state, action) => {
        state.isProcessing = false;
        const resourceId = action.payload._id;
        
        // Remove from pending
        state.pendingResources.data = state.pendingResources.data.filter(
          r => r._id !== resourceId
        );
        
        // Update stats
        if (state.stats.pendingResources > 0) {
          state.stats.pendingResources -= 1;
        }
        
        state.successMessage = `Resource "${action.payload.title}" rejected. Author has been notified.`;
      })
      .addCase(rejectResource.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload;
      })

      // ===== TOGGLE FEATURED =====
      .addCase(toggleFeaturedResource.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(toggleFeaturedResource.fulfilled, (state, action) => {
        state.isProcessing = false;
        const { isFeatured } = action.payload;
        state.successMessage = isFeatured 
          ? 'Resource marked as featured!' 
          : 'Resource removed from featured!';
      })
      .addCase(toggleFeaturedResource.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload;
      })

      // ===== GET STATS =====
      .addCase(getResourceStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getResourceStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload;
      })
      .addCase(getResourceStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

// ===== EXPORTS =====

export const {
  clearError,
  clearSuccessMessage,
  clearCurrentResource,
  clearPendingResources
} = resourceAdminSlice.actions;

export default resourceAdminSlice.reducer;