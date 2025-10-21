import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/services';

// Async Thunks
export const fetchAllResources = createAsyncThunk(
    'resources/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/resources');
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchResourceById = createAsyncThunk(
    'resources/fetchById',
    async (resourceId, { rejectWithValue }) => {
        try {
            const response = await apiClient.get(`/resources/${resourceId}`);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const createResource = createAsyncThunk(
    'resources/create',
    async (resourceData, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/resources', resourceData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const updateResource = createAsyncThunk(
    'resources/update',
    async ({ id, resourceData }, { rejectWithValue }) => {
        try {
            const response = await apiClient.put(`/resources/${id}`, resourceData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const deleteResource = createAsyncThunk(
    'resources/delete',
    async (resourceId, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/resources/${resourceId}`);
            return resourceId; // Return the id to remove from state
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const initialState = {
    resources: [],
    currentResource: null,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

const resourceSlice = createSlice({
    name: 'resources',
    initialState,
    reducers: {
        resetResourceStatus: (state) => {
            state.status = 'idle';
            state.error = null;
        },
        clearCurrentResource: (state) => {
             state.currentResource = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // fetchAllResources
            .addCase(fetchAllResources.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchAllResources.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.resources = action.payload;
            })
            .addCase(fetchAllResources.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // fetchResourceById
            .addCase(fetchResourceById.pending, (state) => {
                state.status = 'loading';
                 state.currentResource = null;
                state.error = null;
            })
            .addCase(fetchResourceById.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentResource = action.payload;
            })
            .addCase(fetchResourceById.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
             // createResource
            .addCase(createResource.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(createResource.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Optionally add to state, or refetch list
                state.resources.push(action.payload);
                state.currentResource = action.payload;
            })
            .addCase(createResource.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
             // updateResource
            .addCase(updateResource.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(updateResource.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const index = state.resources.findIndex(res => res._id === action.payload._id);
                if (index !== -1) {
                    state.resources[index] = action.payload;
                }
                if (state.currentResource?._id === action.payload._id) {
                     state.currentResource = action.payload;
                }
            })
            .addCase(updateResource.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // deleteResource
             .addCase(deleteResource.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(deleteResource.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.resources = state.resources.filter(res => res._id !== action.payload);
                 if (state.currentResource?._id === action.payload) {
                     state.currentResource = null;
                }
            })
            .addCase(deleteResource.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            });
    },
});

export const { resetResourceStatus, clearCurrentResource } = resourceSlice.actions;
export default resourceSlice.reducer;