import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/services';

export const fetchNearbyItems = createAsyncThunk(
    'location/fetchNearby',
    async ({ latitude, longitude, radius }, { rejectWithValue }) => {
         // Construct query parameters
        const params = new URLSearchParams();
        if (latitude != null) params.append('latitude', latitude);
        if (longitude != null) params.append('longitude', longitude);
        if (radius != null) params.append('radius', radius);

        try {
            // Adjust the endpoint if necessary based on your actual backend route for nearby items
            const response = await apiClient.get(`/locations?${params.toString()}`);
            // Assuming the backend returns an object like { events: [], activities: [] }
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    nearbyEvents: [],
    nearbyActivities: [],
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
            state.nearbyActivities = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchNearbyItems
            .addCase(fetchNearbyItems.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchNearbyItems.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Assuming the payload is { events: [...], activities: [...] }
                state.nearbyEvents = action.payload.events || [];
                state.nearbyActivities = action.payload.activities || [];
            })
            .addCase(fetchNearbyItems.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
                state.nearbyEvents = [];
                state.nearbyActivities = [];
            });
    },
});

export const { resetLocationStatus, clearNearbyItems } = locationSlice.actions;
export default locationSlice.reducer;