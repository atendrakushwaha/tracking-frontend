import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { SocketContext } from './SocketContext';
import { useDispatch, useSelector } from 'react-redux';
import { setConnected } from '../feature/socket/socketSlice';
import { addNearbyUser, type NearbyUser } from '../feature/location/locationSlice';
import type { RootState } from '../store/store';

type Props = {
  children: React.ReactNode;
};

const SocketProvider = ({ children }: Props) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const dispatch = useDispatch();
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Disconnect existing socket
      if (socket) {
        socket.disconnect();
        setSocket(null);
        dispatch(setConnected(false));
      }
      return;
    }

    const newSocket = io(import.meta.env.VITE_BASE_URL, {
      auth: { token },
      withCredentials: true,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('🟢 Socket connected');
      dispatch(setConnected(true));
    });

    newSocket.on('disconnect', () => {
      console.log('🔴 Socket disconnected');
      dispatch(setConnected(false));
    });

    // 🔥 MAIN EVENT — nearby user alert
    newSocket.on('nearbyUserAlert', (data: NearbyUser) => {
      console.log('📍 Nearby user alert:', data);
      dispatch(addNearbyUser(data));
    });

    newSocket.on('connect_error', (err) => {
      console.log('⚠️ Socket connection error:', err.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, token, dispatch]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;