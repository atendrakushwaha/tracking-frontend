import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const LiveMap = () => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const linesRef = useRef<Map<string, L.Polyline>>(new Map());
  const circleRef = useRef<L.Circle | null>(null);
  const currentMarkerRef = useRef<L.Marker | null>(null);
  const prevNearbyCountRef = useRef(0);

  const { currentLocation, nearbyUsers } = useSelector((state: RootState) => state.location);
  const { user } = useSelector((state: RootState) => state.auth);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const defaultLat = currentLocation?.lat || 23.2599;
    const defaultLng = currentLocation?.lng || 77.4126;

    const map = L.map(mapContainerRef.current, {
      center: [defaultLat, defaultLng],
      zoom: 14,
      zoomControl: true,
    });

    // Dark theme tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update current user marker + 3km radius circle
  useEffect(() => {
    if (!mapRef.current || !currentLocation) return;

    const { lat, lng } = currentLocation;
    const map = mapRef.current;

    // Remove old marker
    if (currentMarkerRef.current) {
      currentMarkerRef.current.remove();
    }

    // Current user marker (blue pulsing)
    const currentIcon = L.divIcon({
      className: '',
      html: '<div class="marker-current"></div>',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });

    currentMarkerRef.current = L.marker([lat, lng], { icon: currentIcon })
      .addTo(map)
      .bindPopup(`
        <div style="text-align:center;">
          <p style="font-weight:700;font-size:14px;margin-bottom:4px;">📍 You</p>
          <p style="color:#94a3b8;font-size:12px;">${user?.name || user?.email || 'Your Location'}</p>
          <p style="color:#64748b;font-size:11px;margin-top:4px;">${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
        </div>
      `);

    // 3km radius circle
    if (circleRef.current) {
      circleRef.current.remove();
    }
    circleRef.current = L.circle([lat, lng], {
      radius: 3000,
      color: '#6366f1',
      fillColor: '#6366f1',
      fillOpacity: 0.06,
      weight: 1.5,
      dashArray: '8, 6',
    }).addTo(map);

    map.setView([lat, lng], map.getZoom());
  }, [currentLocation, user]);

  // Update nearby user markers — auto-fit bounds and show connections
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const currentMarkers = markersRef.current;
    const currentLines = linesRef.current;
    const activeUserIds = new Set(nearbyUsers.map((u) => u.userId));

    // Remove markers & lines for users no longer nearby
    currentMarkers.forEach((marker, id) => {
      if (!activeUserIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    });
    currentLines.forEach((line, id) => {
      if (!activeUserIds.has(id)) {
        line.remove();
        currentLines.delete(id);
      }
    });

    // Detect if someone NEW appeared
    const isNewUser = nearbyUsers.length > prevNearbyCountRef.current;

    // Add/update nearby user markers
    nearbyUsers.forEach((nearbyUser) => {
      const nearbyIcon = L.divIcon({
        className: '',
        html: `
          <div class="marker-nearby-wrapper">
            <div class="marker-nearby"></div>
            <div class="marker-nearby-label">${(nearbyUser.name || nearbyUser.email).charAt(0).toUpperCase()}</div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const distText = nearbyUser.distance ? `${nearbyUser.distance} km away` : 'Nearby';
      const timeText = new Date(nearbyUser.timestamp).toLocaleTimeString();

      const popupContent = `
        <div style="min-width:200px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            <div style="width:36px;height:36px;background:linear-gradient(135deg,#ef4444,#f97316);border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:14px;flex-shrink:0;">
              ${(nearbyUser.name || nearbyUser.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <p style="font-weight:700;font-size:13px;line-height:1.3;margin:0;">${nearbyUser.name || 'User'}</p>
              <p style="color:#94a3b8;font-size:11px;line-height:1.3;margin:0;">${nearbyUser.email}</p>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;padding-top:8px;border-top:1px solid #334155;">
            <span style="color:#f59e0b;font-weight:600;font-size:12px;">📏 ${distText}</span>
            <span style="color:#64748b;font-size:11px;">🕐 ${timeText}</span>
          </div>
          <div style="margin-top:6px;display:flex;gap:6px;">
            <span style="font-size:10px;color:#64748b;background:#1e293b;padding:2px 6px;border-radius:4px;">${nearbyUser.latitude.toFixed(5)}</span>
            <span style="font-size:10px;color:#64748b;background:#1e293b;padding:2px 6px;border-radius:4px;">${nearbyUser.longitude.toFixed(5)}</span>
          </div>
        </div>
      `;

      if (currentMarkers.has(nearbyUser.userId)) {
        // Update position
        const marker = currentMarkers.get(nearbyUser.userId)!;
        marker.setLatLng([nearbyUser.latitude, nearbyUser.longitude]);
        marker.setPopupContent(popupContent);
      } else {
        // New marker
        const marker = L.marker([nearbyUser.latitude, nearbyUser.longitude], { icon: nearbyIcon })
          .addTo(map)
          .bindPopup(popupContent);
        currentMarkers.set(nearbyUser.userId, marker);

        // Auto-open popup for the newest marker
        if (isNewUser) {
          setTimeout(() => marker.openPopup(), 300);
        }
      }

      // Draw a dashed line from current user to this nearby user
      if (currentLocation) {
        if (currentLines.has(nearbyUser.userId)) {
          currentLines.get(nearbyUser.userId)!.setLatLngs([
            [currentLocation.lat, currentLocation.lng],
            [nearbyUser.latitude, nearbyUser.longitude],
          ]);
        } else {
          const line = L.polyline(
            [
              [currentLocation.lat, currentLocation.lng],
              [nearbyUser.latitude, nearbyUser.longitude],
            ],
            {
              color: '#6366f1',
              weight: 1.5,
              opacity: 0.4,
              dashArray: '6, 8',
            }
          ).addTo(map);
          currentLines.set(nearbyUser.userId, line);
        }
      }
    });

    // Auto-fit bounds to include all markers when a new user appears
    if (isNewUser && nearbyUsers.length > 0 && currentLocation) {
      const allPoints: [number, number][] = [
        [currentLocation.lat, currentLocation.lng],
        ...nearbyUsers.map((u) => [u.latitude, u.longitude] as [number, number]),
      ];
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }

    prevNearbyCountRef.current = nearbyUsers.length;
  }, [nearbyUsers, currentLocation]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full rounded-2xl overflow-hidden"
      style={{ minHeight: '400px' }}
    />
  );
};

export default LiveMap;
