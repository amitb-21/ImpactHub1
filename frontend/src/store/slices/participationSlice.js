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
  // Organizer views
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
  
  // Participant views
  wishlist: {
    data: [],
    pagination: null,
    total: 0
  },
  participationDetail: null,
  
  // State
  isLoading: false,
  isUpdating: false,
  error: null,
  
  // Summary for current event
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
        const updatedParticipant = action.payload;
        
        // Move from pending to verified
        const pendingIndex = state.pendingParticipants.data.findIndex(
          p => p._id === updatedParticipant._id
        );
        if (pendingIndex !== -1) {
          state.pendingParticipants.data.splice(pendingIndex, 1);
        }
        
        // Add to verified
        state.verifiedParticipants.data.unshift(updatedParticipant);
        
        // Update summary
        state.participationSummary.totalAttended += 1;
        state.participationSummary.totalRegistered = Math.max(
          0,
          state.participationSummary.totalRegistered - 1
        );
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
        
        // Remove from pending
        const index = state.pendingParticipants.data.findIndex(
          p => p._id === action.payload._id
        );
        if (index !== -1) {
          state.pendingParticipants.data.splice(index, 1);
        }
        
        // Update summary
        state.participationSummary.totalRejected += 1;
        state.participationSummary.totalRegistered = Math.max(
          0,
          state.participationSummary.totalRegistered - 1
        );
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
        state.pendingParticipants.data = action.payload.data;
        state.pendingParticipants.pagination = action.payload.pagination;
        state.pendingParticipants.currentEvent = action.payload.eventId;
      })
      .addCase(getPendingParticipants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get verified participants
      .addCase(getVerifiedParticipants.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getVerifiedParticipants.fulfilled, (state, action) => {
        state.isLoading = false;
        state.verifiedParticipants.data = action.payload.data;
        state.verifiedParticipants.pagination = action.payload.pagination;
        state.verifiedParticipants.currentEvent = action.payload.eventId;
      })
      .addCase(getVerifiedParticipants.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Save to wishlist
      .addCase(saveEventToWishlist.fulfilled, (state, action) => {
        // Add to wishlist if not already there
        if (!state.wishlist.data.find(w => w._id === action.payload._id)) {
          state.wishlist.data.unshift(action.payload);
          state.wishlist.total += 1;
        }
      })

      // Remove from wishlist
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.wishlist.data = state.wishlist.data.filter(
          w => w.event._id !== action.payload
        );
        state.wishlist.total = Math.max(0, state.wishlist.total - 1);
      })

      // Get user wishlist
      .addCase(getUserWishlist.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserWishlist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.wishlist.data = action.payload.data;
        state.wishlist.pagination = action.payload.pagination;
        state.wishlist.total = action.payload.pagination?.total || 0;
      })
      .addCase(getUserWishlist.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Get participation details
      .addCase(getParticipationDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getParticipationDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.participationDetail = action.payload;
      })
      .addCase(getParticipationDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
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