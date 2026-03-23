
import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_BASE_URL || "https://tracking-backend-27mi.onrender.com" , {
  autoConnect: false,
});

console.log(import.meta.env.VITE_BASE_URL || "https://tracking-backend-27mi.onrender.com");