import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from './feature/auth/authSlice';
import type { RootState, AppDispatch } from './store/store';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Auto-login: check if token exists and fetch profile
  useEffect(() => {
    if (token && !isAuthenticated) {
      dispatch(getProfile());
    }
  }, [token, isAuthenticated, dispatch]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
