import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { eventAPI, participationAPI } from '../../api/services';
import { toast } from 'react-toastify';

// Async thunks
export const fetchEvents = createAsyncThunk(
  'event/fetchEvents',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await eventAPI.getAll(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const fetchEventById = createAsyncThunk(
  'event/fetchById',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await eventAPI.getById(eventId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

export const createEvent = createAsyncThunk(
  'event/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await eventAPI.create(data);
      toast.success('Event created successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create event';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateEvent = createAsyncThunk(
  'event/update',
  async ({ eventId, data }, { rejectWithValue }) => {
    try {
      const response = await eventAPI.update(eventId, data);
      toast.success('Event updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update event';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'event/delete',
  async (eventId, { rejectWithValue }) => {
    try {
      await eventAPI.delete(eventId);
      toast.success('Event deleted successfully!');
      return eventId;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete event';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const joinEvent = createAsyncThunk(
  'event/join',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await eventAPI.join(eventId);
      toast.success('Joined event successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to join event';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const leaveEvent = createAsyncThunk(
  'event/leave',
  async (eventId, { rejectWithValue }) => {
    try {
      await eventAPI.leave(eventId);
      toast.success('Left event successfully!');
      return eventId;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to leave event';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const saveEventToWishlist = createAsyncThunk(
  'event/saveToWishlist',
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await participationAPI.saveToWishlist(eventId);
      toast.success('Event saved to wishlist!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to save event';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Initial state
const initialState = {
  events: {
    data: [],
    pagination: null,
    filters: {}
  },
  currentEvent: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  error: null
};

// Slice
const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.events.filters = action.payload;
    },
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
    },
    updateEventCapacity: (state, action) => {
      // Real-time capacity update from Socket.io
      const { eventId, capacity } = action.payload;
      if (state.currentEvent?._id === eventId) {
        state.currentEvent.capacity = capacity;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch events
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events.data = action.payload.data;
        state.events.pagination = action.payload.pagination;
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch event by ID
      .addCase(fetchEventById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentEvent = action.payload.event;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create event
      .addCase(createEvent.pending, (state) => {
        state.isCreating = true;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isCreating = false;
        state.events.data.unshift(action.payload.event);
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload;
      })
      // Update event
      .addCase(updateEvent.pending, (state) => {
        state.isUpdating = true;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.currentEvent = action.payload.event;
        const index = state.events.data.findIndex(e => e._id === action.payload.event._id);
        if (index !== -1) {
          state.events.data[index] = action.payload.event;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      })
      // Delete event
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.events.data = state.events.data.filter(e => e._id !== action.payload);
        state.currentEvent = null;
      })
      // Join event
      .addCase(joinEvent.fulfilled, (state, action) => {
        if (state.currentEvent) {
          state.currentEvent = action.payload.event;
        }
      })
      // Leave event
      .addCase(leaveEvent.fulfilled, (state, action) => {
        if (state.currentEvent?._id === action.payload) {
          // Update participants list
          const userId = action.meta.arg; // Get userId from action
          state.currentEvent.participants = state.currentEvent.participants.filter(
            p => p._id !== userId
          );
        }
      });
  }
});

export const { clearError, setFilters, clearCurrentEvent, updateEventCapacity } = eventSlice.actions;
export default eventSlice.reducer;
  