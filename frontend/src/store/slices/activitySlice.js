import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { activityAPI } from '../../api/services';

// Async Thunks
export const fetchAllActivities = createAsyncThunk(
    'activities/fetchAll',
    async ({ page = 1, limit = 20, filters = {} } = {}, { rejectWithValue }) => {
        try {
            const response = await activityAPI.getGlobalActivity(page, limit, filters);
            // return the full response.data (expected shape: { data: [...], pagination: {...} })
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
            const response = await activityAPI.getGlobalActivity();
            // fallback - try to hit individual endpoint if available
            const resp = await fetch(`/api/activities/${activityId}`);
            const json = await resp.json();
            return json;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchCommunityActivities = createAsyncThunk(
    'activities/fetchByCommunity',
    async ({ communityId, page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
        try {
            const response = await activityAPI.getCommunityActivity(communityId, page, limit, filters);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const createNewActivity = createAsyncThunk(
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

export const updateExistingActivity = createAsyncThunk(
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

export const deleteExistingActivity = createAsyncThunk(
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
    activities: { data: [], pagination: { total: 0, page: 1, limit: 20, totalPages: 0 } },
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
        },
        setActivities(state, action) {
            state.activities.data = action.payload.data || [];
            state.activities.pagination = {
                total: action.payload.total || 0,
                page: action.payload.page || 1,
                limit: action.payload.limit || 20,
                totalPages: action.payload.totalPages || 0,
            };
        },
        setCurrentActivity(state, action) {
            state.currentActivity = action.payload;
        },
        addActivity(state, action) {
            state.activities.data.unshift(action.payload);
            state.activities.pagination.total += 1;
        },
        updateActivity(state, action) {
            const index = state.activities.data.findIndex(activity => activity._id === action.payload._id);
            if (index !== -1) {
                state.activities.data[index] = action.payload;
            }
        },
        deleteActivity(state, action) {
            state.activities.data = state.activities.data.filter(activity => activity._id !== action.payload);
            state.activities.pagination.total -= 1;
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchAllActivities & fetchCommunityActivities
            .addCase(fetchAllActivities.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllActivities.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.activities.data = action.payload.data || [];
                state.activities.pagination = {
                    total: action.payload.total || 0,
                    page: action.payload.page || 1,
                    limit: action.payload.limit || 20,
                    totalPages: action.payload.totalPages || 0,
                };
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
                state.activities.data = action.payload.data || [];
                state.activities.pagination = {
                    total: action.payload.total || 0,
                    page: action.payload.page || 1,
                    limit: action.payload.limit || 20,
                    totalPages: action.payload.totalPages || 0,
                };
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
            .addCase(createNewActivity.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createNewActivity.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.activities.data.unshift(action.payload);
                state.activities.pagination.total += 1;
                state.currentActivity = action.payload;
            })
            .addCase(createNewActivity.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // updateActivity
            .addCase(updateExistingActivity.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateExistingActivity.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.activities.data.findIndex(act => act._id === action.payload._id);
                if (index !== -1) {
                    state.activities.data[index] = action.payload;
                }
                if (state.currentActivity?._id === action.payload._id) {
                    state.currentActivity = action.payload;
                }
            })
            .addCase(updateExistingActivity.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // deleteActivity
            .addCase(deleteExistingActivity.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteExistingActivity.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.activities.data = state.activities.data.filter(act => act._id !== action.payload);
                state.activities.pagination.total -= 1;
                if (state.currentActivity?._id === action.payload) {
                    state.currentActivity = null;
                }
            })
            .addCase(deleteExistingActivity.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});
export const { 
    resetActivityStatus, 
    clearCurrentActivity,
    setActivities,
    setCurrentActivity,
    addActivity,
    updateActivity,
    deleteActivity
} = activitySlice.actions;
export default activitySlice.reducer;