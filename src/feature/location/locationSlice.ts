import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// ─── TYPES ───
export interface NearbyUser {
  userId: string;
  email: string;
  name: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  distance?: number; // km
}

export interface Notification {
  id: string;
  user: NearbyUser;
  message: string;
  read: boolean;
  createdAt: string;
}

interface LocationState {
  currentLocation: { lat: number; lng: number } | null;
  nearbyUsers: NearbyUser[];
  notifications: Notification[];
  isSharing: boolean;
  unreadCount: number;
}

const initialState: LocationState = {
  currentLocation: null,
  nearbyUsers: [],
  notifications: [],
  isSharing: false,
  unreadCount: 0,
};

// ─── HELPERS ───
function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number,
): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

// ─── SLICE ───
const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setCurrentLocation: (state, action: PayloadAction<{ lat: number; lng: number }>) => {
      state.currentLocation = action.payload;
    },

    addNearbyUser: (state, action: PayloadAction<NearbyUser>) => {
      const user = action.payload;

      // Calculate distance from current location
      if (state.currentLocation) {
        user.distance = haversineDistance(
          state.currentLocation.lat,
          state.currentLocation.lng,
          user.latitude,
          user.longitude,
        );
      }

      // Update if exists, else add
      const existingIdx = state.nearbyUsers.findIndex((u) => u.userId === user.userId);
      if (existingIdx >= 0) {
        state.nearbyUsers[existingIdx] = user;
      } else {
        state.nearbyUsers.push(user);
      }

      // Add notification
      const notification: Notification = {
        id: `${user.userId}-${Date.now()}`,
        user,
        message: `${user.name || user.email} is ${user.distance ? user.distance + ' km' : 'nearby'} from you!`,
        read: false,
        createdAt: new Date().toISOString(),
      };
      state.notifications.unshift(notification);
      state.unreadCount += 1;
    },

    removeNearbyUser: (state, action: PayloadAction<string>) => {
      state.nearbyUsers = state.nearbyUsers.filter((u) => u.userId !== action.payload);
    },

    clearNearbyUsers: (state) => {
      state.nearbyUsers = [];
    },

    setSharing: (state, action: PayloadAction<boolean>) => {
      state.isSharing = action.payload;
    },

    markAllRead: (state) => {
      state.notifications.forEach((n) => (n.read = true));
      state.unreadCount = 0;
    },

    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  setCurrentLocation,
  addNearbyUser,
  removeNearbyUser,
  clearNearbyUsers,
  setSharing,
  markAllRead,
  clearNotifications,
} = locationSlice.actions;
export default locationSlice.reducer;
