import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import eventReducer from './slices/eventSlice';
import communityReducer from './slices/communitySlice';
import impactReducer from './slices/impactSlice';
import notificationReducer from './slices/notificationSlice';
import photoReducer from './slices/photoSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    event: eventReducer,
    community: communityReducer,
    impact: impactReducer,
    notification: notificationReducer,
    photo: photoReducer
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

