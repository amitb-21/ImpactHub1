import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/services';

// Async Thunks
export const fetchAllActivities = createAsyncThunk(
    'activities/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/activities');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchActivityById = createAsyncThunk(
    'activities/fetchById',
    async (activityId, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/activities/${activityId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchCommunityActivities = createAsyncThunk(
    'activities/fetchByCommunity',
    async (communityId, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/activities/community/${communityId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const createActivity = createAsyncThunk(
    'activities/create',
    async (activityData, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/activities', activityData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateActivity = createAsyncThunk(
    'activities/update',
    async ({ id, activityData }, { rejectWithValue }) => {
        try {
            const response = await apiClient.put(`/activities/${id}`, activityData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const deleteActivity = createAsyncThunk(
    'activities/delete',
    async (activityId, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/activities/${activityId}`);
            return activityId; // Return the id to remove from state
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);


const initialState = {
    activities: [],
    currentActivity: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

const activitySlice = createSlice({
    name: 'activities',
    initialState,
    reducers: {
        resetActivityStatus: (state) => {
            state.status = 'idle';
            state.error = null;
        },
        clearCurrentActivity: (state) => {
             state.currentActivity = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchAllActivities & fetchCommunityActivities (share state for simplicity, adjust if needed)
            .addCase(fetchAllActivities.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllActivities.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.activities = action.payload;
            })
            .addCase(fetchAllActivities.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            .addCase(fetchCommunityActivities.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCommunityActivities.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.activities = action.payload; // Overwrites general list, adjust if separate state needed
            })
            .addCase(fetchCommunityActivities.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // fetchActivityById
            .addCase(fetchActivityById.pending, (state) => {
                state.status = 'loading';
                state.currentActivity = null;
                state.error = null;
            })
            .addCase(fetchActivityById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentActivity = action.payload;
            })
            .addCase(fetchActivityById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
             // createActivity
            .addCase(createActivity.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createActivity.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.activities.push(action.payload);
                state.currentActivity = action.payload;
            })
            .addCase(createActivity.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
             // updateActivity
            .addCase(updateActivity.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateActivity.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.activities.findIndex(act => act._id === action.payload._id);
                if (index !== -1) {
                    state.activities[index] = action.payload;
                }
                 if (state.currentActivity?._id === action.payload._id) {
                     state.currentActivity = action.payload;
                }
            })
            .addCase(updateActivity.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // deleteActivity
             .addCase(deleteActivity.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteActivity.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.activities = state.activities.filter(act => act._id !== action.payload);
                 if (state.currentActivity?._id === action.payload) {
                     state.currentActivity = null;
                }
            })
            .addCase(deleteActivity.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});
export const { resetActivityStatus, clearCurrentActivity } = activitySlice.actions;
export default activitySlice.reducer;