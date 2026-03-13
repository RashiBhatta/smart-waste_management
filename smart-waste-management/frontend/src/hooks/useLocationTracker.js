import { useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const useLocationTracker = () => {
  const { socket, connected } = useSocket();
  const { user } = useAuth();
  const watchId = useRef(null);

  useEffect(() => {
    // Only track if user is a collector and socket is connected
    if (user?.role === 'collector' && socket && connected) {
      
      if (!navigator.geolocation) {
        console.error("Geolocation is not supported by this browser.");
        return;
      }

      console.log("📍 Starting location tracking for Collector...");

      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, heading, speed } = position.coords;

          // Send coordinates to Admin Map via Socket
          socket.emit('sendLocation', {
            collectorId: user._id,
            name: user.name,
            lat: latitude,
            lng: longitude,
            heading: heading || 0,
            speed: speed || 0
          });
        },
        (error) => {
          console.error("Location tracking error:", error.message);
        },
        {
          enableHighAccuracy: true, // Use GPS for better map precision
          timeout: 15000,
          maximumAge: 10000 // Don't use cached locations older than 10s
        }
      );
    }

    // Cleanup: Stop tracking when component unmounts or user logs out
    return () => {
      if (watchId.current !== null) {
        navigator.geolocation.clearWatch(watchId.current);
        console.log("🛑 Location tracking stopped.");
      }
    };
  }, [user, socket, connected]);

  return null; // This is a logic-only hook
};

export default useLocationTracker;