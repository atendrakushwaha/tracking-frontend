import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface SocketState {
  connected: boolean;
  alerts: any[];
}

const initialState: SocketState = {
  connected: false,
  alerts: [],
};

const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
    addAlert: (state, action) => {
      state.alerts.push(action.payload);
    },
    clearAlerts: (state) => {
      state.alerts = [];
    },
  },
});

export const { setConnected, addAlert, clearAlerts } = socketSlice.actions;
export default socketSlice.reducer;