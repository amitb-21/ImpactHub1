import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/client'; // Assuming apiClient is in api/client.js
import { toast } from 'react-toastify';

// Async Thunks
export const fetchAllResources = createAsyncThunk(
    'resources/fetchAll',
    async (filters = {}, { rejectWithValue }) => {
        try {
            // Pass filters as query params
            const response = await apiClient.get('/resources', { params: filters });
            return response.data; // { data, pagination }
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const fetchFeaturedResources = createAsyncThunk(
    'resources/fetchFeatured',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/resources/featured');
            return response.data.data; // API returns { success, data }
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
            return response.data.resource; // API returns { success, resource }
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
            toast.success('Resource submitted for admin review!'); // Add toast
            return response.data.resource; // API returns { success, message, resource }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create resource';
            toast.error(message); // Show error toast
            return rejectWithValue(message);
        }
    }
);

export const updateResource = createAsyncThunk(
    'resources/update',
    async ({ id, resourceData }, { rejectWithValue }) => {
        try {
            const response = await apiClient.put(`/resources/${id}`, resourceData);
            toast.success('Resource updated! Awaiting re-approval.'); // Add toast
            return response.data.resource; // API returns { success, message, resource }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update resource';
            toast.error(message); // Show error toast
            return rejectWithValue(message);
        }
    }
);

export const deleteResource = createAsyncThunk(
    'resources/delete',
    async (resourceId, { rejectWithValue }) => {
        try {
            await apiClient.delete(`/resources/${resourceId}`);
            toast.success('Resource deleted successfully!'); // Add toast
            return resourceId; // Return the id to remove from state
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete resource';
            toast.error(message); // Show error toast
            return rejectWithValue(message);
        }
    }
);

export const likeResource = createAsyncThunk(
    'resources/like',
    async (resourceId, { rejectWithValue, getState }) => {
        try {
            const response = await apiClient.post(`/resources/${resourceId}/like`);
            const { auth } = getState();
            return { resourceId, likes: response.data.likes, userId: auth.user._id }; // Pass userId for optimistic update
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to like');
            return rejectWithValue(error.response?.data?.message);
        }
    }
);

export const unlikeResource = createAsyncThunk(
    'resources/unlike',
    async (resourceId, { rejectWithValue, getState }) => {
        try {
            const response = await apiClient.post(`/resources/${resourceId}/unlike`);
            const { auth } = getState();
            return { resourceId, likes: response.data.likes, userId: auth.user._id }; // Pass userId for optimistic update
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to unlike');
            return rejectWithValue(error.response?.data?.message);
        }
    }
);

const initialState = {
    resources: {
        data: [],
        pagination: null,
    },
    featured: [],
    currentResource: null, // Will include all fields: rejectionReason, adminNotes, isFeatured, status, etc.
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
};

// Helper to update likes on a resource in any state list
const updateLikesInState = (state, resourceId, likes, userId, isLike) => {
    const listsToUpdate = [state.resources.data, state.featured];
    
    listsToUpdate.forEach(list => {
        if (!list) return;
        const index = list.findIndex(res => res._id === resourceId);
        if (index !== -1) {
            list[index].likes = likes;
            if (isLike) {
                list[index].likedBy.push(userId);
            } else {
                list[index].likedBy = list[index].likedBy.filter(id => id !== userId);
            }
        }
    });

    if (state.currentResource?._id === resourceId) {
        state.currentResource.likes = likes;
        if (isLike) {
            state.currentResource.likedBy.push(userId);
        } else {
            state.currentResource.likedBy = state.currentResource.likedBy.filter(id => id !== userId);
        }
    }
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
                state.resources.data = action.payload.data;
                state.resources.pagination = action.payload.pagination;
            })
            .addCase(fetchAllResources.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // fetchFeaturedResources
            .addCase(fetchFeaturedResources.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchFeaturedResources.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.featured = action.payload;
            })
            .addCase(fetchFeaturedResources.rejected, (state, action) => {
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
                // Don't add to main list, it's unpublished
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
                // Remove from all lists since it's now unpublished
                state.resources.data = state.resources.data.filter(res => res._id !== action.payload._id);
                state.featured = state.featured.filter(res => res._id !== action.payload._id);
                
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
                const resourceId = action.payload;
                state.resources.data = state.resources.data.filter(res => res._id !== resourceId);
                state.featured = state.featured.filter(res => res._id !== resourceId);
                 if (state.currentResource?._id === resourceId) {
                     state.currentResource = null;
                }
            })
            .addCase(deleteResource.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload;
            })
            // likeResource
            .addCase(likeResource.fulfilled, (state, action) => {
                const { resourceId, likes, userId } = action.payload;
                updateLikesInState(state, resourceId, likes, userId, true);
            })
            // unlikeResource
            .addCase(unlikeResource.fulfilled, (state, action) => {
                const { resourceId, likes, userId } = action.payload;
                updateLikesInState(state, resourceId, likes, userId, false);
            })
            
            // ADMIN ACTIONS from adminSlice
            .addCase(approveResource.fulfilled, (state, action) => {
                if (state.currentResource?._id === action.payload._id) {
                    state.currentResource = action.payload;
                }
            })
            .addCase(rejectResource.fulfilled, (state, action) => {
                if (state.currentResource?._id === action.payload._id) {
                    state.currentResource = action.payload;
                }
            })
            .addCase(toggleFeaturedResource.fulfilled, (state, action) => {
                 const { resourceId, isFeatured } = action.payload;
                 const index = state.resources.data.findIndex(r => r._id === resourceId);
                 if(index !== -1) {
                    state.resources.data[index].isFeatured = isFeatured;
                 }
                 if (state.currentResource?._id === resourceId) {
                    state.currentResource.isFeatured = isFeatured;
                 }
            });
    },
});

export const { resetResourceStatus, clearCurrentResource } = resourceSlice.actions;
export default resourceSlice.reducer;