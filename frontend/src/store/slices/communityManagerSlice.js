import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { communityManagerAPI } from '../../api/services';
import { toast } from 'react-toastify';

// ===== ASYNC THUNKS =====

export const applyAsCommunityManager = createAsyncThunk(
  'communityManager/apply',
  async (data, { rejectWithValue }) => {
    try {
      // ✅ FIX: Restructure flat form data 'data' into the nested
      // structure the backend API expects.
      const structuredData = {
        communityDetails: {
          name: data.communityName,
          description: data.description,
          category: data.category,
          location: {
            city: data.city,
            // Add other location fields if you collect them
          },
          contactEmail: data.contactEmail,
        },
        organizationDetails: {
          registrationNumber: data.registrationNumber,
          foundedYear: data.foundedYear,
          totalMembers: data.memberCount, // Renamed from memberCount
          activeMembers: data.activeMembers,
          pastEventsOrganized: data.pastEventsCount, // Renamed from pastEventsCount
          organizationType: data.organizationType,
        },
        managerExperience: {
          yearsOfExperience: data.yearsExperience,
          previousRoles: data.previousRoles,
          motivation: data.motivation,
          goals: data.goals,
        },
        documents: [], // Document upload can be added later
        communicationPreference: { email: true, inApp: true },
      };

      // Send the correctly structured data
      const response = await communityManagerAPI.apply(structuredData);
      toast.success('Application submitted! Awaiting admin review (3-5 business days).');
      return response.data.application || response.data;
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
      return response.data.application || response.data;
    } catch (error) {
      // 404 means no application exists - this is NOT an error
      if (error.response?.status === 404) {
        return null;
      }
      const message = error.response?.data?.message || 'Failed to fetch application';
      return rejectWithValue(message);
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
      const message = error.response?.data?.message || 'Failed to fetch history';
      return rejectWithValue(message);
    }
  }
);

export const getPendingApplications = createAsyncThunk(
  'communityManager/getPending',
  async (page = 1, { rejectWithValue }) => {
    try {
      const response = await communityManagerAPI.getPendingApplications(page);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch pending applications';
      return rejectWithValue(message);
    }
  }
);

export const viewApplication = createAsyncThunk(
  'communityManager/view',
  async (applicationId, { rejectWithValue }) => {
    try {
      const response = await communityManagerAPI.viewApplication(applicationId);
      return response.data.application || response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch application';
      return rejectWithValue(message);
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
        state.isSubmitting = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(applyAsCommunityManager.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.myApplication = action.payload;
        state.successMessage = 'Application submitted successfully!';
        state.error = null;
      })
      .addCase(applyAsCommunityManager.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload;
        state.successMessage = null;
      })

      // ===== GET MY APPLICATION =====
      .addCase(getMyApplication.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMyApplication.fulfilled, (state, action) => {
        state.isLoading = false;
        // action.payload is null if no application exists (this is OK)
        state.myApplication = action.payload;
        state.error = null;
      })
      .addCase(getMyApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        // Ensure myApplication is null on error so form shows
        state.myApplication = null;
      })

      // ===== GET APPLICATION HISTORY =====
      .addCase(getApplicationHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getApplicationHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.applicationHistory = {
          data: action.payload.data || [],
          pagination: action.payload.pagination || null
        };
        state.error = null;
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
          data: action.payload.data || [],
          pagination: action.payload.pagination || null
        };
        state.error = null;
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
        state.error = null;
      })
      .addCase(viewApplication.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ===== APPROVE APPLICATION =====
      .addCase(approveApplication.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(approveApplication.fulfilled, (state, action) => {
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
        state.isProcessing = false;
        state.error = action.payload;
        state.successMessage = null;
      })

      // ===== REJECT APPLICATION =====
      .addCase(rejectApplication.pending, (state) => {
        state.isProcessing = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(rejectApplication.fulfilled, (state, action) => {
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