import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import eventReducer from './slices/eventSlice';
import communityReducer from './slices/communitySlice';
import communityManagerReducer from './slices/communityManagerSlice';
import impactReducer from './slices/impactSlice';
import notificationReducer from './slices/notificationSlice';
import photoReducer from './slices/photoSlice';
import adminReducer from './slices/adminSlice';
import verificationReducer from './slices/verificationSlice';
import participationReducer from './slices/participationSlice';
import ratingReducer from './slices/ratingSlice';
import resourceReducer from './slices/resourceSlice';
import resourceAdminReducer from './slices/resourceAdminSlice';
import activityReducer from './slices/activitySlice';
import locationReducer from './slices/locationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    event: eventReducer,
    community: communityReducer,
    communityManager: communityManagerReducer,
    impact: impactReducer,
    notification: notificationReducer,
    photo: photoReducer,
    admin: adminReducer,
    verification: verificationReducer,
    participation: participationReducer,
    rating: ratingReducer,
    resources: resourceReducer,
    resourceAdmin: resourceAdminReducer,
    activities: activityReducer,
    location: locationReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['notification/add'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['notification.items']
      }
    })
});

export default store;