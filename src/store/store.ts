import { configureStore } from '@reduxjs/toolkit';
import socketReducer from '../feature/socket/socketSlice';
import authReducer from '../feature/auth/authSlice';
import locationReducer from '../feature/location/locationSlice';

export const store = configureStore({
  reducer: {
    socket: socketReducer,
    auth: authReducer,
    location: locationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;