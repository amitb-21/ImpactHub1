import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { locationAPI } from '../../api/services';

// Thunk for fetching nearby events
export const fetchNearbyEvents = createAsyncThunk(
    'location/fetchNearbyEvents',
    async ({ latitude, longitude, radiusKm }, { rejectWithValue }) => {
        try {
            const response = await locationAPI.getNearbyEvents(latitude, longitude, radiusKm);
            return response.data.data; // The API returns { success, data, metadata }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Thunk for fetching nearby communities
export const fetchNearbyCommunities = createAsyncThunk(
    'location/fetchNearbyCommunities',
    async ({ latitude, longitude, radiusKm }, { rejectWithValue }) => {
        try {
            const response = await locationAPI.getNearbyCommunities(latitude, longitude, radiusKm);
            return response.data.data; // The API returns { success, data, metadata }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Thunk for fetching events by city
export const fetchEventsByCity = createAsyncThunk(
    'location/fetchEventsByCity',
    async (city, { rejectWithValue }) => {
        try {
            const response = await locationAPI.getEventsByCity(city);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Thunk for fetching today's nearby events
export const fetchTodayNearby = createAsyncThunk(
    'location/fetchTodayNearby',
    async ({ latitude, longitude, radiusKm }, { rejectWithValue }) => {
        try {
            const response = await locationAPI.getTodayNearby(latitude, longitude, radiusKm);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    nearbyEvents: [],
    nearbyCommunities: [],
    cityEvents: [],
    todayEvents: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

const locationSlice = createSlice({
    name: 'location',
    initialState,
    reducers: {
         resetLocationStatus: (state) => {
            state.status = 'idle';
            state.error = null;
        },
        clearNearbyItems: (state) => {
            state.nearbyEvents = [];
            state.nearbyCommunities = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchNearbyEvents
            .addCase(fetchNearbyEvents.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchNearbyEvents.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.nearbyEvents = action.payload || [];
            })
            .addCase(fetchNearbyEvents.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                state.nearbyEvents = [];
            })
            // fetchNearbyCommunities
            .addCase(fetchNearbyCommunities.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchNearbyCommunities.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.nearbyCommunities = action.payload || [];
            })
            .addCase(fetchNearbyCommunities.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                state.nearbyCommunities = [];
            })
            // fetchEventsByCity
            .addCase(fetchEventsByCity.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchEventsByCity.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.cityEvents = action.payload || [];
            })
            .addCase(fetchEventsByCity.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                state.cityEvents = [];
            })
            // fetchTodayNearby
            .addCase(fetchTodayNearby.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchTodayNearby.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.todayEvents = action.payload || [];
            })
            .addCase(fetchTodayNearby.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                state.todayEvents = [];
            });
    },
});

export const { resetLocationStatus, clearNearbyItems } = locationSlice.actions;
export default locationSlice.reducer;