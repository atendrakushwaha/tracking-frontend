import axios from 'axios';
const baseURL = import.meta.env.VITE_BASE_URL || "https://tracking-backend-27mi.onrender.com";

export const api = axios.create({
  baseURL: `${baseURL}/api/v1`,
  withCredentials: true, // 🔥 cookie send
});