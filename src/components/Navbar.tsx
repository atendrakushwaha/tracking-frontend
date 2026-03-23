import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../feature/auth/authSlice';
import { markAllRead } from '../feature/location/locationSlice';
import type { RootState, AppDispatch } from '../store/store';
import { useState } from 'react';

const Navbar = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { connected } = useSelector((state: RootState) => state.socket);
  const { unreadCount, notifications } = useSelector((state: RootState) => state.location);
  const [showNotif, setShowNotif] = useState(false);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const toggleNotifications = () => {
    setShowNotif(!showNotif);
    if (!showNotif) {
      dispatch(markAllRead());
    }
  };

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-3 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/20">
          📍
        </div>
        <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
          LiveTrack
        </h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Connection Status */}
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' : 'bg-red-400'}`} />
          <span className="text-slate-400 hidden sm:inline">
            {connected ? 'Live' : 'Offline'}
          </span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={toggleNotifications}
            className="relative p-2 rounded-xl hover:bg-white/5 transition-all duration-200"
          >
            <svg className="w-5 h-5 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center text-white animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotif && (
            <div className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto glass rounded-2xl shadow-2xl shadow-black/40 p-2 z-50">
              <p className="text-xs font-semibold text-slate-400 px-3 py-2 uppercase tracking-wider">
                Notifications
              </p>
              {notifications.length === 0 ? (
                <p className="text-sm text-slate-500 px-3 py-4 text-center">No notifications yet</p>
              ) : (
                notifications.slice(0, 20).map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-3 py-3 rounded-xl mb-1 transition-all duration-200 ${
                      notif.read ? 'hover:bg-white/5' : 'bg-indigo-500/10 hover:bg-indigo-500/15'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center flex-shrink-0 text-xs">
                        📍
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {notif.user.name || notif.user.email}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{notif.message}</p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {new Date(notif.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-700">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-500/20">
            {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-200 leading-tight">{user?.name || 'User'}</p>
            <p className="text-[11px] text-slate-500 leading-tight">{user?.email}</p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-xl hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all duration-200"
          title="Logout"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
