import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { communityManagerAPI } from '../../api/services';
import { toast } from 'react-toastify';

// ===== ASYNC THUNKS =====

export const applyAsCommunityManager = createAsyncThunk(
  'communityManager/apply',
  async (data, { rejectWithValue }) => {
    try {
      console.log('📝 Submitting CM application with data:', data);
      
      // ✅ FIX: Restructure flat form data 'data' into the nested
      // structure the backend API expects.
      const structuredData = {
        communityDetails: {
          name: data.communityName,
          description: data.description,
          category: data.category,
          location: {
            city: data.city,
          },
          contactEmail: data.contactEmail,
        },
        organizationDetails: {
          registrationNumber: data.registrationNumber,
          foundedYear: data.foundedYear,
          totalMembers: data.memberCount,
          activeMembers: data.activeMembers,
          pastEventsOrganized: data.pastEventsCount,
          organizationType: data.organizationType,
        },
        managerExperience: {
          yearsOfExperience: data.yearsExperience,
          previousRoles: data.previousRoles,
          motivation: data.motivation,
          goals: data.goals,
        },
        documents: [],
        communicationPreference: { email: true, inApp: true },
      };

      console.log('📤 Sending structured data:', structuredData);
      
      const response = await communityManagerAPI.apply(structuredData);
      console.log('✅ Application submitted successfully:', response.data);
      
      toast.success('Application submitted! Awaiting admin review (3-5 business days).');
      return response.data.application || response.data;
    } catch (error) {
      console.error('❌ Application submission error:', error);
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
      console.log('🔄 getMyApplication thunk called');
      const response = await communityManagerAPI.getMyApplication();
      console.log('✅ getMyApplication response:', response);
      
      // ✅ FIX: Extract application from response.data.application
      const application = response.data?.application;
      console.log('✅ Returning application:', application);
      
      // Return null if no application exists (this is valid, not an error)
      return application;
    } catch (error) {
      console.error('❌ getMyApplication error:', error);
      console.log('Error status:', error.response?.status);
      console.log('Error data:', error.response?.data);
      
      // 404 means no application exists - this is NOT an error, return null
      if (error.response?.status === 404) {
        console.log('✅ No application exists (404) - returning null');
        return null;
      }
      
      const message = error.response?.data?.message || 'Failed to fetch application';
      console.error('❌ Final error:', message);
      return rejectWithValue(message);
    }
  }
);

export const getApplicationHistory = createAsyncThunk(
  'communityManager/getHistory',
  async (page = 1, { rejectWithValue }) => {
    try {
      console.log('📜 Fetching application history - page:', page);
      const response = await communityManagerAPI.getApplicationHistory(page);
      console.log('✅ History response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ History fetch error:', error);
      const message = error.response?.data?.message || 'Failed to fetch history';
      return rejectWithValue(message);
    }
  }
);

export const getPendingApplications = createAsyncThunk(
  'communityManager/getPending',
  async (page = 1, { rejectWithValue }) => {
    try {
      console.log('⏳ Fetching pending applications - page:', page);
      const response = await communityManagerAPI.getPendingApplications(page);
      console.log('✅ Pending applications response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Pending applications error:', error);
      const message = error.response?.data?.message || 'Failed to fetch pending applications';
      return rejectWithValue(message);
    }
  }
);

export const viewApplication = createAsyncThunk(
  'communityManager/view',
  async (applicationId, { rejectWithValue }) => {
    try {
      console.log('👁️ Viewing application:', applicationId);
      const response = await communityManagerAPI.viewApplication(applicationId);
      console.log('✅ Application view response:', response.data);
      return response.data.application || response.data;
    } catch (error) {
      console.error('❌ View application error:', error);
      const message = error.response?.data?.message || 'Failed to fetch application';
      return rejectWithValue(message);
    }
  }
);

