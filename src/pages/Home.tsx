import { useEffect, useState } from 'react';
import MapComponent from '../components/MapComponent';
import { useSocketContext } from '../context/SocketContext';

type UserLocation = {
  userId: string;
  latitude: number;
  longitude: number;
};

const Home = () => {
  const socket = useSocketContext();

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyUsers, setNearbyUsers] = useState<UserLocation[]>([]);

  // 🔥 GET USER LOCATION
  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;

      setLocation({ lat, lng });
    });
  }, []);

  // 🔥 SOCKET EVENTS
  useEffect(() => {
    if (!socket) return;

    socket.on('nearbyUserAlert', (data: UserLocation) => {
      console.log('Nearby user:', data);

      setNearbyUsers((prev) => {
        const exists = prev.find((u) => u.userId === data.userId);
        if (exists) return prev;
        return [...prev, data];
      });
    });

    return () => {
      socket.off('nearbyUserAlert');
    };
  }, [socket]);

  // 🔥 SEND LOCATION
  const sendLocation = () => {
    if (!location || !socket) return;

    socket.emit('updateLocation', {
      latitude: location.lat,
      longitude: location.lng,
    });
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Live Location App</h1>

      {location && (
        <>
          <MapComponent
            lat={location.lat}
            lng={location.lng}
            nearbyUsers={nearbyUsers}
          />

          <button
            onClick={sendLocation}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Share Location 🚀
          </button>
        </>
      )}
    </div>
  );
};

export default Home;