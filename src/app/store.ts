import { configureStore } from '@reduxjs/toolkit';
import jobRolesReducer from '@/features/jobRoles/jobRolesSlice';

export const store = configureStore({
  reducer: {
    jobRoles: jobRolesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 