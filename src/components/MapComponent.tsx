import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// 🔥 IMPORT LOCAL IMAGES
import markerIcon from '../assets/leaflet/marker-icon.png';
import markerIcon2x from '../assets/leaflet/marker-icon-2x.png';
import markerShadow from '../assets/leaflet/marker-shadow.png';

// 🔥 FIX ICON
delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

type Props = {
  lat: number;
  lng: number;
  nearbyUsers: {
    userId: string;
    latitude: number;
    longitude: number;
  }[];
};

const MapComponent = ({ lat, lng, nearbyUsers }: Props) => {
  return (
    <MapContainer center={[lat, lng]} zoom={13} className="h-[400px] w-full rounded-xl">
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {/* 🟢 YOU */}
      <Marker position={[lat, lng]}>
        <Popup>You are here</Popup>
      </Marker>

      {/* 🔴 NEARBY */}
      {nearbyUsers.map((user) => (
        <Marker key={user.userId} position={[user.latitude, user.longitude]}>
          <Popup>Nearby User</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default MapComponent;