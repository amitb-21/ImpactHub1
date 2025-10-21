import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { verificationAPI } from '../../api/services';
import { toast } from 'react-toastify';

// Async thunks
export const getVerificationStatus = createAsyncThunk(
  'verification/getStatus',
  async (communityId, { rejectWithValue }) => {
    try {
      const response = await verificationAPI.getStatus(communityId);
      return {
        communityId,
        ...response.data
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const submitVerificationRequest = createAsyncThunk(
  'verification/submit',
  async ({ communityId, data }, { rejectWithValue }) => {
    try {
      const response = await verificationAPI.submitRequest(communityId, data);
      toast.success('Verification request submitted! Awaiting admin review.');
      return response.data.verification;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit verification';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ADMIN ONLY
export const getPendingVerifications = createAsyncThunk(
  'verification/getPending',
  async (page = 1, { rejectWithValue }) => {
    try {
      const response = await verificationAPI.getPending(page);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const approveCommunity = createAsyncThunk(
  'verification/approve',
  async ({ verificationId, notes }, { rejectWithValue }) => {
    try {
      const response = await verificationAPI.approve(verificationId, notes);
      toast.success('Community approved! Points awarded to creator.');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to approve community';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const rejectCommunity = createAsyncThunk(
  'verification/reject',
  async ({ verificationId, rejectionReason, notes }, { rejectWithValue }) => {
    try {
      const response = await verificationAPI.reject(verificationId, rejectionReason, notes);
      toast.info('Community verification rejected.');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reject community';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getVerificationHistory = createAsyncThunk(
  'verification/getHistory',
  async ({ page = 1, status = null }, { rejectWithValue }) => {
    try {
      const response = await verificationAPI.getVerificationHistory(page, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Initial state
const initialState = {
  // Community verification status
  statusByCommunity: {}, // { communityId: { status, verification, message } }
  
  // Admin views
  pendingVerifications: {
    data: [],
    pagination: null
  },
  verificationHistory: {
    data: [],
    pagination: null,
    filters: {} // { status: 'pending' | 'verified' | 'rejected' }
  },
  
  // Current verification being processed
  currentVerification: null,
  
  // State
  isLoading: false,
  isSubmitting: false,
  isProcessing: false, // for approve/reject
  error: null,
  
  // Statistics
  stats: {
    pendingCount: 0,
    verifiedCount: 0,
    rejectedCount: 0
  }
};

// Slice
const verificationSlice = createSlice({
  name: 'verification',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentVerification: (state) => {
      state.currentVerification = null;
    },
    clearStatusById: (state, action) => {
      delete state.statusByCommunity[action.payload];
    },
    setFilters: (state, action) => {
      state.verificationHistory.filters = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get verification status
      .addCase(getVerificationStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getVerificationStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const { communityId, status, verification } = action.payload;
        state.statusByCommunity[communityId] = {
          status,
          verification,
          message: action.payload.message
        };
      })
      .addCase(getVerificationStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Submit verification request
      .addCase(submitVerificationRequest.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitVerificationRequest.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.currentVerification = action.payload;
        state.stats.pendingCount += 1;
      })
      .addCase(submitVerificationRequest.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
      })

      // Get pending verifications (ADMIN)
      .addCase(getPendingVerifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPendingVerifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingVerifications.data = action.payload.data;
        state.pendingVerifications.pagination = action.payload.pagination;
        state.stats.pendingCount = action.payload.pagination?.total || 0;
      })
      .addCase(getPendingVerifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Approve community (ADMIN)
      .addCase(approveCommunity.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(approveCommunity.fulfilled, (state, action) => {
        state.isProcessing = false;
        const { verification, community } = action.payload;
        
        // Remove from pending
        state.pendingVerifications.data = state.pendingVerifications.data.filter(
          v => v._id !== verification._id
        );
        
        // Update verification status
        state.statusByCommunity[community._id] = {
          status: 'verified',
          verification,
          message: 'Community verified!'
        };
        
        // Update stats
        state.stats.pendingCount = Math.max(0, state.stats.pendingCount - 1);
        state.stats.verifiedCount += 1;
        
        // Add to history
        state.verificationHistory.data.unshift(verification);
      })
      .addCase(approveCommunity.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload;
      })

      // Reject community (ADMIN)
      .addCase(rejectCommunity.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
      })
      .addCase(rejectCommunity.fulfilled, (state, action) => {
        state.isProcessing = false;
        const { verification, community } = action.payload;
        
        // Remove from pending
        state.pendingVerifications.data = state.pendingVerifications.data.filter(
          v => v._id !== verification._id
        );
        
        // Update verification status
        state.statusByCommunity[community._id] = {
          status: 'rejected',
          verification,
          message: `Community rejected: ${verification.rejectionReason}`
        };
        
        // Update stats
        state.stats.pendingCount = Math.max(0, state.stats.pendingCount - 1);
        state.stats.rejectedCount += 1;
        
        // Add to history
        state.verificationHistory.data.unshift(verification);
      })
      .addCase(rejectCommunity.rejected, (state, action) => {
        state.isProcessing = false;
        state.error = action.payload;
      })

      // Get verification history (ADMIN)
      .addCase(getVerificationHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getVerificationHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.verificationHistory.data = action.payload.data;
        state.verificationHistory.pagination = action.payload.pagination;
        
        // Update stats from history
        const data = action.payload.data;
        state.stats.verifiedCount = data.filter(v => v.status === 'verified').length;
        state.stats.rejectedCount = data.filter(v => v.status === 'rejected').length;
      })
      .addCase(getVerificationHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  clearCurrentVerification,
  clearStatusById,
  setFilters
} = verificationSlice.actions;

export default verificationSlice.reducer;