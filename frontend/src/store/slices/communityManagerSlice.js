import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { communityManagerAPI } from '../../api/services';
import { toast } from 'react-toastify';

// ===== ASYNC THUNKS =====

// User actions
export const applyAsCommunityManager = createAsyncThunk(
  'communityManager/apply',
  async (data, { rejectWithValue }) => {
    try {
      const response = await communityManagerAPI.apply(data);
      toast.success('Application submitted! Awaiting admin review (3-5 business days).');
      return response.data.application;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit application';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getMyApplication = createAsyncThunk(
  'communityManager/getMyApplication',
  async (_, { rejectWithValue }) => {
    try {
      const response = await communityManagerAPI.getMyApplication();
      return response.data.application;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getApplicationHistory = createAsyncThunk(
  'communityManager/getHistory',
  async (page = 1, { rejectWithValue }) => {
    try {
      const response = await communityManagerAPI.getApplicationHistory(page);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Admin actions
export const getPendingApplications = createAsyncThunk(
  'communityManager/getPending',
  async (page = 1, { rejectWithValue }) => {
    try {
      const response = await communityManagerAPI.getPendingApplications(page);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const viewApplication = createAsyncThunk(
  'communityManager/view',
  async (applicationId, { rejectWithValue }) => {
    try {
      const response = await communityManagerAPI.viewApplication(applicationId);
      return response.data.application;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const approveApplication = createAsyncThunk(
  'communityManager/approve',
  async ({ applicationId, approvalNotes }, { rejectWithValue }) => {
    try {
      const response = await communityManagerAPI.approveApplication(applicationId, approvalNotes);
      toast.success('Application approved! Community created and verified.');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to approve application';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const rejectApplication = createAsyncThunk(
  'communityManager/reject',
  async ({ applicationId, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await communityManagerAPI.rejectApplication(applicationId, rejectionReason);
      toast.info('Application rejected. User notified and can reapply in 30 days.');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reject application';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ===== INITIAL STATE =====

const initialState = {
  // User's application
  myApplication: null,
  applicationHistory: {
    data: [],
    pagination: null
  },
  
  // Admin views
  pendingApplications: {
    data: [],
    pagination: null
  },
  currentApplication: null,
  
  // State
  isLoading: false,
  isSubmitting: false,
  isProcessing: false,
  error: null,
  
  // Success message
  successMessage: null
};

// ===== SLICE =====

const communityManagerSlice = createSlice({
  name: 'communityManager',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearMyApplication: (state) => {
      state.myApplication = null;
    },
    clearCurrentApplication: (state) => {
      state.currentApplication = null;
    },
    clearPendingApplications: (state) => {
      state.pendingApplications = {
        data: [],
        pagination: null
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // ===== APPLY =====
      .addCase(applyAsCommunityManager.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(applyAsCommunityManager.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.myApplication = action.payload;
        state.successMessage = 'Application submitted successfully!';
      })
      .addCase(applyAsCommunityManager.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // ===== GET MY APPLICATION =====
      .addCase(getMyApplication.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyApplication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.myApplication = action.payload;
      })
      .addCase(getMyApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ===== GET APPLICATION HISTORY =====
      .addCase(getApplicationHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getApplicationHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.applicationHistory = {
          data: action.payload.data,
          pagination: action.payload.pagination
        };
      })
      .addCase(getApplicationHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ===== GET PENDING APPLICATIONS (ADMIN) =====
      .addCase(getPendingApplications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPendingApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingApplications = {
          data: action.payload.data,
          pagination: action.payload.pagination
        };
      })
      .addCase(getPendingApplications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ===== VIEW APPLICATION =====
      .addCase(viewApplication.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(viewApplication.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentApplication = action.payload;
      })
      .addCase(viewApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ===== APPROVE APPLICATION =====
      .addCase(approveApplication.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(approveApplication.fulfilled, (state, action) => {
        state.isProcessing = false;
        const { application, community, user } = action.payload;
        
        // Remove from pending
        state.pendingApplications.data = state.pendingApplications.data.filter(
          a => a._id !== application._id
        );
        
        // Update current
        state.currentApplication = application;
        state.successMessage = `Community "${community.name}" created and verified! User promoted to moderator.`;
      })
      .addCase(approveApplication.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload;
      })

      // ===== REJECT APPLICATION =====
      .addCase(rejectApplication.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(rejectApplication.fulfilled, (state, action) => {
        state.isProcessing = false;
        const { application } = action.payload;
        
        // Remove from pending
        state.pendingApplications.data = state.pendingApplications.data.filter(
          a => a._id !== application._id
        );
        
        // Update current
        state.currentApplication = application;
        state.successMessage = 'Application rejected. User can reapply in 30 days.';
      })
      .addCase(rejectApplication.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload;
      });
  }
});

// ===== EXPORTS =====

export const {
  clearError,
  clearSuccessMessage,
  clearMyApplication,
  clearCurrentApplication,
  clearPendingApplications
} = communityManagerSlice.actions;

export default communityManagerSlice.reducer;