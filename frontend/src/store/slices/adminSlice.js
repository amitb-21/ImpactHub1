import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminAPI, verificationAPI, resourceAPI as adminResourceAPI } from '../../api/services';
import { toast } from 'react-toastify';

// ===== DASHBOARD & STATS =====
export const getDashboardStats = createAsyncThunk(
  'admin/getDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getDashboard();
      return response.data.dashboard;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getSystemAnalytics = createAsyncThunk(
  'admin/getAnalytics',
  async ({ startDate, endDate }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getSystemAnalytics(startDate, endDate);
      return response.data.analytics;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ===== USER MANAGEMENT =====
export const getAllUsers = createAsyncThunk(
  'admin/getAllUsers',
  async ({ page = 1, role = null, search = null, status = null }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getUsers(page, { role, search, status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getUserDetails = createAsyncThunk(
  'admin/getUserDetails',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getUserDetails(userId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const updateUserRole = createAsyncThunk(
  'admin/updateUserRole',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.updateUserRole(userId, role);
      toast.success(`User role updated to ${role}`);
      return response.data.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update role';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deactivateUser = createAsyncThunk(
  'admin/deactivateUser',
  async ({ userId, reason }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.deactivateUser(userId, reason);
      toast.success('User deactivated');
      return response.data.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to deactivate user';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const reactivateUser = createAsyncThunk(
  'admin/reactivateUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await adminAPI.reactivateUser(userId);
      toast.success('User reactivated');
      return response.data.user;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reactivate user';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ===== COMMUNITY MANAGEMENT =====
export const getAllCommunities = createAsyncThunk(
  'admin/getAllCommunities',
  async ({ page = 1, category = null, search = null, status = null }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getAllCommunities(page, { category, search, status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getCommunityAnalytics = createAsyncThunk(
  'admin/getCommunityAnalytics',
  async (communityId, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getCommunityAnalytics(communityId);
      return response.data.analytics;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const deactivateCommunity = createAsyncThunk(
  'admin/deactivateCommunity',
  async ({ communityId, reason }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.deactivateCommunity(communityId, reason);
      toast.success('Community deactivated');
      return response.data.community;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to deactivate community';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const reactivateCommunity = createAsyncThunk(
  'admin/reactivateCommunity',
  async (communityId, { rejectWithValue }) => {
    try {
      const response = await adminAPI.reactivateCommunity(communityId);
      toast.success('Community reactivated');
      return response.data.community;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reactivate community';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// ===== EVENT MANAGEMENT =====
export const getAllEvents = createAsyncThunk(
  'admin/getAllEvents',
  async (filters = {}, { rejectWithValue }) => {
    try {
      // Assuming adminAPI service will be updated to fetch all events
      // Using eventAPI.getAll as a placeholder if adminAPI.getAllEvents is not defined
      const { eventAPI } = await import('../../api/services');
      const response = await eventAPI.getAll(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getEventAnalytics = createAsyncThunk(
  'admin/getEventAnalytics',
  async (eventId, { rejectWithValue }) => {
    try {
      // This might be a new endpoint or combined with getEventParticipants
      // For now, we'll fetch participants as planned.
      const response = await adminAPI.getEventParticipants(eventId, 1);
      return response.data; // Returns { data, pagination, summary }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getEventParticipants = createAsyncThunk(
  'admin/getEventParticipants',
  async ({ eventId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await adminAPI.getEventParticipants(eventId, page);
      return {
        eventId,
        ...response.data
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const exportParticipantsCSV = createAsyncThunk(
  'admin/exportParticipantsCSV',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await adminAPI.exportParticipantsCSV(eventId);
      // Trigger browser download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `event-${eventId}-participants.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Participants CSV downloaded');
      return response.data;
    } catch (error) {
      toast.error('Failed to download CSV');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ===== CM APPLICATION MANAGEMENT (from verificationSlice) =====
export const getPendingCMApplications = createAsyncThunk(
  'admin/getPendingCMApplications',
  async (page = 1, { rejectWithValue }) => {
    try {
      const response = await verificationAPI.getPending(page); // Assuming this is for CM
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const approveCMApplication = createAsyncThunk(
  'admin/approveCMApplication',
  async ({ applicationId, notes }, { rejectWithValue }) => {
    try {
      const response = await communityManagerAPI.approveApplication(applicationId, notes);
      toast.success('Application approved!');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Approval failed');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const rejectCMApplication = createAsyncThunk(
  'admin/rejectCMApplication',
  async ({ applicationId, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await communityManagerAPI.rejectApplication(applicationId, rejectionReason);
      toast.info('Application rejected.');
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Rejection failed');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ===== RESOURCE MANAGEMENT (from resourceAdminSlice) =====
export const getPendingResources = createAsyncThunk(
  'admin/getPendingResources',
  async (page = 1, { rejectWithValue }) => {
    try {
      const response = await adminResourceAPI.getPending(page);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const approveResource = createAsyncThunk(
  'admin/approveResource',
  async ({ resourceId, notes }, { rejectWithValue }) => {
    try {
      const response = await adminResourceAPI.approve(resourceId, notes);
      toast.success('Resource approved and published!');
      return response.data.resource;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Approval failed');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const rejectResource = createAsyncThunk(
  'admin/rejectResource',
  async ({ resourceId, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await adminResourceAPI.reject(resourceId, rejectionReason);
      toast.info('Resource rejected.');
      return response.data.resource;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Rejection failed');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const toggleFeaturedResource = createAsyncThunk(
  'admin/toggleFeaturedResource',
  async (resourceId, { rejectWithValue }) => {
    try {
      const response = await adminResourceAPI.toggleFeatured(resourceId);
      const action = response.data.isFeatured ? 'Featured' : 'Unfeatured';
      toast.success(`Resource ${action}!`);
      return response.data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Toggle failed');
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getResourceStats = createAsyncThunk(
  'admin/getResourceStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await adminResourceAPI.getStats();
      return response.data.stats;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getAllPublishedResources = createAsyncThunk(
  'admin/getAllPublishedResources',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await adminResourceAPI.getAll(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// ===== AUDIT LOG =====
export const getActivityLog = createAsyncThunk(
  'admin/getActivityLog',
  async (filters = {}, { rejectWithValue }) => {
    try {
      // Assuming activityAPI.getGlobalActivity is the correct endpoint
      const { activityAPI } = await import('../../api/services');
      const response = await activityAPI.getGlobalActivity(filters.page, filters.limit, filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);


// Initial state
const initialState = {
  // Dashboard
  dashboard: {
    stats: {
      totalUsers: 0,
      totalCommunities: 0,
      totalEvents: 0,
      totalParticipations: 0,
      verifiedCommunities: 0,
      pendingVerifications: 0,
      // Added from plan
      totalVolunteerHours: 0,
      totalPointsDistributed: 0,
    },
    recentUsers: [],
    activityTrend: [],
    topVolunteers: [],
    topCommunities: [],
  },

  // Analytics
  analytics: {
    userGrowth: [],
    eventsByCategory: [],
    communityByCategory: [],
    topActivities: []
  },

  // User Management
  users: {
    data: [],
    pagination: null,
    filters: {},
    detail: null
  },

  // Community Management
  communities: {
    data: [],
    pagination: null,
    filters: {},
    detail: null,
    analytics: null
  },
  
  // Event Management
  events: {
    data: [],
    pagination: null,
    filters: {},
  },
  eventDetail: {
    analytics: null,
    participants: {
      data: [],
      pagination: null,
      summary: {}
    },
  },

  // Verification Queues
  pendingCMApplications: {
    data: [],
    pagination: null,
  },
  pendingResources: {
    data: [],
    pagination: null,
  },
  
  // Resource Management
  publishedResources: {
    data: [],
    pagination: null,
  },
  resourceStats: null,
  
  // Audit Log
  auditLog: {
    data: [],
    pagination: null,
  },

  // State
  isLoading: false,
  isUpdating: false,
  isExporting: false,
  error: null
};

// Slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUserDetail: (state) => {
      state.users.detail = null;
    },
    clearCommunityDetail: (state) => {
      state.communities.detail = null;
      state.communities.analytics = null;
    },
    clearEventParticipants: (state) => {
      state.eventDetail.participants = {
        data: [],
        pagination: null,
        summary: {}
      };
    },
    setUserFilters: (state, action) => {
      state.users.filters = action.payload;
    },
    setCommunityFilters: (state, action) => {
      state.communities.filters = action.payload;
    },
    setEventFilters: (state, action) => {
      state.events.filters = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // =====================
      // DASHBOARD & ANALYTICS
      // =====================
      .addCase(getDashboardStats.pending, (state) => { state.isLoading = true; })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboard = action.payload;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getSystemAnalytics.pending, (state) => { state.isLoading = true; })
      .addCase(getSystemAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.analytics = action.payload;
      })
      .addCase(getSystemAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // =====================
      // USER MANAGEMENT
      // =====================
      .addCase(getAllUsers.pending, (state) => { state.isLoading = true; })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users.data = action.payload.data;
        state.users.pagination = action.payload.pagination;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getUserDetails.pending, (state) => { state.isLoading = true; })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users.detail = action.payload;
      })
      .addCase(getUserDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateUserRole.pending, (state) => { state.isUpdating = true; })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.users.data.findIndex(u => u._id === action.payload._id);
        if (index !== -1) state.users.data[index] = action.payload;
        if (state.users.detail?._id === action.payload._id) state.users.detail.user = action.payload;
      })
      .addCase(updateUserRole.rejected, (state, action) => { state.isUpdating = false; state.error = action.payload; })
      .addCase(deactivateUser.pending, (state) => { state.isUpdating = true; })
      .addCase(deactivateUser.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.users.data.findIndex(u => u._id === action.payload._id);
        if (index !== -1) state.users.data[index] = action.payload;
        if (state.users.detail?._id === action.payload._id) state.users.detail.user = action.payload;
      })
      .addCase(deactivateUser.rejected, (state, action) => { state.isUpdating = false; state.error = action.payload; })
      .addCase(reactivateUser.pending, (state) => { state.isUpdating = true; })
      .addCase(reactivateUser.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.users.data.findIndex(u => u._id === action.payload._id);
        if (index !== -1) state.users.data[index] = action.payload;
        if (state.users.detail?._id === action.payload._id) state.users.detail.user = action.payload;
      })
      .addCase(reactivateUser.rejected, (state, action) => { state.isUpdating = false; state.error = action.payload; })


      // =====================
      // COMMUNITY MANAGEMENT
      // =====================
      .addCase(getAllCommunities.pending, (state) => { state.isLoading = true; })
      .addCase(getAllCommunities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.communities.data = action.payload.data;
        state.communities.pagination = action.payload.pagination;
      })
      .addCase(getAllCommunities.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      .addCase(getCommunityAnalytics.pending, (state) => { state.isLoading = true; })
      .addCase(getCommunityAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.communities.analytics = action.payload;
      })
      .addCase(getCommunityAnalytics.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      .addCase(deactivateCommunity.pending, (state) => { state.isUpdating = true; })
      .addCase(deactivateCommunity.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.communities.data.findIndex(c => c._id === action.payload._id);
        if (index !== -1) state.communities.data[index] = action.payload;
        if (state.communities.detail?._id === action.payload._id) state.communities.detail = action.payload;
      })
      .addCase(deactivateCommunity.rejected, (state, action) => { state.isUpdating = false; state.error = action.payload; })
      .addCase(reactivateCommunity.pending, (state) => { state.isUpdating = true; })
      .addCase(reactivateCommunity.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.communities.data.findIndex(c => c._id === action.payload._id);
        if (index !== -1) state.communities.data[index] = action.payload;
        if (state.communities.detail?._id === action.payload._id) state.communities.detail = action.payload;
      })
      .addCase(reactivateCommunity.rejected, (state, action) => { state.isUpdating = false; state.error = action.payload; })

      // =====================
      // EVENT MANAGEMENT
      // =====================
       .addCase(getAllEvents.pending, (state) => { state.isLoading = true; })
      .addCase(getAllEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events.data = action.payload.data;
        state.events.pagination = action.payload.pagination;
      })
      .addCase(getAllEvents.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      .addCase(getEventAnalytics.pending, (state) => { state.isLoading = true; })
      .addCase(getEventAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.eventDetail.analytics = action.payload.summary; // Assuming summary is the analytics
        state.eventDetail.participants = {
          data: action.payload.data,
          pagination: action.payload.pagination,
          summary: action.payload.summary,
        };
      })
      .addCase(getEventAnalytics.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      .addCase(getEventParticipants.pending, (state) => { state.isLoading = true; })
      .addCase(getEventParticipants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.eventDetail.participants.data = action.payload.data;
        state.eventDetail.participants.pagination = action.payload.pagination;
        state.eventDetail.participants.summary = action.payload.summary;
      })
      .addCase(getEventParticipants.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      .addCase(exportParticipantsCSV.pending, (state) => { state.isExporting = true; })
      .addCase(exportParticipantsCSV.fulfilled, (state) => { state.isExporting = false; })
      .addCase(exportParticipantsCSV.rejected, (state, action) => { state.isExporting = false; state.error = action.payload; })

      // =====================
      // VERIFICATION QUEUES
      // =====================
      .addCase(getPendingCMApplications.pending, (state) => { state.isLoading = true; })
      .addCase(getPendingCMApplications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingCMApplications.data = action.payload.data;
        state.pendingCMApplications.pagination = action.payload.pagination;
      })
      .addCase(getPendingCMApplications.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      .addCase(approveCMApplication.pending, (state) => { state.isUpdating = true; })
      .addCase(approveCMApplication.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.pendingCMApplications.data = state.pendingCMApplications.data.filter(
          app => app._id !== action.payload.application._id
        );
      })
      .addCase(approveCMApplication.rejected, (state, action) => { state.isUpdating = false; state.error = action.payload; })
      .addCase(rejectCMApplication.pending, (state) => { state.isUpdating = true; })
      .addCase(rejectCMApplication.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.pendingCMApplications.data = state.pendingCMApplications.data.filter(
          app => app._id !== action.payload.application._id
        );
      })
      .addCase(rejectCMApplication.rejected, (state, action) => { state.isUpdating = false; state.error = action.payload; })
      .addCase(getPendingResources.pending, (state) => { state.isLoading = true; })
      .addCase(getPendingResources.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingResources.data = action.payload.data;
        state.pendingResources.pagination = action.payload.pagination;
      })
      .addCase(getPendingResources.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      .addCase(approveResource.pending, (state) => { state.isUpdating = true; })
      .addCase(approveResource.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.pendingResources.data = state.pendingResources.data.filter(
          res => res._id !== action.payload._id
        );
      })
      .addCase(approveResource.rejected, (state, action) => { state.isUpdating = false; state.error = action.payload; })
      .addCase(rejectResource.pending, (state) => { state.isUpdating = true; })
      .addCase(rejectResource.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.pendingResources.data = state.pendingResources.data.filter(
          res => res._id !== action.payload._id
        );
      })
      .addCase(rejectResource.rejected, (state, action) => { state.isUpdating = false; state.error = action.payload; })

      // =====================
      // RESOURCE MANAGEMENT
      // =====================
      .addCase(getAllPublishedResources.pending, (state) => { state.isLoading = true; })
      .addCase(getAllPublishedResources.fulfilled, (state, action) => {
        state.isLoading = false;
        state.publishedResources.data = action.payload.data;
        state.publishedResources.pagination = action.payload.pagination;
      })
      .addCase(getAllPublishedResources.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      .addCase(getResourceStats.pending, (state) => { state.isLoading = true; })
      .addCase(getResourceStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resourceStats = action.payload;
      })
      .addCase(getResourceStats.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; })
      .addCase(toggleFeaturedResource.pending, (state) => { state.isUpdating = true; })
      .addCase(toggleFeaturedResource.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.publishedResources.data.findIndex(r => r._id === action.payload.resourceId);
        if(index !== -1) {
          state.publishedResources.data[index].isFeatured = action.payload.isFeatured;
        }
      })
      .addCase(toggleFeaturedResource.rejected, (state, action) => { state.isUpdating = false; state.error = action.payload; })

      // =====================
      // AUDIT LOG
      // =====================
      .addCase(getActivityLog.pending, (state) => { state.isLoading = true; })
      .addCase(getActivityLog.fulfilled, (state, action) => {
        state.isLoading = false;
        state.auditLog.data = action.payload.data;
        state.auditLog.pagination = action.payload.pagination;
      })
      .addCase(getActivityLog.rejected, (state, action) => { state.isLoading = false; state.error = action.payload; });
  }
});

export const {
  clearError,
  clearUserDetail,
  clearCommunityDetail,
  clearEventParticipants,
  setUserFilters,
  setCommunityFilters,
  setEventFilters,
} = adminSlice.actions;

export default adminSlice.reducer;