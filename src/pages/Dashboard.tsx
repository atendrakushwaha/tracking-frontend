import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSocketContext } from '../context/SocketContext';
import { setCurrentLocation, setSharing } from '../feature/location/locationSlice';
import type { RootState, AppDispatch } from '../store/store';
import Navbar from '../components/Navbar';
import LiveMap from '../components/LiveMap';

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const socket = useSocketContext();
  const { currentLocation, nearbyUsers, isSharing, notifications } = useSelector(
    (state: RootState) => state.location,
  );
  const { connected } = useSelector((state: RootState) => state.socket);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [shareResult, setShareResult] = useState<string | null>(null);

  // 🔥 GET LIVE LOCATION (watch continuously)
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (pos) => {
        dispatch(
          setCurrentLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }),
        );
        setLocationError(null);
      },
      (err) => {
        setLocationError(err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      },
    );

    return () => {
      navigator.geolocation.clearWatch(id);
    };
  }, [dispatch]);

  // 🔥 SHARE LOCATION
  const shareLocation = useCallback(() => {
    if (!currentLocation || !socket || !connected) return;

    dispatch(setSharing(true));
    setShareResult(null);

    socket.emit(
      'updateLocation',
      {
        latitude: currentLocation.lat,
        longitude: currentLocation.lng,
      },
      (response: any) => {
        dispatch(setSharing(false));
        if (response?.status === 'ok') {
          setShareResult(`Location shared! ${response.nearbyCount} users nearby.`);
        } else {
          setShareResult('Location shared!');
        }
        setTimeout(() => setShareResult(null), 4000);
      },
    );

    // Fallback if no callback
    setTimeout(() => dispatch(setSharing(false)), 3000);
  }, [currentLocation, socket, connected, dispatch]);

  // 🔥 AUTO SHARE every 30 seconds when enabled
  const [autoShare, setAutoShare] = useState(false);
  useEffect(() => {
    if (!autoShare || !connected) return;
    const interval = setInterval(shareLocation, 30000);
    return () => clearInterval(interval);
  }, [autoShare, connected, shareLocation]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4">
        {/* ──── MAP SECTION ──── */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Status Bar */}
          <div className="glass rounded-2xl px-5 py-3 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">📍 Lat:</span>
                <span className="text-slate-300 font-mono text-xs">
                  {currentLocation?.lat.toFixed(6) || '—'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-500">📍 Lng:</span>
                <span className="text-slate-300 font-mono text-xs">
                  {currentLocation?.lng.toFixed(6) || '—'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>Radius: 3 km</span>
              <span>•</span>
              <span>{nearbyUsers.length} nearby</span>
            </div>
          </div>

          {/* Location error */}
          {locationError && (
            <div className="px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-400 flex items-center gap-2">
              ⚠️ {locationError}
            </div>
          )}

          {/* Map */}
          <div className="flex-1 glass rounded-2xl overflow-hidden relative min-h-[300px] sm:min-h-[400px] lg:min-h-0">
            <LiveMap />
          </div>

          {/* Share Controls */}
          <div className="glass rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={shareLocation}
              disabled={!connected || !currentLocation || isSharing}
              className="flex-1 w-full sm:w-auto py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold rounded-xl transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 text-sm"
            >
              {isSharing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sharing...
                </>
              ) : (
                <>
                  🚀 Share My Location
                </>
              )}
            </button>

            {/* Auto Share Toggle */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={autoShare}
                  onChange={(e) => setAutoShare(e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-11 h-6 rounded-full transition-all duration-300 ${autoShare ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-all duration-300 translate-y-0.5 ${autoShare ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
                </div>
              </div>
              <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                Auto share (30s)
              </span>
            </label>

            {/* Share Result */}
            {shareResult && (
              <div className="text-sm text-emerald-400 flex items-center gap-1 notification-enter">
                ✅ {shareResult}
              </div>
            )}
          </div>
        </div>

        {/* ──── SIDEBAR: NEARBY USERS ──── */}
        <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-4">
          {/* Header */}
          <div className="glass rounded-2xl px-5 py-4">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
                👥 Nearby Users
              </h2>
              <span className="text-xs font-bold bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-lg">
                {nearbyUsers.length}
              </span>
            </div>
            <p className="text-xs text-slate-500">Users within 3 km radius</p>
          </div>

          {/* User List */}
          <div className="flex-1 glass rounded-2xl p-3 overflow-y-auto max-h-[calc(100vh-300px)]">
            {nearbyUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-3xl mb-4">
                  🔍
                </div>
                <p className="text-slate-400 text-sm font-medium">No nearby users</p>
                <p className="text-slate-600 text-xs mt-1">
                  Share your location to discover people nearby
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {nearbyUsers.map((user) => (
                  <div
                    key={user.userId}
                    className="p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-indigo-500/20 transition-all duration-300 notification-enter"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-red-500/20 flex-shrink-0">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-200 truncate">
                          {user.name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>

                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                            📏 {user.distance ? `${user.distance} km` : 'Calculating...'}
                          </span>
                          <span className="text-[10px] text-slate-600">
                            🕐 {new Date(user.timestamp).toLocaleTimeString()}
                          </span>
                        </div>

                        {/* Coordinates */}
                        <div className="mt-2 flex gap-2">
                          <span className="text-[10px] font-mono text-slate-600 bg-slate-800/50 px-1.5 py-0.5 rounded">
                            {user.latitude.toFixed(4)}
                          </span>
                          <span className="text-[10px] font-mono text-slate-600 bg-slate-800/50 px-1.5 py-0.5 rounded">
                            {user.longitude.toFixed(4)}
                          </span>
                        </div>
                      </div>

                      {/* Live indicator */}
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-[10px] text-emerald-400 font-medium">LIVE</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Notifications */}
          {notifications.length > 0 && (
            <div className="glass rounded-2xl p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Recent Activity
              </h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {notifications.slice(0, 5).map((notif) => (
                  <div key={notif.id} className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="text-indigo-400">•</span>
                    <span className="truncate flex-1">{notif.message}</span>
                    <span className="text-slate-600 flex-shrink-0">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
