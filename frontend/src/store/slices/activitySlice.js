import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { activityAPI } from '../../api/services';

export const fetchAllActivities = createAsyncThunk(
    'activities/fetchAll',
    async ({ page = 1, limit = 20, filters = {} } = {}, { rejectWithValue }) => {
        try {
            const response = await activityAPI.getGlobalActivity(page, limit, filters);
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
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchUserActivity = createAsyncThunk(
    'activities/fetchByUser',
    async ({ userId, page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
        try {
            const response = await activityAPI.getUserActivity(userId, page, limit, filters);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchCommunityActivities = createAsyncThunk(
    'activities/fetchByCommunity',
    async ({ communityId, page = 1, limit = 10, filters = {} }, { rejectWithValue }) => {
        try {
            const response = await activityAPI.getCommunityActivity(
                communityId,
                page,
                limit,
                filters
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const getActivityStats = createAsyncThunk(
    'activities/getStats',
    async (_, { rejectWithValue }) => {
        try {
            const response = await activityAPI.getStats();
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
            const response = await activityAPI.createActivity(activityData);
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
            const response = await activityAPI.updateActivity(id, activityData);
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
            await activityAPI.deleteActivity(activityId);
            return activityId;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    activities: {
        data: [],
        pagination: {
            total: 0,
            page: 1,
            limit: 20,
            totalPages: 0,
        },
    },
    currentActivity: null,
    stats: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

const activitySlice = createSlice({
    name: 'activities',
    initialState,
    reducers: {
        // Reset status and error
        resetActivityStatus: (state) => {
            state.status = 'idle';
            state.error = null;
        },

        // Clear current activity
        clearCurrentActivity: (state) => {
            state.currentActivity = null;
        },

        // Set activities manually
        setActivities(state, action) {
            state.activities.data = action.payload.data || [];
            state.activities.pagination = {
                total: action.payload.pagination?.total || 0,
                page: action.payload.pagination?.page || 1,
                limit: action.payload.pagination?.limit || 20,
                totalPages: action.payload.pagination?.totalPages || 0,
            };
        },

        // Set current activity
        setCurrentActivity(state, action) {
            state.currentActivity = action.payload;
        },

        // Add activity (prepend to list - for real-time)
        addActivity(state, action) {
            if (state.activities.data.length > 0) {
                state.activities.data.unshift(action.payload);
            } else {
                state.activities.data.push(action.payload);
            }
            state.activities.pagination.total += 1;
        },

        // Update activity in list
        updateActivity(state, action) {
            const index = state.activities.data.findIndex(
                (activity) => activity._id === action.payload._id
            );
            if (index !== -1) {
                state.activities.data[index] = action.payload;
            }
        },

        // Delete activity from list
        deleteActivity(state, action) {
            state.activities.data = state.activities.data.filter(
                (activity) => activity._id !== action.payload
            );
            state.activities.pagination.total -= 1;
        },

        // Clear all activities
        clearActivities(state) {
            state.activities.data = [];
            state.activities.pagination = {
                total: 0,
                page: 1,
                limit: 20,
                totalPages: 0,
            };
        },

        // Set error message
        setError(state, action) {
            state.error = action.payload;
            state.status = 'failed';
        },

        // Clear error
        clearError(state) {
            state.error = null;
        },
    },

    extraReducers: (builder) => {
        // ===== FETCH ALL ACTIVITIES =====
        builder
            .addCase(fetchAllActivities.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllActivities.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.activities.data = action.payload.data || [];
                state.activities.pagination = {
                    total: action.payload.pagination?.total || action.payload.total || 0,
                    page: action.payload.pagination?.page || action.payload.page || 1,
                    limit: action.payload.pagination?.limit || action.payload.limit || 20,
                    totalPages:
                        action.payload.pagination?.totalPages ||
                        action.payload.totalPages ||
                        0,
                };
            })
            .addCase(fetchAllActivities.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });

        // ===== FETCH USER ACTIVITIES =====
        builder
            .addCase(fetchUserActivity.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchUserActivity.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.activities.data = action.payload.data || [];
                state.activities.pagination = {
                    total: action.payload.pagination?.total || action.payload.total || 0,
                    page: action.payload.pagination?.page || action.payload.page || 1,
                    limit: action.payload.pagination?.limit || action.payload.limit || 10,
                    totalPages:
                        action.payload.pagination?.totalPages ||
                        action.payload.totalPages ||
                        0,
                };
            })
            .addCase(fetchUserActivity.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });

        // ===== FETCH COMMUNITY ACTIVITIES =====
        builder
            .addCase(fetchCommunityActivities.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchCommunityActivities.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.activities.data = action.payload.data || [];
                state.activities.pagination = {
                    total: action.payload.pagination?.total || action.payload.total || 0,
                    page: action.payload.pagination?.page || action.payload.page || 1,
                    limit: action.payload.pagination?.limit || action.payload.limit || 10,
                    totalPages:
                        action.payload.pagination?.totalPages ||
                        action.payload.totalPages ||
                        0,
                };
            })
            .addCase(fetchCommunityActivities.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });

        // ===== FETCH ACTIVITY BY ID =====
        builder
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
            });

        // ===== GET ACTIVITY STATS =====
        builder
            .addCase(getActivityStats.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(getActivityStats.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.stats = action.payload;
            })
            .addCase(getActivityStats.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });

        // ===== CREATE ACTIVITY =====
        builder
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
            });

        // ===== UPDATE ACTIVITY =====
        builder
            .addCase(updateExistingActivity.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateExistingActivity.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.activities.data.findIndex(
                    (act) => act._id === action.payload._id
                );
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
            });

        // ===== DELETE ACTIVITY =====
        builder
            .addCase(deleteExistingActivity.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteExistingActivity.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.activities.data = state.activities.data.filter(
                    (act) => act._id !== action.payload
                );
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
    deleteActivity,
    clearActivities,
    setError,
    clearError,
} = activitySlice.actions;

export const selectActivities = (state) => state.activities.activities.data;
export const selectActivityPagination = (state) => state.activities.activities.pagination;
export const selectCurrentActivity = (state) => state.activities.currentActivity;
export const selectActivityStatus = (state) => state.activities.status;
export const selectActivityError = (state) => state.activities.error;
export const selectActivityStats = (state) => state.activities.stats;
export const selectIsLoadingActivities = (state) => state.activities.status === 'loading';

export default activitySlice.reducer;