// import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
// import io from 'socket.io-client';
// import config from '../config';
// import { useAuth } from './AuthContext';
// import { toast } from 'react-toastify';

// const SocketContext = createContext();

// export const useSocket = () => {
//   const context = useContext(SocketContext);
//   if (!context) {
//     throw new Error('useSocket must be used within a SocketProvider');
//   }
//   return context;
// };

// export const SocketProvider = ({ children }) => {
//   const [socket, setSocket] = useState(null);
//   const [connected, setConnected] = useState(false);
//   const { user, token } = useAuth();

//   const connectSocket = useCallback(() => {
//     if (!token || !user) return;

//     // Initialize Socket with Auth token in handshake
//     const newSocket = io(config.SOCKET_URL || 'http://localhost:5000', {
//       transports: ['websocket'],
//       auth: { token }, 
//       reconnection: true,
//       reconnectionAttempts: 5,
//     });

//     newSocket.on('connect', () => {
//       console.log('✅ Socket Connected:', newSocket.id);
//       setConnected(true);
//       // Explicitly authenticate if required by your backend logic
//       newSocket.emit('authenticate', token);
//     });

//     // --- Dynamic Event Listeners ---

//     newSocket.on('newNotification', (notif) => {
//       toast.info(notif.title || 'New Alert');
//     });

//     newSocket.on('collectionAccepted', (data) => {
//       toast.success(`🚚 Your pickup has been accepted by ${data.collectorName}`);
//     });

//     newSocket.on('collectionCompleted', (data) => {
//       toast.success(`🎉 Collection Complete! +${data.coins} Eco-Coins added.`);
//     });

//     newSocket.on('newCollectionAvailable', () => {
//       if (user.role === 'collector') {
//         toast.info('🆕 New pickup request available in your zone!');
//       }
//     });

//     newSocket.on('disconnect', (reason) => {
//       console.log('🔴 Socket Disconnected:', reason);
//       setConnected(false);
//     });

//     newSocket.on('connect_error', (error) => {
//       console.error('❌ Connection Error:', error.message);
//       setConnected(false);
//     });

//     setSocket(newSocket);

//     return newSocket;
//   }, [token, user]);

//   useEffect(() => {
//     const socketInstance = connectSocket();

//     return () => {
//       if (socketInstance) {
//         console.log('🧹 Cleaning up socket connection...');
//         socketInstance.disconnect();
//       }
//     };
//   }, [connectSocket]);

//   // --- Helper Methods ---

//   const joinRoom = (roomName) => {
//     if (socket && connected) {
//       socket.emit('joinRoom', roomName);
//     }
//   };

//   const emitEvent = (eventName, data) => {
//     if (socket && connected) {
//       socket.emit(eventName, data);
//     }
//   };

//   const value = {
//     socket,
//     connected,
//     joinRoom,
//     emitEvent,
//     sendLocation: (loc) => emitEvent('sendLocation', loc),
//     joinCollectionRoom: (id) => joinRoom(`collection_${id}`),
//     joinProgramRoom: (id) => joinRoom(`program_${id}`)
//   };

//   return (
//     <SocketContext.Provider value={value}>
//       {children}
//     </SocketContext.Provider>
//   );
// };


import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const SocketContext = createContext(null);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within a SocketProvider');
  return ctx;
};

export const SocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [socket,    setSocket]    = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  // ── Connect / reconnect when token changes ────────────────
  useEffect(() => {
    // Disconnect existing socket when user logs out
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Already connected with same token — skip
    if (socketRef.current?.connected && socketRef.current._token === token) return;

    // Tear down old socket
    if (socketRef.current) socketRef.current.disconnect();

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    // Tag socket with token for de-dup check above
    newSocket._token = token;

    newSocket.on('connect', () => {
      console.log('✅ Socket connected:', newSocket.id);
      setConnected(true);
      newSocket.emit('authenticate', token);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔴 Socket disconnected:', reason);
      setConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('❌ Socket connect error:', err.message);
      setConnected(false);
    });

    // ── Global real-time event handlers ─────────────────────
    newSocket.on('newNotification', (notif) => {
      if (notif.priority === 'high') {
        toast.success(`${notif.title}: ${notif.message}`, { autoClose: 5000 });
      } else {
        toast.info(notif.title || 'New notification');
      }
    });

    newSocket.on('coinsAwarded', (data) => {
      toast.success(`🎉 +${data.coins} Eco-Coins earned!`, { autoClose: 4000 });
    });

    newSocket.on('applicationApproved', (data) => {
      toast.success(data.message || '🎉 Volunteer application approved!', { autoClose: 5000 });
    });

    newSocket.on('applicationRejected', (data) => {
      toast.info(data.message || 'Application status updated');
    });

    newSocket.on('new_assignment', () => {
      if (user?.role === 'collector') {
        toast.info('📦 New pickup assigned to you!');
      }
    });

    newSocket.on('new_collection_request', () => {
      if (user?.role === 'collector' || user?.role === 'admin') {
        toast.info('🆕 New pickup request in your zone!');
      }
    });

    newSocket.on('collection_updated', () => {
      // Consumed by individual pages that need to refresh
    });

    newSocket.on('payment_success', (data) => {
      toast.success('✅ Payment confirmed!');
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      socketRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ── Helper methods ────────────────────────────────────────
  const joinRoom = useCallback((roomName) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('joinRoom', roomName);
    }
  }, []);

  const emitEvent = useCallback((event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const value = {
    socket,
    connected,
    joinRoom,
    emitEvent,
    joinCollectionRoom: (id) => joinRoom(`collection_${id}`),
    joinProgramRoom:    (id) => {
      if (socketRef.current?.connected) {
        socketRef.current.emit('join-program-room', id);
      }
    },
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};