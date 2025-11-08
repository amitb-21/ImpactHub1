import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { participationAPI } from '../../api/services';
import { toast } from 'react-toastify';

// Async thunks
export const markAttendance = createAsyncThunk(
  'participation/markAttendance',
  async ({ participationId, hoursContributed }, { rejectWithValue }) => {
    try {
      const response = await participationAPI.markAttended(participationId, hoursContributed);
      toast.success('Attendance marked successfully!');
      return response.data.participation;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to mark attendance';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const rejectParticipant = createAsyncThunk(
  'participation/reject',
  async ({ participationId, rejectionReason }, { rejectWithValue }) => {
    try {
      const response = await participationAPI.reject(participationId, rejectionReason);
      toast.success('Participant rejected successfully!');
      return response.data.participation;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reject participant';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getPendingParticipants = createAsyncThunk(
  'participation/getPending',
  async ({ eventId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await participationAPI.getPending(eventId, page);
      return {
        eventId,
        ...response.data
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getVerifiedParticipants = createAsyncThunk(
  'participation/getVerified',
  async ({ eventId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await participationAPI.getVerified(eventId, page);
      return {
        eventId,
        ...response.data
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const saveEventToWishlist = createAsyncThunk(
  'participation/saveWishlist',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await participationAPI.saveToWishlist(eventId);
      toast.success('Event saved to wishlist!');
      return response.data.participation;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save event';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const removeFromWishlist = createAsyncThunk(
  'participation/removeWishlist',
  async (eventId, { rejectWithValue }) => {
    try {
      await participationAPI.removeFromWishlist(eventId);
      toast.success('Event removed from wishlist!');
      return eventId;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to remove from wishlist';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const getUserWishlist = createAsyncThunk(
  'participation/getWishlist',
  async ({ userId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await participationAPI.getWishlist(userId, page);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const getParticipationDetails = createAsyncThunk(
  'participation/getDetails',
  async (participationId, { rejectWithValue }) => {
    try {
      const response = await participationAPI.getParticipationDetails(participationId);
      return response.data.participation;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// Initial state
const initialState = {
  pendingParticipants: {
    data: [],
    pagination: null,
    currentEvent: null
  },
  verifiedParticipants: {
    data: [],
    pagination: null,
    currentEvent: null
  },
  wishlist: {
    data: [],
    pagination: null,
    total: 0
  },
  participationDetail: null,
  isLoading: false,
  isUpdating: false,
  error: null,
  participationSummary: {
    totalRegistered: 0,
    totalAttended: 0,
    totalRejected: 0,
    totalCancelled: 0
  }
};

// Slice
const participationSlice = createSlice({
  name: 'participation',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearParticipationDetail: (state) => {
      state.participationDetail = null;
    },
    clearPendingParticipants: (state) => {
      state.pendingParticipants = {
        data: [],
        pagination: null,
        currentEvent: null
      };
    },
    clearVerifiedParticipants: (state) => {
      state.verifiedParticipants = {
        data: [],
        pagination: null,
        currentEvent: null
      };
    },
    clearWishlist: (state) => {
      state.wishlist = {
        data: [],
        pagination: null,
        total: 0
      };
    },
    setSummary: (state, action) => {
      state.participationSummary = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Mark attendance
      .addCase(markAttendance.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(markAttendance.fulfilled, (state, action) => {
        state.isUpdating = false;
      })
      .addCase(markAttendance.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      // Reject participant
      .addCase(rejectParticipant.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(rejectParticipant.fulfilled, (state, action) => {
        state.isUpdating = false;
      })
      .addCase(rejectParticipant.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })

      // Get pending participants
      .addCase(getPendingParticipants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPendingParticipants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingParticipants.data = action.payload.data || [];
        state.pendingParticipants.pagination = action.payload.pagination || null;
        state.pendingParticipants.currentEvent = action.payload.eventId;
      })
      .addCase(getPendingParticipants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.pendingParticipants.data = [];
        state.pendingParticipants.pagination = null;
      })

      // Get verified participants
      .addCase(getVerifiedParticipants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getVerifiedParticipants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.verifiedParticipants.data = action.payload.data || [];
        state.verifiedParticipants.pagination = action.payload.pagination || null;
        state.verifiedParticipants.currentEvent = action.payload.eventId;
      })
      .addCase(getVerifiedParticipants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.verifiedParticipants.data = [];
        state.verifiedParticipants.pagination = null;
      })

      // Wishlist and details
      .addCase(saveEventToWishlist.fulfilled, (state, action) => {})
      .addCase(removeFromWishlist.fulfilled, (state, action) => {})
      .addCase(getUserWishlist.pending, (state) => {})
      .addCase(getUserWishlist.fulfilled, (state, action) => {})
      .addCase(getUserWishlist.rejected, (state, action) => {})
      .addCase(getParticipationDetails.pending, (state) => {})
      .addCase(getParticipationDetails.fulfilled, (state, action) => {})
      .addCase(getParticipationDetails.rejected, (state, action) => {});
  }
});

export const {
  clearError,
  clearParticipationDetail,
  clearPendingParticipants,
  clearVerifiedParticipants,
  clearWishlist,
  setSummary
} = participationSlice.actions;

export default participationSlice.reducer;
