import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import resumeReducer from './slices/resumeSlice';
import interviewReducer from './slices/interviewSlice';
import analyticsReducer from './slices/analyticsSlice';
import uiReducer from './slices/uiSlice';
import alumniAdminReducer from './slices/alumniAdminSlice';
import placementReportReducer from './slices/placementReportSlice';
import placementPredictionReducer from './slices/placementPredictionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    resume: resumeReducer,
    interview: interviewReducer,
    analytics: analyticsReducer,
    ui: uiReducer,
    alumniAdmin: alumniAdminReducer,
    placementReport: placementReportReducer,
    placementPrediction: placementPredictionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['interview/setMediaStream'],
        // Ignore these field paths in all actions
        ignoredActionPaths: ['payload.stream', 'payload.peer'],
        // Ignore these paths in the state
        ignoredPaths: ['interview.localStream', 'interview.peer'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
