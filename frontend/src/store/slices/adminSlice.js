import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminAPI } from '../../api/services';
import { toast } from 'react-toastify';

// Dashboard
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

// User Management
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

// Community Management
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

// Event Management
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
      toast.success('CSV downloaded successfully');
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
      pendingVerifications: 0
    },
    recentUsers: [],
    activityTrend: []
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
    detail: null // Currently selected user
  },

  // Community Management
  communities: {
    data: [],
    pagination: null,
    filters: {},
    detail: null,
    analytics: null // Community analytics
  },

  // Event Management
  eventParticipants: {
    data: [],
    pagination: null,
    summary: {
      totalRegistered: 0,
      totalAttended: 0,
      totalRejected: 0,
      totalCancelled: 0
    },
    currentEvent: null
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
      state.eventParticipants = {
        data: [],
        pagination: null,
        summary: {
          totalRegistered: 0,
          totalAttended: 0,
          totalRejected: 0,
          totalCancelled: 0
        },
        currentEvent: null
      };
    },
    setUserFilters: (state, action) => {
      state.users.filters = action.payload;
    },
    setCommunityFilters: (state, action) => {
      state.communities.filters = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // =====================
      // DASHBOARD
      // =====================
      .addCase(getDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboard = action.payload;
      })
      .addCase(getDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get system analytics
      .addCase(getSystemAnalytics.pending, (state) => {
        state.isLoading = true;
      })
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
      .addCase(getAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users.data = action.payload.data;
        state.users.pagination = action.payload.pagination;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get user details
      .addCase(getUserDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users.detail = action.payload;
      })
      .addCase(getUserDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Update user role
      .addCase(updateUserRole.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(updateUserRole.fulfilled, (state, action) => {
        state.isUpdating = false;
        // Update in list
        const index = state.users.data.findIndex(u => u._id === action.payload._id);
        if (index !== -1) {
          state.users.data[index] = action.payload;
        }
        // Update detail
        if (state.users.detail?._id === action.payload._id) {
          state.users.detail = action.payload;
        }
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      // Deactivate user
      .addCase(deactivateUser.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(deactivateUser.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.users.data.findIndex(u => u._id === action.payload._id);
        if (index !== -1) {
          state.users.data[index] = action.payload;
        }
        if (state.users.detail?._id === action.payload._id) {
          state.users.detail = action.payload;
        }
      })
      .addCase(deactivateUser.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      // Reactivate user
      .addCase(reactivateUser.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(reactivateUser.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.users.data.findIndex(u => u._id === action.payload._id);
        if (index !== -1) {
          state.users.data[index] = action.payload;
        }
        if (state.users.detail?._id === action.payload._id) {
          state.users.detail = action.payload;
        }
      })
      .addCase(reactivateUser.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      // =====================
      // COMMUNITY MANAGEMENT
      // =====================
      .addCase(getAllCommunities.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllCommunities.fulfilled, (state, action) => {
        state.isLoading = false;
        state.communities.data = action.payload.data;
        state.communities.pagination = action.payload.pagination;
      })
      .addCase(getAllCommunities.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get community analytics
      .addCase(getCommunityAnalytics.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCommunityAnalytics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.communities.analytics = action.payload;
      })
      .addCase(getCommunityAnalytics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Deactivate community
      .addCase(deactivateCommunity.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(deactivateCommunity.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.communities.data.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.communities.data[index] = action.payload;
        }
        if (state.communities.detail?._id === action.payload._id) {
          state.communities.detail = action.payload;
        }
      })
      .addCase(deactivateCommunity.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      // Reactivate community
      .addCase(reactivateCommunity.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(reactivateCommunity.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.communities.data.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.communities.data[index] = action.payload;
        }
        if (state.communities.detail?._id === action.payload._id) {
          state.communities.detail = action.payload;
        }
      })
      .addCase(reactivateCommunity.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      // =====================
      // EVENT MANAGEMENT
      // =====================
      .addCase(getEventParticipants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getEventParticipants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.eventParticipants.data = action.payload.data;
        state.eventParticipants.pagination = action.payload.pagination;
        state.eventParticipants.summary = action.payload.summary;
        state.eventParticipants.currentEvent = action.payload.eventId;
      })
      .addCase(getEventParticipants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Export participants CSV
      .addCase(exportParticipantsCSV.pending, (state) => {
        state.isExporting = true;
      })
      .addCase(exportParticipantsCSV.fulfilled, (state) => {
        state.isExporting = false;
      })
      .addCase(exportParticipantsCSV.rejected, (state, action) => {
        state.isExporting = false;
        state.error = action.payload;
      });
  }
});

export const {
  clearError,
  clearUserDetail,
  clearCommunityDetail,
  clearEventParticipants,
  setUserFilters,
  setCommunityFilters
} = adminSlice.actions;

export default adminSlice.reducer;