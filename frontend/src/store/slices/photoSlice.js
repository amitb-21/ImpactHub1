import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { photoAPI } from '../../api/services';
import { toast } from 'react-toastify';


export const uploadEventPhoto = createAsyncThunk(
  'photo/upload',
  async ({ eventId, formData }, { rejectWithValue }) => {
    try {
      const response = await photoAPI.upload(eventId, formData);
      toast.success('Photo uploaded successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload photo';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

/**
 * Get all photos for an event
 * Covers: eventPhotoController.getEventPhotos
 */
export const fetchEventPhotos = createAsyncThunk(
  'photo/fetchEventPhotos',
  async ({ eventId, page = 1, photoType = null }, { rejectWithValue }) => {
    try {
      const response = await photoAPI.getPhotos(eventId, page);
      return {
        ...response.data,
        eventId,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

/**
 * Get photos by type
 * Covers: eventPhotoController.getPhotosByType
 */
export const fetchPhotosByType = createAsyncThunk(
  'photo/fetchByType',
  async ({ eventId, photoType }, { rejectWithValue }) => {
    try {
      const response = await photoAPI.getByType(eventId, photoType);
      return {
        ...response.data,
        photoType,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

/**
 * Get community photo gallery
 * Covers: eventPhotoController.getCommunityPhotoGallery
 */
export const fetchCommunityGallery = createAsyncThunk(
  'photo/fetchCommunityGallery',
  async ({ communityId, page = 1 }, { rejectWithValue }) => {
    try {
      const response = await photoAPI.getCommunityGallery(communityId, page);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

/**
 * Update photo description
 * Covers: eventPhotoController.updatePhotoDescription
 */
export const updatePhotoDescription = createAsyncThunk(
  'photo/updateDescription',
  async ({ photoId, description }, { rejectWithValue }) => {
    try {
      const response = await photoAPI.updateDescription(photoId, description);
      toast.success('Description updated successfully!');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update description';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

/**
 * Delete photo
 * Covers: eventPhotoController.deleteEventPhoto
 */
export const deletePhoto = createAsyncThunk(
  'photo/delete',
  async (photoId, { rejectWithValue }) => {
    try {
      await photoAPI.deletePhoto(photoId);
      toast.success('Photo deleted successfully!');
      return photoId;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete photo';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

/**
 * Like photo
 * Covers: eventPhotoController.likePhoto
 */
export const likePhoto = createAsyncThunk(
  'photo/like',
  async (photoId, { rejectWithValue }) => {
    try {
      const response = await photoAPI.likePhoto(photoId);
      return { photoId, likes: response.data.likes };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to like photo';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

/**
 * Unlike photo
 * Covers: eventPhotoController.unlikePhoto
 */
export const unlikePhoto = createAsyncThunk(
  'photo/unlike',
  async (photoId, { rejectWithValue }) => {
    try {
      const response = await photoAPI.unlikePhoto(photoId);
      return { photoId, likes: response.data.likes };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to unlike photo';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// =====================
// INITIAL STATE
// =====================

const initialState = {
  // Event photos
  eventPhotos: {
    data: [],
    pagination: null,
    eventId: null,
  },
  
  // Photos by type
  photosByType: {
    event_preview: [],
    during_event: [],
    after_event: [],
  },
  
  // Community gallery
  communityGallery: {
    data: [],
    pagination: null,
    communityId: null,
  },
  
  // Selected photo for lightbox/modal
  selectedPhoto: null,
  
  // Loading states
  isLoading: false,
  isUploading: false,
  isDeleting: false,
  
  // Error handling
  error: null,
};

// =====================
// SLICE
// =====================

const photoSlice = createSlice({
  name: 'photo',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    
    clearEventPhotos: (state) => {
      state.eventPhotos = { data: [], pagination: null, eventId: null };
    },
    
    clearCommunityGallery: (state) => {
      state.communityGallery = { data: [], pagination: null, communityId: null };
    },
    
    setSelectedPhoto: (state, action) => {
      state.selectedPhoto = action.payload;
    },
    
    clearSelectedPhoto: (state) => {
      state.selectedPhoto = null;
    },
    
    /**
     * Real-time photo upload notification from Socket.io
     * Covers: socketService.notifyEventPhotoUploaded
     */
    photoUploaded: (state, action) => {
      const { eventId, photo } = action.payload;
      
      // Add to event photos if currently viewing that event
      if (state.eventPhotos.eventId === eventId) {
        state.eventPhotos.data.unshift(photo);
      }
      
      // Add to photos by type
      if (photo.photoType && state.photosByType[photo.photoType]) {
        state.photosByType[photo.photoType].unshift(photo);
      }
    },
    
    /**
     * Update photo likes in real-time
     */
    updatePhotoLikes: (state, action) => {
      const { photoId, likes } = action.payload;
      
      // Update in event photos
      const eventPhotoIndex = state.eventPhotos.data.findIndex(p => p._id === photoId);
      if (eventPhotoIndex !== -1) {
        state.eventPhotos.data[eventPhotoIndex].likes = likes;
      }
      
      // Update in photos by type
      Object.keys(state.photosByType).forEach(type => {
        const typePhotoIndex = state.photosByType[type].findIndex(p => p._id === photoId);
        if (typePhotoIndex !== -1) {
          state.photosByType[type][typePhotoIndex].likes = likes;
        }
      });
      
      // Update in community gallery
      const galleryPhotoIndex = state.communityGallery.data.findIndex(p => p._id === photoId);
      if (galleryPhotoIndex !== -1) {
        state.communityGallery.data[galleryPhotoIndex].likes = likes;
      }
      
      // Update selected photo
      if (state.selectedPhoto?._id === photoId) {
        state.selectedPhoto.likes = likes;
      }
    },
  },
  
  extraReducers: (builder) => {
    builder
      // Upload photo
      .addCase(uploadEventPhoto.pending, (state) => {
        state.isUploading = true;
        state.error = null;
      })
      .addCase(uploadEventPhoto.fulfilled, (state, action) => {
        state.isUploading = false;
        const photo = action.payload.photo;
        
        // Add to event photos
        state.eventPhotos.data.unshift(photo);
        
        // Add to photos by type
        if (photo.photoType && state.photosByType[photo.photoType]) {
          state.photosByType[photo.photoType].unshift(photo);
        }
      })
      .addCase(uploadEventPhoto.rejected, (state, action) => {
        state.isUploading = false;
        state.error = action.payload;
      })
      
      // Fetch event photos
      .addCase(fetchEventPhotos.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEventPhotos.fulfilled, (state, action) => {
        state.isLoading = false;
        state.eventPhotos = {
          data: action.payload.data,
          pagination: action.payload.pagination,
          eventId: action.payload.eventId,
        };
      })
      .addCase(fetchEventPhotos.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch photos by type
      .addCase(fetchPhotosByType.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPhotosByType.fulfilled, (state, action) => {
        state.isLoading = false;
        const { photoType, data } = action.payload;
        if (state.photosByType[photoType]) {
          state.photosByType[photoType] = data;
        }
      })
      .addCase(fetchPhotosByType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch community gallery
      .addCase(fetchCommunityGallery.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCommunityGallery.fulfilled, (state, action) => {
        state.isLoading = false;
        state.communityGallery = {
          data: action.payload.data,
          pagination: action.payload.pagination,
          communityId: action.meta.arg.communityId,
        };
      })
      .addCase(fetchCommunityGallery.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update description
      .addCase(updatePhotoDescription.fulfilled, (state, action) => {
        const photo = action.payload.photo;
        
        // Update in event photos
        const eventPhotoIndex = state.eventPhotos.data.findIndex(p => p._id === photo._id);
        if (eventPhotoIndex !== -1) {
          state.eventPhotos.data[eventPhotoIndex] = photo;
        }
        
        // Update selected photo
        if (state.selectedPhoto?._id === photo._id) {
          state.selectedPhoto = photo;
        }
      })
      
      // Delete photo
      .addCase(deletePhoto.pending, (state) => {
        state.isDeleting = true;
      })
      .addCase(deletePhoto.fulfilled, (state, action) => {
        state.isDeleting = false;
        const photoId = action.payload;
        
        // Remove from event photos
        state.eventPhotos.data = state.eventPhotos.data.filter(p => p._id !== photoId);
        
        // Remove from photos by type
        Object.keys(state.photosByType).forEach(type => {
          state.photosByType[type] = state.photosByType[type].filter(p => p._id !== photoId);
        });
        
        // Remove from community gallery
        state.communityGallery.data = state.communityGallery.data.filter(p => p._id !== photoId);
        
        // Clear selected photo if deleted
        if (state.selectedPhoto?._id === photoId) {
          state.selectedPhoto = null;
        }
      })
      .addCase(deletePhoto.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload;
      })
      
      // Like photo
      .addCase(likePhoto.fulfilled, (state, action) => {
        const { photoId, likes } = action.payload;
        
        // Update likes count
        const updateLikes = (photo) => {
          if (photo._id === photoId) {
            photo.likes = likes;
          }
        };
        
        state.eventPhotos.data.forEach(updateLikes);
        Object.values(state.photosByType).forEach(photos => photos.forEach(updateLikes));
        state.communityGallery.data.forEach(updateLikes);
        
        if (state.selectedPhoto?._id === photoId) {
          state.selectedPhoto.likes = likes;
        }
      })
      
      // Unlike photo
      .addCase(unlikePhoto.fulfilled, (state, action) => {
        const { photoId, likes } = action.payload;
        
        // Update likes count (same logic as like)
        const updateLikes = (photo) => {
          if (photo._id === photoId) {
            photo.likes = likes;
          }
        };
        
        state.eventPhotos.data.forEach(updateLikes);
        Object.values(state.photosByType).forEach(photos => photos.forEach(updateLikes));
        state.communityGallery.data.forEach(updateLikes);
        
        if (state.selectedPhoto?._id === photoId) {
          state.selectedPhoto.likes = likes;
        }
      });
  },
});

export const {
  clearError,
  clearEventPhotos,
  clearCommunityGallery,
  setSelectedPhoto,
  clearSelectedPhoto,
  photoUploaded,
  updatePhotoLikes,
} = photoSlice.actions;

export default photoSlice.reducer;