export const approveApplication = createAsyncThunk(
  'communityManager/approve',
  async ({ applicationId, approvalNotes }, { rejectWithValue }) => {
    try {
      console.log('✅ Approving application:', applicationId);
      const response = await communityManagerAPI.approveApplication(applicationId, approvalNotes);
      console.log('✅ Application approved response:', response.data);
      toast.success('Application approved! Community created and verified.');
      return response.data;
    } catch (error) {
      console.error('❌ Approval error:', error);
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
      console.log('❌ Rejecting application:', applicationId);
      const response = await communityManagerAPI.rejectApplication(applicationId, rejectionReason);
      console.log('✅ Application rejected response:', response.data);
      toast.info('Application rejected. User can reapply in 30 days.');
      return response.data;
    } catch (error) {
      console.error('❌ Rejection error:', error);
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

  // Loading states
  isLoading: false,
  isSubmitting: false,
  isProcessing: false,

  // Messages
  error: null,
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
      // ===== APPLY AS COMMUNITY MANAGER =====
      .addCase(applyAsCommunityManager.pending, (state) => {
        console.log('⏳ applyAsCommunityManager.pending');
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(applyAsCommunityManager.fulfilled, (state, action) => {
        console.log('✅ applyAsCommunityManager.fulfilled - payload:', action.payload);
        state.isSubmitting = false;
        state.myApplication = action.payload;
        state.successMessage = 'Application submitted successfully!';
        state.error = null;
      })
      .addCase(applyAsCommunityManager.rejected, (state, action) => {
        console.log('❌ applyAsCommunityManager.rejected - error:', action.payload);
        state.isSubmitting = false;
        state.error = action.payload;
        state.successMessage = null;
      })

      // ===== GET MY APPLICATION =====
      .addCase(getMyApplication.pending, (state) => {
        console.log('⏳ getMyApplication.pending');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyApplication.fulfilled, (state, action) => {
        console.log('✅ getMyApplication.fulfilled - payload:', action.payload);
        state.isLoading = false;
        // ✅ FIX: Properly set myApplication to null if no application exists
        state.myApplication = action.payload || null;
        state.error = null;
      })
      .addCase(getMyApplication.rejected, (state, action) => {
        console.log('❌ getMyApplication.rejected - error:', action.payload);
        state.isLoading = false;
        state.error = action.payload;
        // Ensure myApplication is null on error so form shows
        state.myApplication = null;
      })

      // ===== GET APPLICATION HISTORY =====
      .addCase(getApplicationHistory.pending, (state) => {
        console.log('⏳ getApplicationHistory.pending');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getApplicationHistory.fulfilled, (state, action) => {
        console.log('✅ getApplicationHistory.fulfilled - payload:', action.payload);
        state.isLoading = false;
        state.applicationHistory = {
          data: action.payload.data || [],
          pagination: action.payload.pagination || null
        };
        state.error = null;
      })
      .addCase(getApplicationHistory.rejected, (state, action) => {
        console.log('❌ getApplicationHistory.rejected - error:', action.payload);
        state.isLoading = false;
        state.error = action.payload;
      })

      // ===== GET PENDING APPLICATIONS (ADMIN) =====
      .addCase(getPendingApplications.pending, (state) => {
        console.log('⏳ getPendingApplications.pending');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPendingApplications.fulfilled, (state, action) => {
        console.log('✅ getPendingApplications.fulfilled - payload:', action.payload);
        state.isLoading = false;
        state.pendingApplications = {
          data: action.payload.data || [],
          pagination: action.payload.pagination || null
        };
        state.error = null;
      })
      .addCase(getPendingApplications.rejected, (state, action) => {
        console.log('❌ getPendingApplications.rejected - error:', action.payload);
        state.isLoading = false;
        state.error = action.payload;
      })

      // ===== VIEW APPLICATION =====
      .addCase(viewApplication.pending, (state) => {
        console.log('⏳ viewApplication.pending');
        state.isLoading = true;
        state.error = null;
      })
      .addCase(viewApplication.fulfilled, (state, action) => {
        console.log('✅ viewApplication.fulfilled - payload:', action.payload);
        state.isLoading = false;
        state.currentApplication = action.payload;
        state.error = null;
      })
      .addCase(viewApplication.rejected, (state, action) => {
        console.log('❌ viewApplication.rejected - error:', action.payload);
        state.isLoading = false;
        state.error = action.payload;
      })

      // ===== APPROVE APPLICATION =====
      .addCase(approveApplication.pending, (state) => {
        console.log('⏳ approveApplication.pending');
        state.isProcessing = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(approveApplication.fulfilled, (state, action) => {
        console.log('✅ approveApplication.fulfilled - payload:', action.payload);
        state.isProcessing = false;
        const { application, community } = action.payload;

        // Remove from pending applications
        if (application?._id) {
          state.pendingApplications.data = state.pendingApplications.data.filter(
            (app) => app._id !== application._id
          );
        }

        // Update current application
        state.currentApplication = application || null;
        state.successMessage = `Community "${community?.name || 'Community'}" created and verified! User promoted to moderator.`;
        state.error = null;
      })
      .addCase(approveApplication.rejected, (state, action) => {
        console.log('❌ approveApplication.rejected - error:', action.payload);
        state.isProcessing = false;
        state.error = action.payload;
        state.successMessage = null;
      })

      // ===== REJECT APPLICATION =====
      .addCase(rejectApplication.pending, (state) => {
        console.log('⏳ rejectApplication.pending');
        state.isProcessing = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(rejectApplication.fulfilled, (state, action) => {
        console.log('✅ rejectApplication.fulfilled - payload:', action.payload);
        state.isProcessing = false;
        const { application } = action.payload;

        // Remove from pending applications
        if (application?._id) {
          state.pendingApplications.data = state.pendingApplications.data.filter(
            (app) => app._id !== application._id
          );
        }

        // Update current application
        state.currentApplication = application || null;
        state.successMessage = 'Application rejected. User can reapply in 30 days.';
        state.error = null;
      })
      .addCase(rejectApplication.rejected, (state, action) => {
        console.log('❌ rejectApplication.rejected - error:', action.payload);
        state.isProcessing = false;
        state.error = action.payload;
        state.successMessage = null;
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